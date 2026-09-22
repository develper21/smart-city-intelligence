import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { findIn, updateIn } from "../store.js";
import { broadcast } from "../realtime.js";

const router = Router();

/* GET /api/settings - current global system settings (public read). */
router.get("/", (req, res) => {
  res.json(findIn("settings", () => true) || {});
});

/* PUT /api/settings - update settings (admin only). */
router.put("/", authenticate, (req, res) => {
  const user = req.user;
  if (user.role !== "admin") {
    return res.status(403).json({ detail: "Requires role: admin" });
  }
  const current = findIn("settings", () => true);
  if (!current) return res.status(500).json({ detail: "Settings record missing" });
  const b = req.body || {};
  const merged = {
    auto_refresh: b.auto_refresh !== undefined ? !!b.auto_refresh : current.auto_refresh,
    telemetry_interval_s:
      b.telemetry_interval_s !== undefined ? Number(b.telemetry_interval_s) : current.telemetry_interval_s,
    notifications: { ...current.notifications, ...(b.notifications || {}) },
    privacy: { ...current.privacy, ...(b.privacy || {}) },
    ai: { ...current.ai, ...(b.ai || {}) },
  };
  const updated = updateIn("settings", (s) => s.id === current.id, merged);
  broadcast("settings_updated", { settings: updated });
  res.json(updated);
});

export default router;
