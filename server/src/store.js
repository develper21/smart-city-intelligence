import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import config from "./config.js";
import { logger } from "./middleware/logger.js";

/**
 * Lightweight JSON-file persistence layer (zero external DB dependency).
 * Collections are loaded lazily, mutated in memory and flushed to disk
 * atomically (tmp file + rename) after writes.
 */
const COLLECTIONS = ["users", "cameras", "alerts", "events", "operators", "settings"];
const store = new Map();
const timers = new Map();

function fileFor(name) {
  return path.join(config.dataDir, `${name}.json`);
}

function seedDate(hoursAgo) {
  return new Date(Date.now() - hoursAgo * 3600_000).toISOString();
}

function seedUsers() {
  const now = new Date().toISOString();
  return [
    {
      id: 1,
      username: "admin",
      email: "rathore.v@intel.smartcity.gov",
      passwordHash: bcrypt.hashSync("admin123", 10),
      name: "Commander Vikram Rathore",
      role: "admin",
      permissions: ["view", "acknowledge", "resolve", "dispatch", "manage_users", "manage_cameras", "configure_ai"],
      is_active: true,
      last_login: null,
      created_at: now,
    },
    {
      id: 2,
      username: "supervisor",
      email: "sneha.reddy@command.smartcity.gov",
      passwordHash: bcrypt.hashSync("supervisor123", 10),
      name: "Sneha Reddy",
      role: "supervisor",
      permissions: ["view", "acknowledge", "resolve", "dispatch", "manage_users"],
      is_active: true,
      last_login: null,
      created_at: now,
    },
    {
      id: 3,
      username: "operator",
      email: "rajesh.k@command.smartcity.gov",
      passwordHash: bcrypt.hashSync("operator123", 10),
      name: "Rajesh Kumar",
      role: "operator",
      permissions: ["view", "acknowledge"],
      is_active: true,
      last_login: null,
      created_at: now,
    },
  ];
}

function seedCameras() {
  const thumbs = [
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop",
  ];
  const rows = [
    ["CAM-001", "Main Gate Entrance", "Sector 12, Gate A", "online", "Zone A", "rtsp://civic.local/stream/cam001", 28.6139, 77.209],
    ["CAM-002", "Market Square", "Central Market, Block B", "online", "Zone B", "rtsp://civic.local/stream/cam002", 28.6229, 77.219],
    ["CAM-003", "Highway Junction", "NH-44 Intersection", "warning", "Zone C", "rtsp://civic.local/stream/cam003", 28.6039, 77.229],
    ["CAM-004", "Railway Station", "Platform 3-4", "online", "Zone A", "rtsp://civic.local/stream/cam004", 28.6339, 77.199],
    ["CAM-005", "City Park", "Central Park, North", "offline", "Zone D", "rtsp://civic.local/stream/cam005", 28.6289, 77.179],
    ["CAM-006", "Bus Terminal", "ISBT Terminal A", "online", "Zone B", "rtsp://civic.local/stream/cam006", 28.6189, 77.239],
  ];
  return rows.map(([camera_id, name, location, status, zone, rtsp_url, lat, lng], i) => ({
    id: i + 1,
    camera_id,
    name,
    location,
    status,
    zone,
    rtsp_url,
    lat,
    lng,
    ptz_config: { pan: 0, tilt: 0, zoom: 1 },
    thumbnail_path: thumbs[i],
    created_at: seedDate(24 * (i + 1)),
    updated_at: seedDate(1),
  }));
}

function seedAlerts() {
  const rows = [
    ["intrusion", "Sector 12, Gate A", "CAM-001", "critical", "Unauthorized entry detected at restricted area", "active", 1.5],
    ["crowd", "Central Market, Block B", "CAM-002", "high", "Unusual crowd gathering detected", "investigating", 3.5],
    ["unattended", "Railway Station Platform 3", "CAM-004", "high", "Unattended bag detected near platform", "active", 5.75],
    ["traffic", "NH-44 Intersection", "CAM-003", "medium", "Traffic congestion detected, possible accident", "investigating", 8],
    ["violence", "Bus Terminal A", "CAM-006", "critical", "Physical altercation detected", "active", 10.25],
    ["fire", "Industrial Zone, Building 4", "CAM-003", "critical", "Smoke and heat signature detected", "resolved", 24],
    ["intrusion", "Central Park North Fence", "CAM-005", "low", "Perimeter loitering detected after hours", "resolved", 30],
    ["crowd", "Metro Station Gate 2", "CAM-004", "medium", "Crowd density above safe threshold", "resolved", 47],
  ];
  return rows.map(([event_type, location, camera_id, risk_level, message, status, hoursAgo], i) => ({
    id: i + 1,
    event_type,
    camera_id,
    location,
    risk_level,
    message,
    confidence: Math.round((0.72 + Math.random() * 0.25) * 100) / 100,
    status,
    acknowledged: status !== "active",
    acknowledged_by: status !== "active" ? "operator" : null,
    acknowledged_time: status !== "active" ? seedDate(hoursAgo - 0.2) : null,
    resolved: status === "resolved",
    alert_time: seedDate(hoursAgo),
  }));
}

