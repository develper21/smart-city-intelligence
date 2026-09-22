# 🏙️ CIVIC-AI: Smart City Surveillance & Intelligence Platform
## 📋 Comprehensive Frontend Architecture & Product Specification Plan (`plan.md`)

---

## 📑 Table of Contents
1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Problem Statement: Why this System Exists](#2-problem-statement-why-this-system-exists)
3. [Frontend Tech Stack & Architecture](#3-frontend-tech-stack--architecture)
4. [Design System & UI/UX Principles](#4-design-system--uiux-principles)
5. [Complete Pages & Routing Breakdown](#5-complete-pages--routing-breakdown)
   - 5.1 [Landing Page (`/landing`)](#51-landing-page-landing)
   - 5.2 [Authentication: Login (`/login`)](#52-authentication-login-login)
   - 5.3 [Authentication: Signup / Officer Provisioning (`/signup`)](#53-authentication-signup--officer-provisioning-signup)
   - 5.4 [Executive Tactical Dashboard (`/dashboard` & `/`)](#54-executive-tactical-dashboard-dashboard--)
   - 5.5 [Live Surveillance Video Wall (`/live-feeds`)](#55-live-surveillance-video-wall-live-feeds)
   - 5.6 [Real-Time Alerts & Threat Triage (`/alerts`)](#56-real-time-alerts--threat-triage-alerts)
   - 5.7 [GIS Digital Twin & Tactical Map (`/map`)](#57-gis-digital-twin--tactical-map-map)
   - 5.8 [Crime Intelligence & Trend Analytics (`/analytics`)](#58-crime-intelligence--trend-analytics-analytics)
   - 5.9 [Incident Registry & Audit Trail (`/incidents`)](#59-incident-registry--audit-trail-incidents)
   - 5.10 [Tactical Operators & Field Units (`/operators`)](#510-tactical-operators--field-units-operators)
   - 5.11 [System & AI SOP Configuration (`/settings`)](#511-system--ai-sop-configuration-settings)
   - 5.12 [Tactical 404 Not Found (`*`)](#512-tactical-404-not-found-)
6. [Global Persistent Components & Modals](#6-global-persistent-components--modals)
7. [State Management & Real-Time Engine (WebSocket + React Query)](#7-state-management--real-time-engine-websocket--react-query)
8. [Backend Integration (FastAPI + YOLOv8 + Police Rule Engine)](#8-backend-integration-fastapi--yolov8--police-rule-engine)
9. [Privacy, Compliance & Role-Based Access Control (RBAC)](#9-privacy-compliance--role-based-access-control-rbac)
10. [Future Roadmap & Scaling Strategy](#10-future-roadmap--scaling-strategy)

---

## 1. Executive Summary & Vision

**CIVIC-AI (Smart City Surveillance Intelligence System)** ek mission-critical, AI-driven Command & Control Platform hai jiska maksad traditional raw video surveillance ko **proactive, rule-aware aur actionable public safety intelligence** me transform karna hai.

Yeh frontend ek central tactical nerve center ke roop me kaam karta hai jahan:
- City police, traffic authorities aur municipal security operations hazaron camera feeds ko single dashboard par monitor kar sakte hain.
- Artificial Intelligence (YOLOv8 + Police SOP Rule Engine) continuous surveillance karta hai aur insani aakho se chhooth jaane wale threats ko sub-second latency me detect karta hai.
- Automated alert triage, GIS spatial mapping aur instant tactical dispatch se emergency response time 15-30 minutes se ghata kar sub-3 minutes tak laya jaata hai.

---

## 2. Problem Statement: Why this System Exists

Traditional urban surveillance me police aur smart city command centers niche diye gaye gambhir chunotiyon ka samna karte hain:

| # | Traditional Challenge | Ground Reality Problem | CIVIC-AI Frontend Solution |
|---|------------------------|------------------------|-----------------------------|
| **1** | **Massive Data Overload** | Ek modern shehar me 10,000+ CCTV cameras hote hain. Ek operator maximum 4–6 screens 20 minute tak hi dhyan se dekh sakta hai; iske baad 95% suspicious activity miss ho jaati hai (Operator Fatigue). | **Automated AI Filtering**: AI 24x7 saari feeds scan karta hai aur sirf high-risk anomalies par user ka focus laata hai via visual badges aur dynamic feeds. |
| **2** | **Reactive vs Proactive Policing** | Aamtaur par CCTV ka istemal apradh (crime) ya hadse ke BAAD recording dekhne ke liye hota hai. Jab tak police pahuchti hai, tab tak der ho chuki hoti hai. | **Real-Time Detection & Sub-50ms Alarms**: AI Rule Engine violence, intrusion, unattended bag ya stampede ko shuruwati stage me hi detect karke real-time alarm trigger karta hai. |
| **3** | **Lack of SOP Intelligence in standard Vision AI** | Sadharan AI models sirf labels detect karte hain (jaise "person", "bag", "car"). Par woh yeh nahi samajhte ki kya koi apradh ho raha hai. | **Police SOP Rule Engine**: Distance proximity, aggressive motion velocity, dwell time aur crowd density ko combine karke Police Rule logic apply karta hai (jaise: 2 persons in restricted perimeter after 11 PM = Critical Intrusion). |
| **4** | **Dispatch & Telemetry Gap** | Camera par ghatna dikhne ke baad patrol van ya emergency units ko coordinate karne me samay lagta hai kyunki location coordinate aur camera metadata dispersed hota hai. | **Integrated GIS Digital Twin & 1-Click Dispatch**: Map par seedhe camera pin, live distance vector aur 1-Click "Dispatch Patrol Unit & Drone" action. |
| **5** | **Privacy Violations & Public Backlash** | Aam nagriko ke chehre aur gaadiyon ki number plates bina privacy compliance ke record hone se legal aur ethical challenges aate hain. | **Zero-Knowledge Privacy Controls**: Settings aur feeds me edge-based real-time facial anonymization aur license plate masking options diye gaye hain. |

---

## 3. Frontend Tech Stack & Architecture

Frontend ko high-performance, real-time interactivity, low memory footprint aur tactical aesthetics ko dhyan me rakh kar build kiya gaya hai:

- **Core Framework**: React 18 (TypeScript) + Vite (ultra-fast HMR and bundle compilation).
- **Styling**: Tailwind CSS + Custom Dark/Light Tactical Design System + Glassmorphism (`backdrop-blur`).
- **Component Architecture**: Radix UI Primitives + Shadcn UI patterns (accessible, keyboard-first, modular).
- **Data Fetching & Caching**: `@tanstack/react-query` (deduplication, background polling, stale-while-revalidate).
- **HTTP Client**: Axios with automatic retry and error interceptors.
- **Real-Time Streaming**: Native WebSockets (`WebSocketManager` with exponential backoff auto-reconnect) for live alerts and heartbeat.
- **Geospatial Mapping**:
  - `leaflet` + `react-leaflet` for OpenStreetMap GIS digital twin, custom pulse markers, risk rings, and thermal layers.
  - `@googlemaps/react-wrapper` for high-resolution satellite imagery fallback.
- **Data Visualization**: `recharts` for dynamic incident trends, hourly distributions, crime category breakdowns, and resolution rates.
- **Sound & Notifications**: Audio synthesized emergency alert sound (`AudioContext` / Web Audio API) + `sonner` / Radix Toast for multi-level toast notifications.
- **Icons**: `lucide-react` (uniform tactical iconography).

---

## 4. Design System & UI/UX Principles

1. **Dark Tactical Military/Cyber Aesthetics**:
   - Primary: Electric Cyan/Emerald/Blue glow accents (`hsl(var(--primary))`).
   - Critical Threats: Neon Crimson (`#ef4444` / `hsl(var(--destructive))`).
   - High Risk: Amber Warning (`#f59e0b`).
   - Normal/Safe: Cyber Emerald (`#10b981`).
   - Background: Deep slate military hue (`hsl(var(--background))`) with subtle grid patterns.
2. **Glanceability (3-Second Rule)**:
   - Ek emergency operator ko screen dekhte hi 3 second ke andar pata chalna chahiye ki shahar ke kis zone me sabse bada khatra hai. Iske liye pulsing radar rings, color-coded badges aur flashing indicators use kiye gaye hain.
3. **Keyboard Accessibility & Command Palette**:
   - `Cmd+K` / `Ctrl+K` Global Command Menu se operator bina mouse chuhe kisi bhi camera, alert, ya report par turant jump kar sakta hai.
4. **Resilient Fallback Design**:
   - Agar backend server offline bhi ho, tab bhi frontend gracefully rich mock data, local simulation mode, aur informative offline banners ke sath continuously functional rehta hai bina crash hue.

---

## 5. Complete Pages & Routing Breakdown

Frontend me kul **12 dedicated pages/views** hain, jinme se 9 Authenticated Operations Console ke andar hain aur 3 Public/Auth routes hain:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CIVIC-AI ROUTE MAP                              │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Public / Authentication Routes │ • /landing   (Public Portal & Capabilities)│
│                                │ • /login     (Officer Badge Login & Demo)  │
│                                │ • /signup    (Officer Provisioning)        │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Authenticated Command Center   │ • /dashboard (Executive Tactical Center)   │
│ (Wrapped in MainLayout)        │ • /live-feeds(Surveillance Video Wall)     │
│                                │ • /alerts    (Threat Triage & Siren Alarm) │
│                                │ • /map       (GIS Digital Twin & Radar)    │
│                                │ • /analytics (Crime Trends & Intelligence) │
│                                │ • /incidents (Audit Trail & Legal Registry)│
│                                │ • /operators (Field Patrols & Roster)      │
│                                │ • /settings  (SOP, Privacy & AI Tuning)    │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Fallback Route                 │ • /*         (Tactical 404 Radar Error)    │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

### 5.1 Landing Page (`/landing`)
* **Target Audience**: City administrators, Police Commissioners, Municipal Stakeholders, Demo Evaluators.
* **Problem Solved**: High-level system showcase, demonstrating why cities need automated intelligence instead of manual CCTV operators.
* **Key Features**:
  - **Live Dynamic Counter**: Real-time ticker counting simulated city events analyzed (14,800+ events and counting).
  - **Hero Section**: Cyber-styled headline with animated badges ("Urban Intelligence Core", "99.4% Threat Accuracy").
  - **Core Capability Cards**:
    1. *Real-Time Neural Vision* (YOLOv8 & ViT Core).
    2. *Automated Incident Dispatch* (< 2.3 min Response time).
    3. *Zero-Knowledge Privacy* (CJIS & ISO 27001 compliance).
    4. *GIS City Digital Twin* (Vector 3D map integration).
  - **Interactive Terminal Preview**: Live simulated ASCII log viewer showing detection events stream in real-time.
  - **Crime Matrix Table**: Breakdown of detectable threats (Violence, Crowd Surge, Vandalism, Weapon, Fire).
  - **Quick Demo Launcher**: One-click buttons to instantly jump into the Command Dashboard as an Operator, Supervisor, or Admin.

---

### 5.2 Authentication: Login (`/login`)
* **Target Audience**: Active Police Officers, Control Room Operators, Duty Supervisors.
* **Problem Solved**: Secure, authenticated tactical clearance with role identification.
* **Key Features**:
  - **Officer Credential Input**: Official Police Badge ID or Government Email login.
  - **Quick Demo Access Switcher**: One-click bypass buttons for instant evaluation:
    - *Operator*: Standard CCTV monitoring clearance.
    - *Supervisor*: Authorization to dispatch units and override alerts.
    - *Admin*: Full system configuration and AI parameter tuning.
  - **Clearance Level Visualizer**: Live security status indicators showing encryption level (AES-256 GCM) and server handshake status.

---

### 5.3 Authentication: Signup / Officer Provisioning (`/signup`)
* **Target Audience**: New command center personnel, precinct administrators.
* **Problem Solved**: Onboarding officers with specific department jurisdiction and clearance badges.
* **Key Features**:
  - **Officer Profile Form**: Full name, official email, automated Badge ID generator (`SEC-XXXX`).
  - **Department Selector**:
    - *Urban CCTV Command Unit*
    - *Highway & Traffic Interceptor Unit*
    - *Metro Rapid Transit Security*
    - *Special Weapons & Tactical Dispatch (SWAT)*
  - **Clearance Level Hierarchy**:
    - *Level 1 (Surveillance Monitoring)*
    - *Level 2 (Tactical Unit Dispatch)*
    - *Level 3 (Command Administration)*

---

### 5.4 Executive Tactical Dashboard (`/dashboard` & `/`)
* **Target Audience**: Duty Shift Commanders & Primary Control Room Operators.
* **Problem Solved**: Unified "Single Pane of Glass" showing complete city pulse, active crises, and AI processing metrics at one glance.
* **Key Features**:
  - **Executive KPI Cards**:
    - *Active Cameras*: Total connected streams vs offline cameras with online % badge.
    - *Critical Threats*: Count of currently active red-flag incidents requiring immediate action.
    - *Incidents Logged Today*: Daily total with percentage trend compared to yesterday.
    - *AI Pipeline Speed*: Real-time frame processing rate (e.g. 28.4 FPS) and average latency (34ms).
  - **Live Camera Grid Carousel**: Quick preview of key high-traffic city junctions with status badges; clicking opens the deep-stream modal.
  - **Urgent Active Alerts Panel**: Prioritized card stack of active threats with direct "Inspect" and "Acknowledge" triggers.
  - **Live Drill Simulator**: "Simulate Alert" button allowing command centers to run training drills by injecting synthetic events.
  - **Trend Visualizers**: Integrated micro-charts for hourly activity and incident breakdown.

---

### 5.5 Live Surveillance Video Wall (`/live-feeds`)
* **Target Audience**: Video wall operators and multi-stream monitors.
* **Problem Solved**: Replaces cumbersome multi-monitor DVR/NVR screens with an intelligent, searchable, filterable digital video wall.
* **Key Features**:
  - **Multi-Layout Switching**:
    - *Grid Mode (2x2, 3x3, 4x4)*: Standard operational grid.
    - *List Mode*: Detailed view with camera telemetry, location, and hardware status.
    - *Tactical Video Wall Mode*: Maximized, clutter-free layout optimized for 4K command room projectors.
  - **Real-Time Filters**: Filter cameras by Status (*Online, Offline, Warning*) and Zone (*Zone A - North, Zone B - Central, Zone C - Highway, Zone D - Metro*).
  - **Instant Search**: Search by Camera Name, Sector, or Hardware ID (`CAM-001`).
  - **Interactive Stream Modal**:
    - Fullscreen stream viewport with animated AI bounding boxes.
    - FPS counter, resolution badge (1080p / 4K), bitrate telemetry.
    - Pan-Tilt-Zoom (PTZ) control buttons (Zoom In, Zoom Out, Reset Pan).
    - Camera metadata, exact GPS coordinates, and historical alert logs.

---

### 5.6 Real-Time Alerts & Threat Triage (`/alerts`)
* **Target Audience**: Emergency Dispatchers & Triage Officers.
* **Problem Solved**: Eliminating alarm fatigue through structured categorization, risk escalation, and audio alarms.
* **Key Features**:
  - **Emergency Audio-Visual Siren**: Toggleable master siren button that plays an emergency audio alert upon critical threat detection and shows pulsating red HUD borders.
  - **Risk-Level Categorization**:
    - 🔴 **Critical**: Physical Violence, Active Fire, Armed Intrusion (requires immediate dispatch).
    - 🟠 **High**: Crowd Surges, Stampede Warning, Unattended Baggage in high-security transit.
    - 🟡 **Medium**: Illegal Parking, Traffic Congestion, Perimeter Trespassing.
    - 🟢 **Low**: Minor anomalies, loitering.
  - **Category Tabs**: Filter by *All Alerts*, *Active Urgent*, *Under Investigation*, and *Resolved*.
  - **Bulk Action Capabilities**: "Resolve All Active" button to clear false alarms after field verification.
  - **Deep-Dive Inspection Modal**: Detailed incident breakdown with AI confidence score, incident timeline, and 1-Click field dispatch.

---

### 5.7 GIS Digital Twin & Tactical Map (`/map`)
* **Target Audience**: Tactical Coordinators, Patrol Dispatchers, Drone Unit Pilots.
* **Problem Solved**: Bridging the gap between raw video footage and real-world geographical coordinates.
* **Key Features**:
  - **Interactive Geospatial Engine**: Leaflet-powered vector map centered over the city grid with custom dark satellite tiles.
  - **Dynamic Anomaly Markers**:
    - High-visibility pulsing radar rings around cameras currently flagging critical threats.
    - Color-coded pins matching alert risk levels (Red for violence, Amber for crowd, Blue for normal).
  - **Interactive Pin Popup**: Clicking any pin opens mini camera feed, incident description, and direct link to the full stream.
  - **Side Telemetry Drawer**: Collapsible sidebar listing active geo-located threats for instant pan-to-coordinate navigation.
  - **Full-Screen Tactical HUD Mode**: Dedicated cinema/projector mode with floating HUD compass, zoom controls, and active incident counter.

---

### 5.8 Crime Intelligence & Trend Analytics (`/analytics`)
* **Target Audience**: Police Chiefs, Crime Analysts, Municipal Planners.
* **Problem Solved**: Long-term pattern recognition to allocate police resources proactively rather than reactively.
* **Key Features**:
  - **Time-Horizon Selector**: Switch between *Last 24 Hours*, *Last 7 Days*, *Last 30 Days*, and *Last 90 Days*.
  - **Incident Frequency Trend**: Multi-day line graph showing crime and incident volume fluctuations.
  - **Crime Type Distribution**: Bar chart comparing violence, intrusion, unattended objects, traffic violations, and fire events.
  - **24-Hour Peak Activity Curve**: Area chart highlighting vulnerable time windows (e.g. peak nightlife hours 22:00 - 02:00).
  - **Resolution & Response Efficiency**: Pie chart tracking resolved vs investigating vs pending response rates.
  - **Target KPI Cards**: Average Response Time (2.3m), Prevention Rate (87.4%), False Alarm Rate (1.2%).

---

### 5.9 Incident Registry & Audit Trail (`/incidents`)
* **Target Audience**: Legal Compliance Officers, Internal Affairs, Lead Investigators.
* **Problem Solved**: Providing a legally admissible, immutable audit log of all security incidents and operator actions.
* **Key Features**:
  - **Searchable Data Table**: Filterable by incident date, keyword, location, camera ID, and risk level.
  - **Audit Metadata**: Records exact timestamp, detecting camera, handling operator ID, and action taken.
  - **Incident Details Dialog**: View original snapshot, AI detection confidence, operator notes, and dispatch chronology.
  - **Export Capabilities**: One-click export to CSV / formal Incident Report format for judicial and departmental records.

---

### 5.10 Tactical Operators & Field Units (`/operators`)
* **Target Audience**: Shift Supervisors, Command Center Human Resource Managers.
* **Problem Solved**: Real-time workforce management, operator workload balancing, and tactical communication.
* **Key Features**:
  - **Operator Roster Table**:
    - Name, Avatar, Role (*Senior Operator, Tactical Dispatcher, Duty Supervisor*).
    - Status (*Online, Offline, On Break*) with color-coded badges.
    - Assigned Sector / Zone (*Zone A North, Zone B Central, Zone C Highway*).
    - Live Alerts Handled count (to prevent operator burnout).
  - **Direct Tactical Communication**: One-click triggers to initiate direct Radio Link or secure VoIP call to any operator or field unit.
  - **Operator Provisioning Dialog**: Form to assign and provision new operators to specific camera zones.

---

### 5.11 System & AI SOP Configuration (`/settings`)
* **Target Audience**: System Administrators & Police AI Policy Configurers.
* **Problem Solved**: Fine-tuning AI detection thresholds, configuring alert channels, and enforcing privacy compliance without code redeployment.
* **Key Features**:
  - **General Tab**: Auto-refresh toggle, telemetry polling interval slider (5s to 60s), theme selection (*Dark Tactical / Cyber Light*).
  - **Notifications Tab**: System desktop notifications toggle, audio siren volume slider, critical incident email/SMS relays.
  - **Privacy & Compliance Tab**:
    - *Face Anonymization (Blurring)*: Toggles real-time edge blurring on civilian faces.
    - *License Plate Masking*: Masks vehicle license plates to comply with municipal data protection acts.
    - *Data Retention Policy*: Configurable auto-purge window (30, 60, 90 days) for archived footage.
  - **System & AI Model Tab**:
    - YOLOv8 model weights selection (`yolov8n.pt` / `yolov8s.pt`).
    - Detection confidence threshold slider (0.25 to 0.95).
    - Rule Engine sensitivity (Crowd proximity threshold in pixels).
    - Backend FastAPI endpoint URL and WebSocket health monitor.

---

### 5.12 Tactical 404 Not Found (`*`)
* **Target Audience**: Any user hitting an invalid URL path.
* **Problem Solved**: Maintaining tactical immersion with a styled military radar error screen rather than a generic broken web page.
* **Key Features**:
  - Cyber radar sweep graphic with error code `404: SECTOR_NOT_FOUND`.
  - Informative message: *"The requested tactical sector or coordinate does not exist in the municipal grid."*
  - Direct action button: *"Return to Command Center"* (`/dashboard`).

---

## 6. Global Persistent Components & Modals

In addition to individual pages, the application features cohesive global components accessible from anywhere:

1. **`MainLayout`**:
   - Master layout wrapper handling responsive sidebar collapse, persistent top navigation, and main content viewports.
2. **`Sidebar`**:
   - Collapsible tactical navigation bar with live notification badges (e.g. unread alert counts on the "Alerts" link).
3. **`TopNavbar`**:
   - Master emergency siren indicator with audio toggle.
   - Quick search / Command menu launcher (`Cmd+K`).
   - Notification drawer trigger with pulsating red indicator for active critical events.
   - Theme toggle (Dark / Light).
   - Officer clearance badge and profile dropdown.
4. **`NotificationDrawer`**:
   - Slide-over panel providing quick access to active alerts without navigating away from the current page.
5. **`CommandMenu` (`Cmd+K`)**:
   - Global keyboard-driven search palette to quickly jump to any page, search for a camera ID (`CAM-003`), or resolve active alerts.
6. **`AlertDetailsModal`**:
   - Comprehensive threat investigation modal with evidence review, bounding box toggle, and instant emergency dispatch buttons.
7. **`CameraStreamModal`**:
   - High-fidelity camera viewer with PTZ controls, AI overlay simulation, and stream telemetry.

---

## 7. State Management & Real-Time Engine

The frontend coordinates state across three dedicated React Contexts:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          GLOBAL STATE ENGINE                           │
├───────────────────┬───────────────────┬────────────────────────────────┤
│   `AuthContext`   │  `ThemeContext`   │     `NotificationContext`      │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ • Current Officer │ • Tactical Dark   │ • Active Alert Queue           │
│ • Clearance Level │ • Tactical Light  │ • Master Audio Siren State     │
│ • Role (Admin/Op) │ • Theme Switcher  │ • Web Audio Synthesizer (Beep) │
│ • Demo Bypass     │ • CSS Var Tokens  │ • Simulated Alert Trigger      │
└───────────────────┴───────────────────┴────────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
     `surveillanceAPI` (REST)           `wsManager` (WebSocket)
     • /system-status                   • ws://localhost:8000/ws
     • /alerts                          • Sub-second threat broadcast
     • /streams                         • Auto-reconnect with backoff
     • /analytics                       • Heartbeat health ping
```

---

## 8. Backend Integration (FastAPI + YOLOv8 + Police Rule Engine)

The frontend connects directly with the Python AI Backend (`ai-backend`):
- **FastAPI Endpoints**:
  - `GET /system-status`: Fetches active streams, model load status, FPS, and processing latency.
  - `GET /alerts`: Fetches recent detection events from SQLite database (`surveillance_system.db`).
  - `GET /analytics`: Aggregates crime distribution and detection metrics.
  - `POST /analyze-video`: Accepts manual video uploads for offline crime rule analysis.
  - `POST /start-stream` & `POST /stop-stream`: Dynamically controls RTSP camera streams.
- **WebSocket Gateway (`/ws`)**:
  - Broadcasts live threat detections instantaneously to the frontend `NotificationContext`.
- **Police Rule Engine Alignment**:
  - Translates AI detections into categorized risk levels matching standard police penal codes and response protocols.

---

## 9. Privacy, Compliance & Role-Based Access Control (RBAC)

1. **Role-Based Access Control (RBAC)**:
   - **Operator**: View live streams, monitor alerts, acknowledge threats.
   - **Tactical Supervisor**: All operator actions + Dispatch Patrol/Drone units, resolve critical incidents, manage operator shifts.
   - **Administrator**: Full access + AI model fine-tuning, camera stream provisioning, privacy retention policies.
2. **Civic Privacy Standards**:
   - Edge face-blurring ensures public privacy in compliance with municipal regulations and international data standards (GDPR/CJIS).
   - Tamper-evident incident logs ensure chain-of-custody validity for court evidence.

---

## 10. Future Roadmap & Scaling Strategy

1. **Phase 1 (Current Core Complete)**:
   - Full 12-page tactical interface with reactive dark UI, live charts, Leaflet GIS map, and simulated/real-time alert pipelines.
2. **Phase 2 (Drone Telemetry & Video Upload Lab)**:
   - Automated drone waypoint flight path integration on the GIS map.
   - Drag-and-drop forensic video file analyzer with bounding box playback scrubber.
3. **Phase 3 (Automated Legal FIR & Dispatch Sync)**:
   - Automated PDF FIR (First Information Report) generation with cryptographic timestamping.
   - Integration with external 911 / 112 CAD (Computer Aided Dispatch) systems.
4. **Phase 4 (Federated Multi-City Command)**:
   - Central headquarters view connecting multiple municipal command centers into a unified national security grid.

---
*CIVIC-AI — Empowering Smart Cities with Vision Intelligence, Proactive Safety, and Operational Excellence.*
