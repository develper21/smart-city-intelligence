# ✅ Project Tasks

## CIVIC-AI – Task Breakdown & Development Plan

This document contains the complete list of tasks for building the CIVIC-AI application. Tasks are divided into phases with clear deliverables, priorities and status tracking.

---

| 📊 Total Tasks | ✔ Completed | 🔄 In Progress |
|---|---|---|
| **40** | **36** | **3** |
| 90% | 90% | 7.5% |

> 1 task intentionally moved to a future phase (deferred, not in progress).

---

## ☑️ Phase 1: Project Setup

Set up the repository, tooling and project skeleton.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 1.1 | Initialize Vite + React 18 + TypeScript project | High | ✅ Completed | Vite 7 + SWC |
| 1.2 | Configure Tailwind CSS + shadcn/ui | High | ✅ Completed | Radix primitives |
| 1.3 | Set up Git repository | High | ✅ Completed | GitHub, main branch |
| 1.4 | Configure ESLint + TypeScript config | Medium | ✅ Completed | ESLint 9 flat config |
| 1.5 | Set up Vitest + testing setup | Medium | ✅ Completed | jsdom + setup file |

## 🚧 Phase 2: Layout & Routing

Build the app shell, navigation and route map.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 2.1 | MainLayout with collapsible Sidebar | High | ✅ Completed | Responsive collapse |
| 2.2 | TopNavbar with notifications | High | ✅ Completed | Siren + Cmd+K |
| 2.3 | Register all 12 routes in App.tsx | High | ✅ Completed | MainLayout-wrapped |
| 2.4 | CommandMenu (Cmd+K palette) | Medium | ✅ Completed | cmdk-based |
| 2.5 | Tactical 404 page | Low | ✅ Completed | Radar-styled |

## 📡 Phase 3: Backend Development

Build the Express REST + WebSocket backend.

| # | Task | Priority | Status | Notes |
|---|---|---|   -   | Notes |
| 3.1 | Express app + middleware (helmet, cors, morgan) | High | ✅ Completed | server/index.js |
| 3.2 | JSON file store with atomic writes | High | ✅ Completed | tmp + rename |
| 3.3 | Auth routes (login, register, refresh, logout, me) | High | ✅ Completed | JWT access+refresh |
| 3.4 | RBAC middleware (requireRole / requirePermission) | High | ✅ Completed | 3 roles |
| 3.5 | Cameras, alerts, analytics, streams routes | High | ✅ Completed | Full CRUD |
| 3.6 | Settings + system-status + health routes | Medium | ✅ Completed | Public GET settings |
| 3.7 | WebSocket server (/ws) + realtime broadcasts | High | 8 event types | Realtime.js |
| 3.8 | Server test suite | High | ✅ Completed | 20/20 passing |

## 📻 Phase 4: Authentication & RBAC UI

Wire the frontend to the backend auth system.

| # | Task | Priority | Status | Notes |
|-|---|---|---|---|
| 4.1 | Login page with demo accounts | High | ✅ Completed | admin/supervisor/operator |
| 4.2 | Signup page | High | ✅ Completed | Badge ID + role select |
| 4.3 | AuthContext (JWT restore + refresh) | High | ✅ Completed | Single-flight refresh |
| 4.4 | Protected routes by role | High | ✅ ProtectedRoute | 3-tier RBAC |

## 🖥️ Phase 5: Core Pages

Build and wire the 9 console pages to real backend data.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 5.1 | Dashboard wired to real KPIs + alerts | High | ✅ Completed | Backend-driven |
| 5.2 | LiveFeeds grid + PTZ stream modal | High | ✅ Completed | 3 grid layouts |
| 5.3 | Alerts page with siren + bulk actions | High | ✅ Completed | Risk categories |
| 5.4 | MapPage (Leaflet GIS map) | High | ✅ Completed | Backend camera pins |
| 5.5 | Analytics with Recharts | High | ✅ Completed | 7 chart endpoints |
| 5.6 | Incidents registry | Medium | ✅ Completed | Search + filters |
| 5.7 | Operators roster | Medium | ✅ Completed | 8 seeded operators |
| 5.8 | Settings page | Medium | ✅ Completed | Admin-only PUT |

## 🌍 Phase 6: Landing & Auth Pages

Public pages for evaluation and onboarding.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 6.1 | Landing page with capability cards | High | ✅ Completed | Demo launchers |
| 6.2 | Privacy banner component | Medium | ✅ Completed | Civic compliance |
| 6.3 | Theme: remove dark mode (light-only) | High | ✅ Completed | .dark removed from CSS |

## 🔌 Phase 7: Real-Time Engine

Live updates across the console.

| # |  Task | Priority | Status | Notes |
|---|---|---|---|---|
| 7.1 | WebSocket manager with auto-reconnect | High | ✅ Completed | Backoff + heartbeat |
| 7.2 | NotificationContext (WS-driven) | High | ✅ Completed | Siren + toasts |
| 7.3 | Wire WS events to pages | High | ✅ Completed | 8 event types |

## 🎲 Phase 8: Seed Data & Cleanup

Single source of truth for demo data.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 8.1 | Create seedData.js (single seed source) | High | ✅ Completed | 5 users / 12 cameras / 36 alerts / 8 operators |
| 8.2 | Rewire store.js to seedData | High | ✅ Completed | Auto-seed on empty DB |
| 8.3 | Delete all mock/backup frontend files | High | ✅ Completed | mockData.ts, old map views |
| 8.4 | README + docs update | Medium | ✅ Completed | Seed instructions |

## ⚙️ Phase 9: Config & Deployment

Environment validation and cloud deploy configs.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 9.1 | Frontend env files (.env.local/.production/.example) | High | ✅ Completed | VITE_API_URL |
| 9.2 | Server env files + CORS fix | High | ✅ Completed | No trailing slash |
| 9.3 | render.yaml (backend blueprint) | High | ✅ Completed | Root-level, rootDir: server |
| 9.4 | netlify.toml (frontend SPA config) | High | ✅ Completed | SPA redirect + headers |
| 9.5 | Deploy documentation | Medium | 🔄 In Progress | See docs/MEMORY.md |
| 9.6 | Render free-tier disk (persistent DB) | Low | ⏸ Deferred | Paid add-on — future |

---

## Status Badges

| Badge | Meaning |
|---|---|
| ✅ Completed | Done, verified by build/tests |
| 🔄 In Progress | Actively being worked on |
| ⏸ Deferred | Planned, moved to a future phase |

**Next up:** Phase 9.5 — polish the deployment guide, then begin Post-MVP roadmap planning (see MEMORY.md).
