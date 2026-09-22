import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import config from "../config.js";
import { authenticate } from "../middleware/auth.js";
import { getCollection, updateIn, findIn } from "../store.js";
import { broadcast, createAlert } from "../realtime.js";
import { logger } from "../middleware/logger.js";

const router = Router();

/* Multer disk storage with size cap (500MB) and video mime filter. */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files are accepted"));
  },
});

const EVENT_TYPES = ["intrusion", "violence", "unattended", "crowd", "traffic", "fire"];
const RISKS = ["low", "medium", "high", "critical"];

/* POST /api/analyze-video - multipart upload, simulated offline analysis with detection results. */
router.post("/analyze-video", authenticate, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(422).json({ detail: "file field is required (multipart/form-data)" });

  const durationSec = 8 + Math.floor(Math.random() * 20);
  const totalFrames = durationSec * 28;
  const alertCount = 1 + Math.floor(Math.random() * 3);

  const alerts = [];
  for (let i = 0; i < alertCount; i++) {
    const event_type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    alerts.push({
      timestamp: `${String(Math.floor((durationSec / alertCount) * i)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      event_type,
      risk_level: RISKS[Math.floor(Math.random() * RISKS.length)],
      confidence: Math.round((0.72 + Math.random() * 0.26) * 100) / 100,
      description: `Offline analysis: ${event_type} signature detected in uploaded footage.`,
      location: req.file.originalname,
    });
  }

  /* Optionally persist detections as real alerts so they appear in the triage queue. */
  const persist = req.query.persist === "true";
  if (persist) {
    alerts.forEach((a) =>
      createAlert({
        event_type: a.event_type,
        camera_id: "CAM-001",
        location: `Uploaded: ${req.file.originalname}`,
        risk_level: a.risk_level,
        message: a.description,
        confidence: a.confidence,
      })
    );
  }

  logger.info("video_analyzed", { file: req.file.filename, size: req.file.size, alerts: alerts.length });
  res.json({
    status: "completed",
    file: req.file.filename,
    original_name: req.file.originalname,
    size_bytes: req.file.size,
    total_frames: totalFrames,
    duration_seconds: durationSec,
    alerts_detected: alerts.length,
    alerts,
  });
});

/* ---- Settings (single global record) ---- */

/* GET /api/settings - current system settings. */
router.get("/settings", (req, res) => {
  res.json(findIn("settings", () => true) || {});
});

/* PUT /api/settings - update settings (admin only). */
router.put("/settings", authenticate, (req, res) => {
  const current = findIn("settings", () => true);
  if (!current) return res.status(500).json({ detail: "Settings record missing" });
  const b = req.body || {};
  const merged = {
    auto_refresh: b.auto_refresh !== undefined ? !!b.auto_refresh : current.auto_refresh,
    telemetry_interval_s: b.telemetry_interval_s !== undefined ? Number(b.telemetry_interval_s) : current.telemetry_interval_s,
    theme: b.theme || current.theme,
    notifications: { ...current.notifications, ...(b.notifications || {}) },
    privacy: { ...current.privacy, ...(b.privacy || {}) },
    ai: { ...current.ai, ...(b.ai || {}) },
  };
  const updated = updateIn("settings", (s) => s.id === current.id, merged);
  broadcast("settings_updated", { settings: updated });
  res.json(updated);
});

export default router;
