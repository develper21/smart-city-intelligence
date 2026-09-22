import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth.js";
import { getCollection, findIn, insert, updateIn, removeFrom, nextId } from "../store.js";
import { broadcast } from "../realtime.js";

const router = Router();

const VALID_STATUS = ["online", "offline", "warning"];

/* GET /api/cameras?status&zone - list cameras with optional filters (public read). */
router.get("/", (req, res) => {
  const q = req.query;
  let rows = getCollection("cameras");
  if (q.status) rows = rows.filter((c) => c.status === q.status);
  if (q.zone) rows = rows.filter((c) => c.zone === q.zone);
  res.json(rows);
});

/* GET /api/cameras/by-id/:cameraId - lookup by string id like CAM-001 (before /:id). */
router.get("/by-id/:cameraId", (req, res) => {
  const cam = findIn("cameras", (c) => c.camera_id === req.params.cameraId);
  if (!cam) return res.status(404).json({ detail: "Camera not found" });
  res.json(cam);
});

/* GET /api/cameras/:id - numeric id lookup. */
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ detail: "Numeric id required" });
  const cam = findIn("cameras", (c) => c.id === id);
  if (!cam) return res.status(404).json({ detail: "Camera not found" });
  res.json(cam);
});

/* GET /api/cameras/:id/history - last 20 alerts for this camera. */
router.get("/:id/history", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cam = findIn("cameras", (c) => c.id === id);
  if (!cam) return res.status(404).json({ detail: "Camera not found" });
  const alerts = getCollection("alerts")
    .filter((a) => a.camera_id === cam.camera_id)
    .sort((a, b) => new Date(b.alert_time) - new Date(a.alert_time))
    .slice(0, 20);
  res.json({ camera: cam, alerts });
});

/* POST /api/cameras - provision a camera (manage_cameras permission). */
router.post("/", authenticate, requirePermission("manage_cameras"), (req, res) => {
  const b = req.body || {};
  if (!b.camera_id || !b.name || !b.location || !b.zone) {
    return res.status(422).json({ detail: "camera_id, name, location, zone are required" });
  }
  if (findIn("cameras", (c) => c.camera_id === b.camera_id)) {
    return res.status(409).json({ detail: "camera_id already exists" });
  }
  const now = new Date().toISOString();
  const cam = {
    id: nextId("cameras"),
    camera_id: b.camera_id,
    name: b.name,
    location: b.location,
    zone: b.zone,
    status: VALID_STATUS.includes(b.status) ? b.status : "online",
    rtsp_url: b.rtsp_url || null,
    lat: b.lat !== undefined ? Number(b.lat) : null,
    lng: b.lng !== undefined ? Number(b.lng) : null,
    ptz_config: b.ptz_config || { pan: 0, tilt: 0, zoom: 1 },
    thumbnail_path: b.thumbnail_path || null,
    created_at: now,
    updated_at: now,
  };
  insert("cameras", cam);
  broadcast("camera_created", { camera: cam });
  res.status(201).json(cam);
});

/* PUT /api/cameras/:id - update camera metadata. */
router.put("/:id", authenticate, requirePermission("manage_cameras"), (req, res) => {
  const b = req.body || {};
  const id = parseInt(req.params.id, 10);
  const patch = {};
  for (const k of ["name", "location", "zone", "status", "rtsp_url", "lat", "lng", "ptz_config", "thumbnail_path"]) {
    if (b[k] !== undefined) patch[k] = b[k];
  }
  if (patch.status && !VALID_STATUS.includes(patch.status)) {
    return res.status(422).json({ detail: "status must be online, offline or warning" });
  }
  patch.updated_at = new Date().toISOString();
  const cam = updateIn("cameras", (c) => c.id === id, patch);
  if (!cam) return res.status(404).json({ detail: "Camera not found" });
  broadcast("camera_updated", { camera: cam });
  res.json(cam);
});

/* DELETE /api/cameras/:id - de-provision a camera. */
router.delete("/:id", authenticate, requirePermission("manage_cameras"), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cam = findIn("cameras", (c) => c.id === id);
  if (!cam) return res.status(404).json({ detail: "Camera not found" });
  removeFrom("cameras", (c) => c.id === id);
  broadcast("camera_deleted", { id, camera_id: cam.camera_id });
  res.json({ message: "Camera deleted", camera_id: cam.camera_id });
});

/* POST /api/cameras/:id/ptz - pan/tilt/zoom control. */
router.post("/:id/ptz", authenticate, requirePermission("acknowledge"), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cam = findIn("cameras", (c) => c.id === id);
  if (!cam) return res.status(404).json({ detail: "Camera not found" });
  const b = req.body || {};
  const ptz = {
    pan: typeof b.pan === "number" ? b.pan : (cam.ptz_config ? cam.ptz_config.pan : 0),
    tilt: typeof b.tilt === "number" ? b.tilt : (cam.ptz_config ? cam.ptz_config.tilt : 0),
    zoom: typeof b.zoom === "number" ? b.zoom : (cam.ptz_config ? cam.ptz_config.zoom : 1),
  };
  const updated = updateIn("cameras", (c) => c.id === id, { ptz_config: ptz, updated_at: new Date().toISOString() });
  broadcast("camera_ptz", { camera_id: cam.camera_id, ptz_config: ptz });
  res.json({ message: "PTZ updated", ptz_config: updated.ptz_config });
});

export default router;
