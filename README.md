# CIVIC-AI — Smart City Intelligence

CIVIC-AI is a full-stack smart-city surveillance and incident-response dashboard. It combines a React operations console with a Node.js/Express API for camera and alert management, analytics, operator access, and real-time status updates.

> **Project status:** This repository includes demo data and simulation-backed stream/video-analysis behavior. It is a development/demo application, not a production AI detection system. Do not connect it to real surveillance systems or use its demo credentials in production.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Demo accounts](#demo-accounts)
- [Project structure](#project-structure)
- [API overview](#api-overview)
- [Real-time updates](#real-time-updates)
- [Configuration](#configuration)
- [Tests and quality checks](#tests-and-quality-checks)
- [Deployment](#deployment)
- [Security and limitations](#security-and-limitations)

## Features

- **Operations dashboard:** camera and alert summaries, system status, and incident activity.
- **Live feeds:** camera inventory, feed status, and stream start/stop controls.
- **Alert triage:** browse, filter, acknowledge, and resolve alerts according to the signed-in role.
- **Incident map:** view cameras and unresolved incidents with location data.
- **Analytics:** incident trends, alert types, hourly activity, resolution status, and performance metrics.
- **Operator directory:** view operators and their roles, zones, and activity.
- **Administration:** manage cameras and update system settings with role- and permission-based API checks.
- **Authentication:** login and signup flows, access/refresh JWTs, profile endpoints, and demo-role shortcuts.
- **Real-time events:** a WebSocket endpoint broadcasts alert, camera, stream, settings, and system-status changes.
- **Video-analysis demo:** accepts an uploaded video and returns simulated detection results; it does not run a trained computer-vision model.

## Technology

| Area | Stack |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router |
| UI | Tailwind CSS, shadcn/ui, Radix UI, Lucide |
| Data and visualization | TanStack Query, Axios, Recharts, React Leaflet |
| Frontend testing | Vitest, Testing Library, jsdom |
| Backend | Node.js, Express 4, WebSocket (`ws`) |
| Authentication | JSON Web Tokens and bcrypt |
| Backend testing | Node.js built-in test runner |
| CI | GitHub Actions |

## Requirements

- Node.js **22.12 or newer** is recommended for local development and matches the CI runtime. The backend package itself declares support for Node.js 18 and newer.
- npm (included with Node.js).
- Git.

## Quick start

### 1. Install dependencies

Run these commands from the repository root:

```bash
npm ci
npm ci --prefix server
```

The frontend and backend have separate `package.json` files and lockfiles, so both installs are required.

### 2. Configure local environment

```bash
cp .env.example .env.local
cp server/.env.example server/.env
```

The example settings work for local development. In particular, the frontend defaults to `http://localhost:8000` and the backend allows the Vite development origin.

### 3. Start the backend

In one terminal at the repository root:

```bash
npm run server:dev
```

The API listens on `http://localhost:8000` by default. Its health endpoint is `http://localhost:8000/api/health`.

### 4. Start the frontend

In a second terminal at the repository root:

```bash
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). Sign in with one of the [demo accounts](#demo-accounts).

## Demo accounts

These seeded accounts are for local/demo use only. Login accepts either the username or the email address.

| Role | Username | Password |
| --- | --- | --- |
| System Admin | `admin` | `admin123` |
| Supervisor | `supervisor` | `supervisor123` |
| Operator | `operator` | `operator123` |

The login page also provides one-click demo login buttons. These accounts and passwords are defined in `server/src/seedData.js`; replace/remove them and use strong secrets before any deployment.

## Project structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml             # Install, lint, test, and build checks
├── public/                    # Static frontend assets
├── src/
│   ├── components/            # Shared UI, dashboard widgets, and layouts
│   ├── contexts/              # Authentication, notifications, and theme
│   ├── hooks/                 # Shared React hooks
│   ├── lib/                   # Frontend utilities
│   ├── pages/                 # Route-level screens
│   ├── services/api.ts        # REST client, token handling, and data mappers
│   └── test/                  # Frontend tests and Vitest setup
├── server/
│   ├── src/
│   │   ├── middleware/        # Authentication and request logging
│   │   ├── routes/            # Auth, alerts, cameras, analytics, streams, settings
│   │   ├── config.js          # Environment-backed server configuration
│   │   ├── realtime.js        # WebSocket events and alert simulation
│   │   ├── seedData.js        # Demo users, cameras, alerts, and settings
│   │   ├── store.js           # JSON-file persistence
│   │   └── index.js           # Express app and server entry point
│   └── tests/                 # Backend API integration tests
├── .env.example               # Frontend environment template
├── netlify.toml               # Netlify build, SPA routing, and headers
├── render.yaml                # Render backend blueprint
├── package.json               # Frontend scripts and dependencies
└── server/package.json        # Backend scripts and dependencies
```

## API overview

All API routes are available under `/api`. The server also mounts compatibility aliases at the root for existing clients.

| Area | Main routes | Access |
| --- | --- | --- |
| Health and status | `GET /api/health`, `GET /api/system-status` | Public |
| Authentication | `POST /api/auth/register`, `/login`, `/refresh`, `/logout`; `GET/PUT /api/auth/me`; `PUT /api/auth/me/password`; `GET /api/auth/users` | Login/register/refresh/logout are public; profile requires a token; user directory is admin/supervisor |
| Alerts | `GET /api/alerts`, `/api/alerts/summary`, `/api/alerts/:id`; `PUT /api/alerts/:id/acknowledge`, `/resolve`; `POST /api/alerts`, `/api/alerts/bulk-resolve` | Read is public; changes require a token and the relevant permission |
| Cameras | `GET /api/cameras`, `/api/cameras/:id`, `/api/cameras/by-id/:cameraId`, `/api/cameras/:id/history`; `POST/PUT/DELETE /api/cameras...`; `POST /api/cameras/:id/ptz` | Read is public; management requires `manage_cameras`; PTZ requires `acknowledge` |
| Analytics | `GET /api/analytics/summary`, `/incidents-over-time`, `/alert-types`, `/hourly-activity`, `/resolution-status`, `/performance`, `/map-pins`, `/operators` | Public |
| Streams | `GET /api/streams`; `POST /api/start-stream`, `/api/stop-stream` | Public demo endpoints; stream state is in memory |
| Settings | `GET/PUT /api/settings` | Read is public; update requires an admin token |
| Video analysis | `POST /api/analyze-video` | Requires a token and a multipart `file` upload |

Alerts can be filtered and paginated with query parameters such as `limit`, `offset`, `risk_level`, `event_type`, `status`, `acknowledged`, and `camera_id`. Camera lists support status and zone filters. See the route handlers under `server/src/routes/` for request fields and response shapes.

## Real-time updates

The backend serves a WebSocket endpoint at:

```text
ws://localhost:8000/ws
```

The frontend builds its WebSocket URL from `VITE_API_URL`. Events include `new_alert`, `alert_updated`, `camera_status`, `camera_created`, `camera_updated`, `camera_deleted`, `camera_ptz`, `stream_started`, `stream_stopped`, `settings_updated`, and `system_status`.

When `ALERT_SIMULATION=true`, the server periodically generates synthetic alerts for the demo. Set it to `false` to disable the alert simulator.

## Configuration

### Frontend

Set `VITE_API_URL` in `.env.local` to the backend base URL (without `/api`):

```dotenv
VITE_API_URL=http://localhost:8000
```

Vite only exposes variables prefixed with `VITE_` to browser code. Never put secrets in frontend environment variables.

### Backend

Copy `server/.env.example` to `server/.env`. Common settings:

| Variable | Purpose | Local default |
| --- | --- | --- |
| `PORT` | HTTP port | `8000` |
| `HOST` | Interface to bind | `0.0.0.0` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | Local Vite/preview URLs |
| `JWT_SECRET` | Access-token signing secret | Development-only fallback |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret | Development-only fallback |
| `JWT_ACCESS_EXPIRES_IN` | Access-token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime | `7d` |
| `DATA_DIR` | JSON data directory | `./data` |
| `UPLOADS_DIR` | Video upload directory | `./uploads` |
| `ALERT_SIMULATION` | Enable synthetic alerts | `true` |
| `ALERT_SIMULATION_INTERVAL_MS` | Simulator interval in milliseconds | `25000` |
| `LOG_LEVEL` | Server log verbosity | `info` |

For production, provide strong, unique JWT secrets through the hosting provider's secret manager, restrict CORS to the deployed frontend origin, and disable the demo alert simulator unless synthetic data is explicitly intended.

## Tests and quality checks

Run the full local CI sequence from the repository root:

```bash
npm ci
npm ci --prefix server

npm run lint
npm run lint --prefix server

npm test
npm test --prefix server

npm run build
npm run build --prefix server
```

Frontend test files live in `src/test/` and use Vitest, jsdom, and Testing Library. Backend integration tests live in `server/tests/` and run with Node's built-in test runner. Backend tests use isolated test data and clean it up when they finish.

The GitHub Actions workflow at `.github/workflows/ci.yml` runs the same install, lint, test, and build checks on pushes, pull requests, and manual dispatches.

Useful development commands:

```bash
npm run dev                 # Start the frontend dev server
npm run server:dev          # Start the backend in watch mode
npm run test:watch          # Run frontend tests in watch mode
npm run preview             # Preview the production frontend build
```

## Deployment

The repository includes starter deployment configuration:

- **Frontend:** `netlify.toml` configures `npm run build`, publishes `dist/`, and provides SPA route fallback behavior. Set `VITE_API_URL` in the Netlify environment to the deployed API URL.
- **Backend:** `render.yaml` configures the Render service to build from `server/` and use `/api/health` as its health check. Configure `CORS_ORIGINS` to include the frontend's exact origin (without a trailing slash).

Review the provider settings before deploying. A local JSON-file store may be ephemeral on hosted services without persistent storage; configure durable storage or replace the store before relying on data surviving restarts or redeployments.

## Security and limitations

- Demo credentials and development fallback JWT secrets are public and must never be used in production.
- Public registration is enabled by the current API. Restrict or disable it before exposing the service to untrusted users.
- The stream controls, AI alerts, and uploaded-video analysis are simulations; they are not connected to real cameras or a trained detection model.
- The JSON store is intended for this demo setup. It does not provide the operational guarantees of a production database.
- Treat all uploaded footage and incident data as sensitive. Configure authentication, storage, retention, and access controls appropriately before any real-world use.
