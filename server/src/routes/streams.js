import { Router } from "express";
import crypto from "crypto";
import { authenticate, requirePermission, optionalAuth } from "../middleware/auth.js";
import { findIn, updateIn, getCollection } from "../store.js";
import { broadcast } from "../realtime.js";

const router = Router();

/* In-memory stream registry (RTSP pull simulation). */
const streams = new Map();

/* GET /api/system-status - aggregate status consumed by Dashboard polling. */
router.get("/system-status", optionalAuth, (req, res) => {
  const cams = getCollection("cameras");
  const uptime = Math.floor(process.uptime());
  const streamList = {};
  streams.forEach((s, id) => {
    streamList[id] = {
      source: s.source,
      location: s.location,
      frame_count: s.frame_count,
      fps: s.fps,
      last_alert_time: s.last_alert_time,
      is_active: s.is_active,
    };
  });
  res.json({
    status: "operational",
    model_loaded: true,
    active_connections: streams.size,
    timestamp: new Date().toISOString(),
    metrics: {
      is_running: true,
      active_streams: streams.size,
      frames_processed: Array.from(streams.values()).reduce((sum, s) => sum + s.frame_count, 0),
      alerts_generated: getCollection("alerts").length,
      avg_processing_time: 34,
      fps: streams.size > 0 ? 28.4 : 0,
      uptime_seconds: uptime,
    },
    cameras: {
      total: cams.length,
      online: cams.filter((c) => c.status === "online").length,
      offline: cams.filter((c) => c.status === "offline").length,
      warning: cams.filter((c) => c.status === "warning").length,
    },
    streams: streamList,
  });
});

/* POST /api/start-stream?stream_id&source&location - attach a stream. */
router.post("/start-stream", optionalAuth, (req, res) => {
  const q = req.query;
  const b = req.body || {};
  const streamId = q.stream_id || b.stream_id;
  const source = q.source || b.source;
  if (!streamId || !source) {
    return res.status(422).json({ detail: "stream_id and source are required" });
  }
  const now = Date.now();
  streams.set(streamId, {
    source,
    location: q.location || b.location || "Unknown",
    frame_count: 0,
    fps: 24 + Math.random() * 6,
    last_alert_time: 0,
    is_active: true,
    started_at: now,
  });
  broadcast("stream_started", { stream_id: streamId, source });
  res.json({ success: true, message: `Stream ${streamId} started` });
});

/* POST /api/stop-stream?stream_id - detach a stream. */
router.post("/stop-stream", optionalAuth, (req, res) => {
  const id = req.query.stream_id || (req.body || {}).stream_id;
  if (!id || !streams.has(id)) {
    return res.status(404).json({ detail: "Stream not found" });
  }
  streams.delete(id);
  broadcast("stream_stopped", { stream_id: id });
  res.json({ success: true, message: `Stream ${id} stopped` });
});

/* GET /api/streams - list active streams. */
router.get("/streams", optionalAuth, (req, res) => {
  const list = {};
  streams.forEach((s, id) => {
    list[id] = {
      source: s.source,
      location: s.location,
      frame_count: s.frame_count,
      fps: Math.round(s.fps),
      last_alert_time: s.last_alert_time,
      is_active: s.is_active,
    };
  });
  res.json({ streams: list, total: streams.size });
});

/* Frame counter: advances active streams to look alive (unref so tests can exit). */
const frameTimer = setInterval(() => {
  streams.forEach((s) => {
    if (s.is_active) s.frame_count += Math.floor(s.fps);
  });
}, 1000);
frameTimer.unref();

export default router;
