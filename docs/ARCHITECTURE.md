# 🏛 System Architecture

## CIVIC-AI – Smart City Surveillance & Intelligence Platform

This document describes the overall system architecture, technology stack, folder structure, data flow and key design decisions for the CIVIC-AI application.

---

## 1. High-Level Architecture

CIVIC-AI follows a client-server architecture. The React SPA talks to a stateless Express API over HTTPS and receives real-time pushes over WebSocket. The backend persists state in a JSON file database and can delegate video analysis to the optional Python AI microservice.

```
┌────────────┐  HTTPS   ┌─────────────────┐  REST + WS  ┌──────────────────┐  read/write  ┌──────────────┐
│    👤      │ ◄──────► │  React Frontend │ ◄─────────► │  Express Backend │ ◄──────────► │ JSON Storage │
│    User    │          │  Vite + React18 │  /api + /ws │  Node.js + JWT   │              │ server/data/ │
│ (Browser)  │          │  TypeScript SPA │             │  REST + WebSocket│              │ *.json store │
└────────────┘          └─────────────────┘             └──────────────────┘              └──────────────┘
                                                               │
                                                optional HTTP  │  (video analysis)
                                                               ▼
                                                    ┌─────────────────────┐
                                                    │   AI Microservice   │
                                                    │ FastAPI + YOLOv8    │
                                                    │ (ai-backend/)       │
                                                    └─────────────────────┘
```

**Real-time events broadcast on `/ws`:** `new_alert`, `alert_updated`, `camera_connected`, `camera_disconnected`, `stream_started`, `stream_stopped`, `settings_updated`, `system_status`.

---

## 2. Technology Stack

Technologies used in the project and their purpose.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI framework and build tooling |
| Language | TypeScript | Type-safe frontend development |
| Routing | react-router-dom v6 | SPA navigation across 12 routes |
| Styling | Tailwind CSS + shadcn/ui | Design system and accessible components |
| Data Fetching | TanStack Query + Axios | Server-state caching and REST client |
| Real-Time | Native WebSocket | Live alerts, camera and stream updates (`/ws`) |
| Mapping | Leaflet + react-leaflet | GIS digital twin & tactical map |
| Charts | Recharts | Analytics and trend visualizations |
| Backend | Node.js 18+ / Express 4 | REST API and WebSocket server |
| Authentication | JWT (access + refresh) + bcryptjs | Stateless auth with token rotation |
| Storage | JSON file store (`server/data/`) | Atomic file-based database (tmp + rename writes) |
| AI Service | Python FastAPI + YOLOv8 | Optional video analysis microservice (`ai-backend/`) |
| Deployment | Netlify (frontend) + Render (backend) | Hosting and continuous deployment |
| Version Control | Git + GitHub | Source code management |

---

## 3. Folder Structure

The project follows a feature-first folder structure to keep the code organized and scalable.

```
civic-ai/
├── docs/                  # 📚 Project documentation (you are here)
│   ├── PRD.md             # Product requirements
│   ├── ARCHITECTURE.md    # System design (this file)
│   ├── RULES.md           # Development rules
│   ├── DESIGN.md          # Design system
│   ├── TASKS.md           # Task breakdown
│   └── MEMORY.md          # Project memory
├── src/                   # 🎨 React frontend (Vite SPA)
│   ├── components/
│   │   ├── common/        # Shared widgets (PrivacyBanner)
│   │   ├── dashboard/     # Feature components (modals, cards, charts, map)
│   │   ├── layout/        # MainLayout, Sidebar, TopNavbar, NotificationDrawer
│   │   └── ui/            # shadcn/ui primitives (button, dialog, table, …)
│   ├── contexts/          # AuthContext, NotificationContext, ThemeContext
│   ├── hooks/             # use-mobile, use-toast
│   ├── lib/               # cn() and shared utilities
│   ├── pages/             # 12 route pages (Dashboard, LiveFeeds, Alerts, Map, …)
│   ├── services/          # api.ts — REST client, wsManager, shared types
│   ├── test/              # Vitest setup + tests
│   ├── App.tsx            # Router + global providers
│   └── index.css          # Light-only design tokens
├── server/                # 🛠️ Node.js + Express backend
│   ├── src/
│   │   ├── middleware/    # auth (JWT + RBAC), logger
│   │   ├── routes/        # auth, cameras, alerts, analytics, streams, video, settings
│   │   ├── config.js      # Env config (port, CORS, JWT, simulation)
│   │   ├── index.js       # Express app + /ws WebSocket server
│   │   ├── realtime.js    # WS broadcast helpers
│   │   ├── seedData.js    # ⭐ Single source of seed data
│   │   └── store.js       # JSON persistence (atomic tmp + rename writes)
│   ├── tests/             # 20 API tests (`npm test`)
│   └── data/              # Runtime JSON database (auto-generated, gitignored)
├── ai-backend/            # 🤖 Optional Python AI microservice
│   ├── services/          # crime_detector, rule_engine, video_processor, …
│   ├── database/          # SQLite models
│   └── main.py            # FastAPI + YOLOv8 entrypoint
├── postman/               # API test collection
├── index.html             # Vite entry (fonts + meta)
├── netlify.toml           # Frontend deploy config (Netlify)
├── render.yaml            # Backend deploy blueprint (Render)
├── plan.md                # Original product specification
└── package.json           # Frontend scripts (dev / build / lint / test)
```

**Key API surface:** `/api/auth/*`, `/api/cameras/*`, `/api/alerts/*`, `/api/analytics/*`, `/api/streams/*`, `/api/settings`, `/api/system-status`, `/api/health` — all behind JWT auth except public health/settings endpoints.
