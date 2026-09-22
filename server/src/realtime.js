import { WebSocketServer } from "ws";
import crypto from "crypto";
import config from "./config.js";
import { logger } from "./middleware/logger.js";
import { getCollection, insert, updateIn, nextId, findIn } from "./store.js";

const clients = new Set();

export function initWebSocket(server) {
  const wss = new WebSocketServer({ path: "/ws", server });

  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    ws.on("close", () => clients.delete(ws));
    ws.on("error", () => clients.delete(ws));

    ws.send(
      JSON.stringify({
        type: "system_status",
        payload: { status: "connected", clients: clients.size, timestamp: new Date().toISOString() },
      })
    );
    logger.info("ws_client_connected", { total: clients.size });
  });

  // Heartbeat to prune dead connections
  const interval = setInterval(() => {
    for (const ws of clients) {
      if (!ws.isAlive) {
        ws.terminate();
        clients.delete(ws);
        continue;
      }
      ws.isAlive = false;
      try {
        ws.ping();
      } catch {
        clients.delete(ws);
      }
    }
  }, 30000);

  wss.on("close", () => clearInterval(interval));
  logger.info("ws_server_ready", { path: "/ws" });
  return wss;
}

/** Broadcast a JSON message to every connected frontend. */
export function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  for (const ws of clients) {
    if (ws.readyState === 1) {
      try {
        ws.send(message);
      } catch {
        clients.delete(ws);
      }
    }
  }
  if (clients.size > 0) logger.debug("ws_broadcast", { type, clients: clients.size });
}

/** Create an alert (DB write + WS broadcast) — used by the simulator and API-triggered detections. */
export function createAlert({ event_type, camera_id, location, risk_level, message, confidence = 0.9 }) {
  const now = new Date().toISOString();
  const alert = {
    id: nextId("alerts"),
    event_type,
    camera_id,
    location,
    risk_level,
    message,
    confidence,
    status: "active",
    acknowledged: false,
    acknowledged_by: null,
    acknowledged_time: null,
    resolved: false,
    alert_time: now,
  };
  insert("alerts", alert);
  broadcast("new_alert", { alert });

  const camera = findIn("cameras", (c) => c.camera_id === camera_id);
  if (camera && camera.status === "online") {
    updateIn("cameras", (c) => c.camera_id === camera_id, { status: "warning", updated_at: now });
    broadcast("camera_status", { camera_id, status: "warning", updated_at: now });
  }
  return alert;
}

/** Background AI-detection simulator. Mirrors the frontend "Simulate Alert" drill feature. */
export function startAlertSimulation() {
  if (!config.simulation.enabled) {
    logger.info("alert_simulation_disabled");
    return null;
  }

  const TYPES = ["intrusion", "violence", "unattended", "crowd", "traffic", "fire"];
  const RISKS = ["low", "medium", "high", "critical"];
  const LOCATIONS = [
    "Sector 14 - Metro Station Gate 2",
    "City Center Mall - Main Plaza",
    "Express Highway Flyover Km 12",
    "North Industrial Warehouse 3B",
    "Central Park - Amphitheater",
  ];

  const timer = setInterval(() => {
    const cameras = getCollection("cameras") || [];
    const online = cameras.filter((c) => c.status !== "offline");
    const camera = online.length > 0 ? online[Math.floor(Math.random() * online.length)] : null;
    const event_type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const risk_level = RISKS[Math.floor(Math.random() * RISKS.length)];
    const location = camera ? camera.location : LOCATIONS[0];

    createAlert({
      event_type,
      camera_id: camera ? camera.camera_id : "CAM-001",
      location,
      risk_level,
      message: `Automated AI trigger: ${event_type} event flagged with high confidence.`,
      confidence: Math.round((0.7 + Math.random() * 0.28) * 100) / 100,
    });
  }, config.simulation.intervalMs);

  logger.info("alert_simulation_started", { intervalMs: config.simulation.intervalMs });
  return timer;
}
