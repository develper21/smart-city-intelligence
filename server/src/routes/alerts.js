import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { getCollection, findIn, updateIn } from "../store.js";
import { broadcast, createAlert } from "../realtime.js";

const router = Router();

function parseBool(v) {
  return String(v) === "true";
}

/* GET /api/alerts - list with filters and pagination */
router.get("/", (req, res) => {
  const q = req.query;
  let rows = getCollection("alerts");

  if (q.risk_level) rows = rows.filter((a) => a.risk_level === q.risk_level);
  if (q.event_type) rows = rows.filter((a) => a.event_type === q.event_type);
  if (q.status) rows = rows.filter((a) => a.status === q.status);
  if (q.acknowledged !== undefined) rows = rows.filter((a) => a.acknowledged === parseBool(q.acknowledged));
  if (q.camera_id) rows = rows.filter((a) => a.camera_id === q.camera_id);

  const total = rows.length;
  const limit = Math.min(parseInt(q.limit || "50", 10) || 50, 500);
  const offset = parseInt(q.offset || "0", 10) || 0;
  const sorted = rows.slice().sort((a, b) => new Date(b.alert_time) - new Date(a.alert_time));
  const page = sorted.slice(offset, offset + limit);

  res.json({ alerts: page, total, limit, offset });
});

/* GET /api/alerts/summary - counts for badges */
router.get("/summary", (req, res) => {
  const rows = getCollection("alerts");
  const byRisk = { low: 0, medium: 0, high: 0, critical: 0 };
  const byStatus = { active: 0, investigating: 0, resolved: 0 };
  rows.forEach((a) => {
    byRisk[a.risk_level] = (byRisk[a.risk_level] || 0) + 1;
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
  });
  res.json({ by_risk: byRisk, by_status: byStatus, total: rows.length });
});

/* GET /api/alerts/:id - single alert */
router.get("/:id", (req, res) => {
  const alert = findIn("alerts", (a) => a.id === parseInt(req.params.id, 10));
  if (!alert) return res.status(404).json({ detail: "Alert not found" });
  res.json(alert);
});

/* PUT /api/alerts/:id/acknowledge - mark as acknowledged */
router.put("/:id/acknowledge", authenticate, requirePermission("acknowledge"), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const alert = findIn("alerts", (a) => a.id === id);
  if (!alert) return res.status(404).json({ detail: "Alert not found" });

  const now = new Date().toISOString();
  const updated = updateIn("alerts", (a) => a.id === id, {
    acknowledged: true,
    acknowledged_by: req.query.acknowledged_by || req.user.username,
    acknowledged_time: now,
    status: alert.status === "resolved" ? "resolved" : "investigating",
  });
  broadcast("alert_updated", { alert: updated });
  res.json({ message: "Alert acknowledged", alert: updated });
});

/* PUT /api/alerts/:id/resolve - mark as resolved */
router.put("/:id/resolve", authenticate, requirePermission("resolve"), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const alert = findIn("alerts", (a) => a.id === id);
  if (!alert) return res.status(404).json({ detail: "Alert not found" });

  const now = new Date().toISOString();
  const updated = updateIn("alerts", (a) => a.id === id, {
    acknowledged: true,
    acknowledged_by: req.query.acknowledged_by || req.user.username,
    acknowledged_time: now,
    status: "resolved",
    resolved: true,
    resolved_time: now,
  });
  broadcast("alert_updated", { alert: updated });

  /* camera back to online when its last active warning is cleared */
  const others = getCollection("alerts").some(
    (a) => a.camera_id === updated.camera_id && a.status === "active" && a.id !== id
  );
  if (!others) {
    updateIn(
      "cameras",
      (c) => c.camera_id === updated.camera_id && c.status === "warning",
      { status: "online", updated_at: now }
    );
  }
  res.json({ message: "Alert resolved", alert: updated });
});

/* POST /api/alerts/bulk-resolve - resolve many at once */
router.post("/bulk-resolve", authenticate, requirePermission("resolve"), (req, res) => {
  const ids = Array.isArray((req.body || {}).alert_ids) ? req.body.alert_ids : [];
  const now = new Date().toISOString();
  let count = 0;
  ids.forEach((id) => {
    const updated = updateIn(
      "alerts",
      (a) => a.id === Number(id) && a.status !== "resolved",
      {
        status: "resolved",
        resolved: true,
        acknowledged: true,
        acknowledged_by: req.query.acknowledged_by || req.user.username,
        acknowledged_time: now,
        resolved_time: now,
      }
    );
    if (updated) {
      count++;
      broadcast("alert_updated", { alert: updated });
    }
  });
  res.json({ message: "Bulk resolve complete", count });
});

/* POST /api/alerts - manually raise an alert (dispatch drills, integrations) */
router.post("/", authenticate, (req, res) => {
  const b = req.body || {};
  if (!b.event_type || !b.message) {
    return res.status(422).json({ detail: "event_type and message are required" });
  }
  const alert = createAlert({
    event_type: b.event_type,
    camera_id: b.camera_id || "CAM-001",
    location: b.location || "Unknown",
    risk_level: b.risk_level || "medium",
    message: b.message,
    confidence: typeof b.confidence === "number" ? b.confidence : 0.9,
  });
  res.status(201).json(alert);
});

export default router;
