import { Router } from "express";
import bcrypt from "bcryptjs";
import config from "../config.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
  authenticate,
  requireRole,
} from "../middleware/auth.js";
import { findIn, filterIn, insert, updateIn, nextId } from "../store.js";
import { logger } from "../middleware/logger.js";

const router = Router();

function parseDuration(d) {
  const m = String(d).match(/^(\d+)([smhd])$/);
  if (!m) return 900;
  const mult = { s: 1, m: 60, h: 3600, d: 86400 }[m[2]];
  return parseInt(m[1], 10) * mult;
}

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.name,
    role: u.role,
    permissions: u.permissions,
    is_active: u.is_active,
    last_login: u.last_login || null,
  };
}

function issueTokens(user) {
  return {
    access_token: signAccessToken(user),
    refresh_token: signRefreshToken(user),
    token_type: "bearer",
    expires_in: parseDuration(config.jwt.accessExpiresIn),
    user: publicUser(user),
  };
}

/** POST /api/auth/register — public officer provisioning (signup page). */
router.post("/register", (req, res) => {
  const { username, email, password, role = "operator", name, department, zone } = req.body || {};
  if (!username || !email || !password) {
    return res.status(422).json({ detail: "username, email and password are required" });
  }
  if (findIn("users", (u) => u.username === username || u.email === email)) {
    return res.status(409).json({ detail: "Username or email already registered" });
  }
  const user = {
    id: nextId("users"),
    username,
    email,
    name: name || username,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    permissions:
      role === "admin"
        ? ["view", "acknowledge", "resolve", "dispatch", "manage_users", "manage_cameras", "configure_ai"]
        : role === "supervisor"
          ? ["view", "acknowledge", "resolve", "dispatch", "manage_users"]
          : ["view", "acknowledge"],
    badge: (req.body && req.body.badge) || username.toUpperCase(),
    department: department || "Urban CCTV Command Unit",
    zone: zone || "Sector 1 (Metropolitan)",
    is_active: true,
    last_login: null,
    created_at: new Date().toISOString(),
  };
  insert("users", user);
  logger.info("user_registered", { username, role });
  res.status(201).json({ message: "User registered successfully", user: publicUser(user) });
});

/** POST /api/auth/login — username OR email + password. */
router.post("/login", (req, res) => {
  const body = req.body || {};
  const username = body.username;
  const email = body.email;
  const password = body.password;
  if (!password || (!username && !email)) {
    return res.status(422).json({ detail: "username/email and password are required" });
  }
  const user = findIn("users", (u) =>
    (username && u.username === username) || (email && u.email === email)
  );
  if (!user || !user.is_active || !bcrypt.compareSync(password, user.passwordHash)) {
    logger.warn("login_failed", { username: username || email });
    return res.status(401).json({ detail: "Incorrect username or password" });
  }
  updateIn("users", (u) => u.id === user.id, { last_login: new Date().toISOString() });
  logger.info("login_success", { username: user.username });
  res.json(issueTokens(user));
});

/** POST /api/auth/refresh — exchange refresh token for a new access token. */
router.post("/refresh", (req, res) => {
  const refreshToken = (req.body || {}).refresh_token;
  if (!refreshToken) {
    return res.status(422).json({ detail: "refresh_token is required" });
  }
  try {
    const payload = verifyRefresh(refreshToken);
    const user = findIn("users", (u) => String(u.id) === payload.sub);
    if (!user || !user.is_active) {
      return res.status(401).json({ detail: "User inactive" });
    }
    return res.json({
      access_token: signAccessToken(user),
      token_type: "bearer",
      expires_in: parseDuration(config.jwt.accessExpiresIn),
    });
  } catch {
    return res.status(401).json({ detail: "Invalid refresh token" });
  }
});

/** POST /api/auth/logout — stateless JWT: client discards tokens; endpoint kept for contract parity. */
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

/** GET /api/auth/me — current operator profile (Bearer header or ?token= for legacy compat). */
router.get("/me", authenticate, (req, res) => {
  res.json(publicUser(req.user));
});

/** PUT /api/auth/me — update own profile fields. */
router.put("/me", authenticate, (req, res) => {
  const allowed = ["name", "email", "department", "zone"];
  const patch = {};
  for (const k of allowed) {
    if (req.body && req.body[k] !== undefined) patch[k] = req.body[k];
  }
  const updated = updateIn("users", (u) => u.id === req.user.id, patch);
  res.json(publicUser(updated));
});

/** PUT /api/auth/me/password — change own password (requires current password). */
router.put("/me/password", authenticate, (req, res) => {
  const current = (req.body || {}).current_password;
  const next = (req.body || {}).new_password;
  if (!current || !next) {
    return res.status(422).json({ detail: "current_password and new_password are required" });
  }
  if (!bcrypt.compareSync(current, req.user.passwordHash)) {
    return res.status(401).json({ detail: "Current password incorrect" });
  }
  updateIn("users", (u) => u.id === req.user.id, { passwordHash: bcrypt.hashSync(next, 10) });
  res.json({ message: "Password updated successfully" });
});

/** GET /api/auth/users — operator directory (admin/supervisor only). */
router.get("/users", authenticate, requireRole("admin", "supervisor"), (req, res) => {
  res.json(filterIn("users", () => true).map(publicUser));
});

export default router;
