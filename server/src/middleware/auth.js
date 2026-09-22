import jwt from "jsonwebtoken";
import config from "../config.js";
import { findIn } from "../store.js";
import { logger } from "./logger.js";

const jwtOptions = {
  issuer: config.jwt.issuer,
  audience: config.jwt.audience,
};

export function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user.id), username: user.username, role: user.role, permissions: user.permissions },
    config.jwt.secret,
    { ...jwtOptions, expiresIn: config.jwt.accessExpiresIn }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: String(user.id), type: "refresh" },
    config.jwt.refreshSecret,
    { ...jwtOptions, expiresIn: config.jwt.refreshExpiresIn }
  );
}

/** Express middleware: authenticates via Authorization: Bearer <token>, or ?token= (for WS handshakes / GET /auth/me compat). */
export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
  const token = bearer || req.query.token || req.body?.token;

  if (!token) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  try {
    const payload = verifyAccess(token);
    const user = findIn("users", (u) => String(u.id) === payload.sub);
    if (!user || !user.is_active) {
      return res.status(401).json({ detail: "User not found or inactive" });
    }
    req.user = user;
    req.authPayload = payload;
    return next();
  } catch (err) {
    logger.debug("auth_failed", { error: err.message });
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

function verifyAccess(token) {
  return jwt.verify(token, config.jwt.secret, jwtOptions);
}

export function verifyRefresh(token) {
  const payload = jwt.verify(token, config.jwt.refreshSecret, jwtOptions);
  if (payload.type !== "refresh") throw new Error("Not a refresh token");
  return payload;
}

/** RBAC guard factory: requireRole("admin"), requireRole("supervisor", "admin"). */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ detail: "Not authenticated" });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ detail: `Requires role: ${roles.join(" or ")}` });
    }
    next();
  };
}

/** permission guard: requirePermission("manage_cameras") */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ detail: "Not authenticated" });
    if (!req.user.permissions?.includes(permission)) {
      return res.status(403).json({ detail: `Missing permission: ${permission}` });
    }
    next();
  };
}

/** Optional auth: attaches req.user if a valid token exists, never blocks. Used by WS and public read endpoints. */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.query.token;
  if (token) {
    try {
      const payload = verifyAccess(token);
      req.user = findIn("users", (u) => String(u.id) === payload.sub) || null;
    } catch {
      req.user = null;
    }
  }
  next();
}
