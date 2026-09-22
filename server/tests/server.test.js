import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, "..");

process.env.DATA_DIR = path.join(serverDir, ".test-data");
process.env.UPLOADS_DIR = path.join(serverDir, ".test-uploads");
process.env.PORT = "0";
process.env.ALERT_SIMULATION = "false";
process.env.NODE_ENV = "test";

const { default: app } = await import("../src/index.js");
const { disposeStore } = await import("../src/store.js");

const BASE = "http://localhost";
let PORT = 0;
let token = "";

async function req(method, url, { body, auth, headers } = {}) {
  const h = { ...(headers || {}) };
  if (body !== undefined) h["Content-Type"] = "application/json";
  if (auth) h["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}:${PORT}${url}`, {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}

before(async () => {
  await new Promise((resolve) => {
    const server = app.listen(0, () => {
      PORT = server.address().port;
      resolve();
    });
    globalThis.__testServer = server;
  });
  const login = await req("POST", "/api/auth/login", {
    body: { username: "admin", password: "admin123" },
  });
  token = login.json.access_token;
});

after(() => {
  disposeStore();
  if (globalThis.__testServer) globalThis.__testServer.close();
  fs.rmSync(path.join(serverDir, ".test-data"), { recursive: true, force: true });
  fs.rmSync(path.join(serverDir, ".test-uploads"), { recursive: true, force: true });
});

describe("Health & System", () => {
  it("GET /api/health returns ok", async () => {
    const r = await req("GET", "/api/health");
    assert.equal(r.status, 200);
    assert.equal(r.json.status, "ok");
  });

  it("GET /api/system-status returns metrics", async () => {
    const r = await req("GET", "/api/system-status");
    assert.equal(r.status, 200);
    assert.equal(r.json.status, "operational");
    assert.ok(r.json.metrics);
  });
});

describe("Auth", () => {
  it("login with valid credentials returns tokens", async () => {
    const r = await req("POST", "/api/auth/login", {
      body: { email: "rajesh.k@command.smartcity.gov", password: "operator123" },
    });
    assert.equal(r.status, 200);
    assert.ok(r.json.access_token);
    assert.equal(r.json.user.role, "operator");
  });

  it("login with bad password returns 401", async () => {
    const r = await req("POST", "/api/auth/login", {
      body: { username: "admin", password: "nope" },
    });
    assert.equal(r.status, 401);
  });

  it("GET /api/auth/me requires token", async () => {
    const noAuth = await req("GET", "/api/auth/me");
    assert.equal(noAuth.status, 401);
    const withAuth = await req("GET", "/api/auth/me", { auth: true });
    assert.equal(withAuth.status, 200);
    assert.equal(withAuth.json.username, "admin");
  });

  it("refresh token issues new access token", async () => {
    const login = await req("POST", "/api/auth/login", {
      body: { username: "admin", password: "admin123" },
    });
    const r = await req("POST", "/api/auth/refresh", {
      body: { refresh_token: login.json.refresh_token },
    });
    assert.equal(r.status, 200);
    assert.ok(r.json.access_token);
  });
});

describe("RBAC", () => {
  it("operator cannot resolve alerts", async () => {
    const login = await req("POST", "/api/auth/login", {
      body: { username: "operator", password: "operator123" },
    });
    const saved = token;
    token = login.json.access_token;
    const r = await req("PUT", "/api/alerts/999/resolve", { auth: true });
    token = saved;
    assert.equal(r.status, 403);
  });

  it("camera create requires manage_cameras", async () => {
    const login = await req("POST", "/api/auth/login", {
      body: { username: "operator", password: "operator123" },
    });
    const saved = token;
    token = login.json.access_token;
    const r = await req("POST", "/api/cameras", {
      auth: true,
      body: { camera_id: "CAM-X", name: "x", location: "y", zone: "Zone A" },
    });
    token = saved;
    assert.equal(r.status, 403);
  });
});

describe("Alerts", () => {
  it("list returns paginated alerts", async () => {
    const r = await req("GET", "/api/alerts?limit=5");
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.json.alerts));
    assert.ok(r.json.total >= r.json.alerts.length);
  });

  it("filter by risk_level", async () => {
    const r = await req("GET", "/api/alerts?risk_level=critical");
    assert.equal(r.status, 200);
    r.json.alerts.forEach((a) => assert.equal(a.risk_level, "critical"));
  });

  it("acknowledge and resolve flow", async () => {
    const list = await req("GET", "/api/alerts?limit=1");
    const id = list.json.alerts[0].id;
    const ack = await req("PUT", `/api/alerts/${id}/acknowledge?acknowledged_by=admin`, { auth: true });
    assert.equal(ack.status, 200);
    assert.equal(ack.json.alert.acknowledged, true);
    const res = await req("PUT", `/api/alerts/${id}/resolve?acknowledged_by=admin`, { auth: true });
    assert.equal(res.status, 200);
    assert.equal(res.json.alert.status, "resolved");
  });

  it("404 for unknown alert", async () => {
    const r = await req("GET", "/api/alerts/99999");
    assert.equal(r.status, 404);
  });
});

