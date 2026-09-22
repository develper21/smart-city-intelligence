# CIVIC-AI Backend Server

Node.js + Express backend jo CIVIC-AI Smart City Surveillance frontend ko power karta hai — REST API, JWT authentication, WebSocket real-time alerts, aur offline AI-detection simulation.

## Tech Stack

- **Express 4** — REST API server
- **ws** — WebSocket gateway (`/ws`) real-time alert broadcast ke liye
- **jsonwebtoken + bcryptjs** — JWT access/refresh tokens aur password hashing
- **multer** — video upload handling (`/api/analyze-video`)
- **helmet + cors + morgan** — security headers, origin whitelist, request logging
- **JSON file store** — zero-dependency persistence (`server/data/*.json`, atomic writes)

## Quick Start

```bash
cd server
npm install
cp .env.example .env      # (optional) defaults already work in dev
npm run dev               # node --watch src/index.js
```

Server `http://localhost:8000` par start hota hai. Frontend (`src/services/api.ts`) isi port ko expect karta hai.

## Demo Credentials

| Username     | Password       | Role       |
|--------------|----------------|------------|
| `admin`      | `admin123`     | System Admin |
| `supervisor` | `supervisor123`| Supervisor |
| `operator`   | `operator123`  | Operator   |

Login username ya email dono se hota hai. RBAC: operator sirf acknowledge, supervisor resolve + dispatch, admin sab kuch.

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | `{username\|email, password}` → tokens + user |
| POST | `/api/auth/register` | admin/supervisor | Officer provisioning |
| POST | `/api/auth/refresh` | — | refresh_token → naya access_token |
| POST | `/api/auth/logout` | — | contract parity (client-side discard) |
| GET/PUT | `/api/auth/me` | Bearer | profile get/update |
| PUT | `/api/auth/me/password` | Bearer | password change |
| GET | `/api/auth/users` | admin/supervisor | operator directory |

### Alerts
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/alerts?limit&offset&risk_level&event_type&status&acknowledged&camera_id` | — | paginated list, newest first |
| GET | `/api/alerts/summary` | — | risk/status badge counts |
| GET | `/api/alerts/:id` | — | single alert |
| PUT | `/api/alerts/:id/acknowledge?acknowledged_by=` | acknowledge | status → investigating |
| PUT | `/api/alerts/:id/resolve?acknowledged_by=` | resolve | status → resolved |
| POST | `/api/alerts/bulk-resolve` | resolve | `{alert_ids: []}` |
| POST | `/api/alerts` | Bearer | manual/drill alert raise |

### Cameras
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cameras?status&zone` | — | list with filters |
| GET | `/api/cameras/by-id/:cameraId` | — | `CAM-001` string lookup |
| GET | `/api/cameras/:id` | — | numeric lookup |
| GET | `/api/cameras/:id/history` | — | last 20 alerts |
| POST | `/api/cameras` | manage_cameras | provision |
| PUT | `/api/cameras/:id` | manage_cameras | update |
| DELETE | `/api/cameras/:id` | manage_cameras | de-provision |
| POST | `/api/cameras/:id/ptz` | acknowledge | pan/tilt/zoom |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/analytics/summary` | KPI cards |
| GET | `/api/analytics/incidents-over-time?days=7` | trend chart |
| GET | `/api/analytics/alert-types` | crime distribution |
| GET | `/api/analytics/hourly-activity` | 24h peak curve |
| GET | `/api/analytics/resolution-status` | resolution pie |
| GET | `/api/analytics/performance` | FPS, latency, uptime |
| GET | `/api/analytics/map-pins` | geo-located active threats |
| GET | `/api/analytics/operators` | operator roster |

### System & Streams
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/system-status` | model + metrics + cameras + streams |
| GET | `/api/health` | liveness probe |
| POST | `/api/start-stream?stream_id&source&location` | attach stream |
| POST | `/api/stop-stream?stream_id` | detach stream |
| GET | `/api/streams` | active streams |
| GET | `/api/settings` / PUT | global SOP/privacy/AI config (PUT: admin) |
| POST | `/api/analyze-video` | multipart `file` → simulated offline analysis |

Root-level aliases bhi mount hain (`/system-status`, `/alerts`, `/cameras`, ...) legacy clients ke liye.

## WebSocket Gateway

```
ws://localhost:8000/ws
```

Server se messages is shape me aate hain:

```json
{ "type": "new_alert", "payload": { "alert": {...} }, "timestamp": "..." }
```

Message types: `new_alert`, `alert_updated`, `camera_status`, `camera_created`, `camera_updated`, `camera_deleted`, `camera_ptz`, `stream_started`, `stream_stopped`, `settings_updated`, `system_status`.

Heartbeat (30s ping/pong) dead connections prune karta hai.

## Alert Simulation Engine

`ALERT_SIMULATION=true` (default) par ek background timer har 25s me synthetic AI detection generate karta hai — random online camera, event type aur risk level ke saath. Ye DB me persist hota hai aur sab WS clients par broadcast. Production me `ALERT_SIMULATION=false` kar dein.

## Data Persistence

`server/data/` me JSON files (`users`, `cameras`, `alerts`, `operators`, `settings`) — writes debounced aur atomic (tmp + rename). Fresh start ke liye folder delete kar dein, seeds phir ban jayenge.

### Seed Data (Single Source of Truth)

Pura demo dataset **`server/src/seedData.js`** me likha hai — users, cameras, alerts, operators, settings sab. Frontend ka dikahawa data badalna ho to bas is file ko edit karein aur `server/data/` folder delete karke server restart karein; naya DB inhi seeds se ban jayega. Timestamps `hoursAgo()` se relative hain, isliye demo data hamesha fresh rehta hai (7/30-day analytics charts bhare rehte hain).

## Production Notes

- `JWT_SECRET` / `JWT_REFRESH_SECRET` zaroor badlein
- `CORS_ORIGINS` me sirf apne frontend origins rakhein
- `NODE_ENV=production`, `ALERT_SIMULATION=false`
- HTTPS ke peeche chalayein; JWT expiry 15m default hai — refresh flow frontend me wire karna baaki hai (api.ts me `refreshToken()` ready hai)
