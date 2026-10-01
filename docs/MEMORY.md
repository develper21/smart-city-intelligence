# 🧠 Project Memory

## CIVIC-AI – Context, Progress & Important Notes

This document keeps track of the current state of the project, important decisions and things to remember. It helps maintain continuity across development sessions or for new contributors.

---

| 📅 Last Updated | 🚀 Current Phase | 🧑‍💻 Active Work |
|---|---|---|
| **Oct 1, 2026** | **Phase 9** | Documentation |
| 11:45 AM | Config & Deployment | docs/ folder (6 files) |

---

## 🎯 Current Status

- [x] Project setup completed (Vite, React 18, TypeScript, Tailwind)
- [x] Git repository initialized and pushed to GitHub
- [x] Express backend complete: REST + WebSocket + JWT + RBAC (20/20 tests passing)
- [x] All 12 pages wired to real backend (mock data fully removed)
- [x] Dark theme fully removed — app is light-only
- [x] Single seed source (seedData.js): 5 users, 12 cameras, 36 alerts, 8 operators
- [x] Env files validated (VITE_API_URL, CORS origins, ALERT_SIMULATION=false in prod)
- [x] Deploy configs ready: render.yaml + netlify.toml
- [x] Backend deployed on Render, frontend on Netlify (URLs in env files)
- [x] `docs/` folder created (PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY)
- [ ] Verify production deployment end-to-end after first Render/Netlify deploy
- [ ] Post-MVP roadmap planning (drone telemetry, FIR generation, multi-city federation)

## ✅ Completed Tasks

| # | Task | Completed On |
|---|---|---|
| 1.1 | Initialize Vite + React + TypeScript project | Jan 2026 |
| 1.2 | Configure Tailwind CSS + shadcn/ui | Jan 2026 |
| 1.3 | Set up Git repository | Jan 2026 |
| 2.1 | Express backend (REST + WS + JWT + RBAC) | Feb 2026 |
| 2.2 | All 12 pages wired to real backend | Feb 2026 |
| 3.1 | Light-only theme (dark mode removed) | Mar 2026 |
| 3.2 | Single seed source (seedData.js) + DB regen | Mar 2026 |
| 3.3 | Old mock/backup files deleted & README updated | Mar 2026 |
| 4.1 | Env files validated + CORS fix | Mar 2026 |
| 4.2 | render.yaml + netlify.toml deploy configs | Mar 2026 |
| 5.1 | docs/ folder created (6 documentation files) | Oct 1, 2026 |

## 🔄 In Progress

| # | Task | Notes |
|---|---|---|
| 9.5 | Deployment documentation polish | Review after first live deploy |

## 📝 Important Notes

- **DB regeneration:** delete `server/data/` and restart the server — seedData.js auto-fills.
- **Light-only:** ThemeContext exists but forces light; never add a dark toggle back.
- **No frontend mocks:** every page reads from `/api` via `src/services/api.ts`; types `Camera`, `Alert`, `MapPin`, `Operator` come from there.
- **Demo logins:** admin/admin123, supervisor/supervisor123, operator/operator123 (seeded users: amir.khan/amir1234, priya.nair/priya1234).
- **Deploy:** render.yaml lives at repo root (Render Blueprint auto-detect needs root; `rootDir: server` handles the rest). netlify.toml builds the SPA with `/* → /index.html` redirect.
- **Free-tier caveat:** Render spins down after ~15 min idle (cold start); disk is ephemeral — paid disk block documented in render.yaml comments for persistent DB.
- **ALERT_SIMULATION=false** in production env to avoid synthetic alerts in live ops.
- **Events collection removed:** alerts table is the single incident store (events were unused).
- **Verification gates:** `npm run lint`, `npm run build`, `cd server && npm test` (20/20), plus CORS preflight + VITE_API_URL bundle checks already passed.
