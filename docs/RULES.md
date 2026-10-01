# 📋 Development Rules

## CIVIC-AI – Project Guidelines for AI & Human Collaboration

This document defines the development rules, coding standards, and best practices for the CIVIC-AI application. These rules ensure consistency, maintainability, security and privacy compliance. Both AI assistants and human contributors must follow these guidelines.

---

## 1️⃣ General Principles

These rules apply to the entire project.

- [x] Follow the project documentation (PRD, ARCHITECTURE, DESIGN) before making any change.
- [x] Keep the code clean, readable and well-structured.
- [x] Prioritize simplicity and maintainability.
- [x] Do not duplicate logic. Reuse existing components, utilities or services.
- [x] Make small, focused changes instead of large, risky edits.
- [x] Do not modify unrelated files.
- [x] Write self-explanatory code with meaningful variable and function names.
- [x] The backend is the single source of truth — no mock data in the frontend.
- [x] Verify changes with `npm run lint`, `npm run build` and `cd server && npm test` before finishing any task.

---

## 2️⃣ Technology & Coding Standards

Rules related to the tech stack and coding style.

| Standard | Rule |
|---|---|
| 🔤 **Language** | TypeScript on the frontend — avoid `any` unless absolutely necessary. Backend uses modern ES-module JavaScript (Node 18+). |
| ⚛️ **Framework** | React 18 functional components + hooks only. Follow react-router-dom v6 patterns; all routes registered in `App.tsx`. |
| 🎨 **Styling** | Tailwind CSS only, using the tokens defined in DESIGN.md. Use shadcn/ui primitives; light theme only — never re-introduce dark mode. |
| 🧹 **Linting** | ESLint 9 flat config must pass — run `npm run lint` before every commit. |
| 📐 **Formatting** | Consistent formatting (2-space indent, trailing commas); keep diffs minimal and focused. |
| 📦 **Dependencies** | Add stable, well-maintained packages only when necessary; always commit the lockfile. |
| 📄 **File Naming** | Components/contexts in PascalCase (`Alerts.tsx`, `AuthContext.tsx`); services/hooks/utils in camelCase (`api.ts`, `use-toast.ts`); backend modules in camelCase (`seedData.js`). |

---

## 3️⃣ Project Structure

Follow the defined folder structure in ARCHITECTURE.md to keep the codebase organized.

- [x] Place reusable UI primitives in `/src/components/ui` (shadcn/ui).
- [x] Feature-specific components go in `/src/components/dashboard` (modals, cards, charts, map).
- [x] All HTTP/WebSocket communication flows through `/src/services/api.ts` — never call axios/fetch directly from pages.
- [x] Global state lives in `/src/contexts` (AuthContext, NotificationContext, ThemeContext).
- [x] Route pages live in `/src/pages` and are registered in `App.tsx`.
- [x] Backend endpoint logic belongs in `/server/src/routes`; data access only via `/server/src/store.js`.
- [x] Seed/demo data lives only in `/server/src/seedData.js` — never inline seed arrays elsewhere.
- [x] Do not create new folders without a clear, documented reason.
