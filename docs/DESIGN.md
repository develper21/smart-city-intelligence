# 🎨 Design System

## CIVIC-AI – Clean. Alert. Civic-Grade.

This document defines the visual design system, UI components and user experience rules for the CIVIC-AI application. The goal is a clean light control-room interface where an operator can scan the city's health at a glance — glanceable status, consistent tokens, zero ambiguity.

---

## 1. Design Principles

| | | |
|---|---|---|
| 🛡 **Operator-First** | ⚡ **Glanceable in 3s** | 🧩 **Consistent** |
| Simple and intuitive for control-room operators. | Risk visible within 3 seconds — color-coded badges and pulse indicators. | Follow a unified token-based design system. |

---

## 2. Color Palette

Primary colors used across the application (light-only theme).

| Swatch | Token | Hex | Usage |
|---|---|---|---|
| 🟩 | Primary | `#059669` | Main brand color — buttons, links, active states |
| 🟦 | Info | `#0EA5E9` | Info states, medium-risk alerts, chart accents |
| 🟨 | Warning | `#F59E0B` | Warning states, high-risk alerts |
| 🟥 | Destructive | `#EF4444` | Error messages, critical alerts, validation |
| 🟢 | Success | `#059669` | Online status, resolved incidents |
| 🟪 | Chart-5 | `#A855F7` | Extra chart series (analytics) |
| ⬜ | Background | `#F8FAFC` | App background (light-only) |
| ⬛ | Foreground | `#0F172A` | Body text on light backgrounds |

> All colors are stored as HSL CSS variables in `src/index.css` and consumed via Tailwind (`hsl(var(--primary))`). The dark `.dark` block has been removed — **CIVIC-AI is light-only**.

---

## 3. Typography

We use **Plus Jakarta Sans** as the primary font for a clean, modern and highly readable control-room UI. **Outfit** is used for all headings (tighter, display-grade) and **JetBrains Mono** for telemetry/code values.

| | |
|---|---|
| **Aa** | **Plus Jakarta Sans** — Primary Font. Clean, modern and highly readable. |
| **Aa** | **Outfit** — Headings. Display-grade with tight letter-spacing (`-0.02em`). |
| **Aa** | **JetBrains Mono** — Monospace for camera IDs, FPS/latency telemetry and code. |

| Style | Font | Size | Weight |
|---|---|---|---|
| h1 | Outfit | 36px / 2.25rem | 800 |
| h2 | Outfit | 30px / 1.875rem | 700 |
| h3 | Outfit | 24px / 1.5rem | 600 |
| Body | Plus Jakarta Sans | 14px | 400 |
| Small | Plus Jakarta Sans | 12px | 500 |
| Mono | JetBrains Mono | 13px | 400–600 |

---

## 4. UI Components

Standard components to be used throughout the application.

**Buttons**

| Variant | Preview | Usage |
|---|---|---|
| Primary | `🟩 [button]` | Main actions — acknowledge, dispatch, save |
| Secondary | `⬜ [button]` | Less prominent actions |
| Destructive | `🟥 [button]` | Resolve-all, purge data, dangerous ops |
| Outline/Ghost | `▬ [button]` | Toolbar and table row actions |

**Inputs** — Inputs, Textarea, Select, Checkbox, Switch, Slider (settings forms)
**Overlays** — Dialog (alert/camera modals), Sheet (notification drawer), Dropdown Menu, Command Palette (`Cmd+K`)
**Feedback** — Sonner toasts (light, top-center), Skeleton loaders, Progress bars, Badges

> Component source: `src/components/ui/*` (shadcn/ui + Radix). All pages compose from these primitives — never hand-roll a styled button.

### Risk Badge System

| Risk | Badge | Border Token |
|---|---|---|
| 🔴 Critical | `CRITICAL` | `--risk-critical` (deep red) |
| 🟠 High | `HIGH` | `--risk-high` (red) |
| 🟡 Medium | `MEDIUM` | `--risk-medium` (amber) |
| 🟢 Low | `LOW` | `--risk-low` (green) |

### Camera Status Colors

| Status | Color |
|---|---|
| 🟢 Online | Success green `#059669` |
| 🟡 Warning | Warning amber `#F59E0B` |
| 🔴 Offline | Destructive red `#EF4444` |