describe("Cameras", () => {
  it("list and by-id lookup", async () => {
    const list = await req("GET", "/api/cameras");
    assert.equal(list.status, 200);
    assert.ok(list.json.length >= 6);
    const one = await req("GET", "/api/cameras/by-id/CAM-001");
    assert.equal(one.status, 200);
    assert.equal(one.json.camera_id, "CAM-001");
  });

  it("create, ptz, delete as admin", async () => {
    const create = await req("POST", "/api/cameras", {
      auth: true,
      body: { camera_id: "CAM-TEST", name: "Test", location: "Loc", zone: "Zone A" },
    });
    assert.equal(create.status, 201);
    const ptz = await req("POST", `/api/cameras/${create.json.id}/ptz`, {
      auth: true,
      body: { pan: 5, zoom: 2 },
    });
    assert.equal(ptz.status, 200);
    assert.equal(ptz.json.ptz_config.zoom, 2);
    const del = await req("DELETE", `/api/cameras/${create.json.id}`, { auth: true });
    assert.equal(del.status, 200);
  });

  it("duplicate camera_id returns 409", async () => {
    const r = await req("POST", "/api/cameras", {
      auth: true,
      body: { camera_id: "CAM-001", name: "dup", location: "x", zone: "Zone A" },
    });
    assert.equal(r.status, 409);
  });
});

describe("Analytics", () => {
  it("summary KPIs", async () => {
    const r = await req("GET", "/api/analytics/summary");
    assert.equal(r.status, 200);
    assert.ok(r.json.total_cameras > 0);
  });

  it("incidents-over-time default 7 days", async () => {
    const r = await req("GET", "/api/analytics/incidents-over-time");
    assert.equal(r.status, 200);
    assert.equal(r.json.data.length, 7);
  });

  it("map-pins only unresolved", async () => {
    const r = await req("GET", "/api/analytics/map-pins");
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.json.pins));
  });
});

describe("Streams & Settings", () => {
  it("start/stop stream lifecycle", async () => {
    const start = await req("POST", "/api/start-stream?stream_id=t1&source=rtsp://x&location=Loc");
    assert.equal(start.status, 200);
    assert.equal(start.json.success, true);
    const stop = await req("POST", "/api/stop-stream?stream_id=t1");
    assert.equal(stop.status, 200);
  });

  it("settings get and update", async () => {
    const get = await req("GET", "/api/settings");
    assert.equal(get.status, 200);
    const put = await req("PUT", "/api/settings", {
      auth: true,
      body: { telemetry_interval_s: 30 },
    });
    assert.equal(put.status, 200);
    assert.equal(put.json.telemetry_interval_s, 30);
  });
});