function seedEvents() {
  const types = ["intrusion", "violence", "unattended", "crowd", "traffic", "fire"];
  const out = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date(Date.now() - d * 24 * 3600_000);
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    out.push({
      id: `day-${d}`,
      date: label,
      iso_date: date.toISOString().slice(0, 10),
      incidents: 12 + Math.floor(Math.random() * 14),
      resolved: 8 + Math.floor(Math.random() * 14),
    });
  }
  for (let h = 0; h < 24; h += 2) {
    out.push({
      id: `hour-${h}`,
      hour: `${String(h).padStart(2, "0")}:00`,
      incidents: [3, 2, 1, 5, 12, 18, 15, 14, 20, 25, 16, 8][h / 2],
    });
  }
  const dist = { Intrusion: 45, Violence: 23, Unattended: 38, Crowd: 52, Traffic: 67, Fire: 12 };
  Object.entries(dist).forEach(([type, count], i) => {
    out.push({ id: `type-${i}`, type, count });
  });
  return out;
}

function seedOperators() {
  const rows = [
    ["OP-4091", "Rajesh Kumar", "Operator", "Urban CCTV Command Unit", "CSD-8842", "online", "Zone A - North District", 12],
    ["SUP-1022", "Sneha Reddy", "Supervisor", "Emergency Response Bureau", "ERB-3091", "online", "All City Sectors", 34],
    ["ADM-001", "Vikram Rathore", "System Admin", "Civil Protection & Cyber Intel", "INT-0001", "on_break", "Metropolitan Command Core", 7],
    ["OP-5110", "Amir Khan", "Tactical Dispatcher", "Highway & Traffic Interceptor Unit", "HTI-2210", "offline", "Zone C - Highway", 21],
    ["OP-6215", "Priya Nair", "Senior Operator", "Metro Rapid Transit Security", "MRT-1145", "online", "Zone D - Metro", 18],
  ];
  const avatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
  ];
  return rows.map(([badge, name, role, department, unit, status, zone, alertsHandled], i) => ({
    id: i + 1,
    badge,
    name,
    role,
    department,
    unit,
    status,
    zone,
    alerts_handled: alertsHandled,
    avatar: avatars[i],
    last_active: seedDate(i * 2 + 0.5),
  }));
}

const DEFAULT_SETTINGS = {
  id: "global",
  auto_refresh: true,
  telemetry_interval_s: 15,
  theme: "light",
  notifications: { desktop: true, siren_volume: 0.8, email_relay: true, sms_relay: false },
  privacy: { face_anonymization: true, plate_masking: true, retention_days: 60 },
  ai: { model: "yolov8n.pt", confidence_threshold: 0.45, crowd_proximity_px: 120, simulation_enabled: true },
};

function seedCollection(name) {
  switch (name) {
    case "users": return seedUsers();
    case "cameras": return seedCameras();
    case "alerts": return seedAlerts();
    case "events": return seedEvents();
    case "operators": return seedOperators();
    case "settings": return [DEFAULT_SETTINGS];
    default: return [];
  }
}

export function initStore() {
  fs.mkdirSync(config.dataDir, { recursive: true });
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  for (const name of COLLECTIONS) {
    const file = fileFor(name);
    if (fs.existsSync(file)) {
      try {
        store.set(name, JSON.parse(fs.readFileSync(file, "utf-8")));
        logger.info("store_loaded", { collection: name });
        continue;
      } catch (err) {
        logger.warn("store_corrupt_reseeding", { collection: name, error: err.message });
      }
    }
    store.set(name, seedCollection(name));
    flush(name);
    logger.info("store_seeded", { collection: name });
  }
}

function flush(name) {
  const file = fileFor(name);
  const tmp = `${file}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store.get(name), null, 2));
  fs.renameSync(tmp, file);
}

/** Debounced persist so bursty writes don't thrash the disk. */
export function save(name) {
  clearTimeout(timers.get(name));
  timers.set(
    name,
    setTimeout(() => {
      try {
        flush(name);
      } catch (err) {
        logger.error("store_flush_failed", { collection: name, error: err.message });
      }
    }, 150)
  );
}

/** Clear pending debounced flushes (graceful shutdown / test teardown). */
export function disposeStore() {
  for (const [, t] of timers) clearTimeout(t);
  timers.clear();
}

export function getCollection(name) {
  return store.get(name);
}

export function nextId(name) {
  const rows = store.get(name) || [];
  return rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
}

export function findIn(name, predicate) {
  return (store.get(name) || []).find(predicate);
}

export function filterIn(name, predicate) {
  return (store.get(name) || []).filter(predicate);
}

export function insert(name, row) {
  const rows = store.get(name);
  rows.push(row);
  save(name);
  return row;
}

export function updateIn(name, predicate, patch) {
  const rows = store.get(name) || [];
  let updated = null;
  for (let i = 0; i < rows.length; i++) {
    if (predicate(rows[i], i)) {
      rows[i] = { ...rows[i], ...patch };
      updated = rows[i];
    }
  }
  if (updated) save(name);
  return updated;
}

export function removeFrom(name, predicate) {
  const rows = store.get(name) || [];
  const before = rows.length;
  const kept = rows.filter((r) => !predicate(r));
  store.set(name, kept);
  if (kept.length !== before) save(name);
  return before - kept.length;
}
