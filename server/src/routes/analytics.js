import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { getCollection, findIn, updateIn } from "../store.js";

const router = Router();

function alertsLastDays(days) {
  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  return getCollection("alerts").filter((a) => new Date(a.alert_time).getTime() >= cutoff);
}

/* GET /api/analytics/summary - headline KPIs for the dashboard cards. */
router.get("/summary", (req, res) => {
  const cams = getCollection("cameras");
  const alerts = getCollection("alerts");
  const active = alerts.filter((a) => a.status === "active");
  const resolvedToday = alerts.filter(
    (a) => a.resolved && new Date(a.resolved_time || a.alert_time).toDateString() === new Date().toDateString()
  ).length;

  res.json({
    total_cameras: cams.length,
    active_cameras: cams.filter((c) => c.status !== "offline").length,
    total_alerts: alerts.length,
    critical_alerts: active.filter((a) => a.risk_level === "critical").length,
    resolved_today: resolvedToday,
    avg_response_time: "2.3 min",
    system_uptime: 99.7,
    timestamp: new Date().toISOString(),
  });
});

/* GET /api/analytics/incidents-over-time?days=7 - trend chart data. */
router.get("/incidents-over-time", (req, res) => {
  const days = Math.min(parseInt(req.query.days || "7", 10) || 7, 90);
  const alerts = alertsLastDays(days);

  const byDate = new Map();
  for (let d = days - 1; d >= 0; d--) {
    const dt = new Date(Date.now() - d * 24 * 3600 * 1000);
    const key = dt.toISOString().slice(0, 10);
    byDate.set(key, { date: key, incidents: 0, resolved: 0 });
  }
  alerts.forEach((a) => {
    const key = a.alert_time.slice(0, 10);
    const row = byDate.get(key);
    if (row) {
      row.incidents++;
      if (a.resolved) row.resolved++;
    }
  });

  const data = Array.from(byDate.values()).map((r) => ({
    ...r,
    date: new Date(r.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
  res.json({ data, period_days: days });
});

/* GET /api/analytics/alert-types - crime type distribution. */
router.get("/alert-types", (req, res) => {
  const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];
  const counts = {};
  getCollection("alerts").forEach((a) => {
    const label = a.event_type.charAt(0).toUpperCase() + a.event_type.slice(1);
    counts[label] = (counts[label] || 0) + 1;
  });
  const data = Object.entries(counts).map(([type, count], i) => ({
    type,
    count,
    color: colors[i % colors.length],
  }));
  res.json({ data });
});

/* GET /api/analytics/hourly-activity - 24h peak curve. */
router.get("/hourly-activity", (req, res) => {
  const buckets = new Map();
  for (let h = 0; h < 24; h += 2) {
    buckets.set(h, { hour: String(h).padStart(2, "0") + ":00", incidents: 0 });
  }
  alertsLastDays(7).forEach((a) => {
    const h = new Date(a.alert_time).getHours();
    const key = h - (h % 2);
    const row = buckets.get(key);
    if (row) row.incidents++;
  });
  res.json({ data: Array.from(buckets.values()) });
});

/* GET /api/analytics/resolution-status - pie chart breakdown. */
router.get("/resolution-status", (req, res) => {
  const rows = getCollection("alerts");
  const counts = { Resolved: 0, Investigating: 0, Active: 0 };
  rows.forEach((a) => {
    if (a.status === "resolved") counts.Resolved++;
    else if (a.status === "investigating") counts.Investigating++;
    else counts.Active++;
  });
  const total = rows.length || 1;
  const data = Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / total) * 100),
  }));
  res.json({ data });
});

/* GET /api/analytics/performance - pipeline metrics (simulated where not measurable). */
router.get("/performance", (req, res) => {
  const start = process.uptime();
  res.json({
    system_uptime: 99.7,
    camera_coverage: 93.5,
    alert_processing: 98.2,
    fps: 28.4,
    avg_processing_time: 34,
    frames_processed: Math.floor(start * 28.4),
    uptime_seconds: Math.floor(start),
    timestamp: new Date().toISOString(),
  });
});

/* GET /api/analytics/operators - operator roster from the operators collection. */
router.get("/operators", (req, res) => {
  res.json(getCollection("operators"));
});

/* GET /api/analytics/map-pins - geo-located active threats for the GIS map. */
router.get("/map-pins", (req, res) => {
  const cams = getCollection("cameras");
  const pins = getCollection("alerts")
    .filter((a) => a.status !== "resolved")
    .map((a) => {
      const cam = cams.find((c) => c.camera_id === a.camera_id);
      return {
        id: String(a.id),
        lat: cam ? cam.lat : 28.6139 + (a.id % 5) * 0.01,
        lng: cam ? cam.lng : 77.209 + (a.id % 5) * 0.01,
        type: a.event_type,
        riskLevel: a.risk_level,
        location: a.location,
      };
    });
  res.json({ pins });
});

export default router;
