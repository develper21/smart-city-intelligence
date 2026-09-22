import bcrypt from "bcryptjs";

/**
 * ============================================================
 *  CIVIC-AI — SINGLE SEED DATA FILE
 * ============================================================
 *  Pura demo dataset jo frontend ke har page par dikhta hai
 *  YAHIN likha jata hai. DB (`server/data/*.json`) inhi seeds
 *  se banta hai. Data badalna ho to is file ko edit karein aur
 *  `server/data/` folder delete karke server restart karein.
 *
 *  Timestamps `hoursAgo()` se relative hain, isliye demo data
 *  hamesha fresh dikhta hai (analytics charts bhi bhare rehte hain).
 * ============================================================
 */

const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d) => hoursAgo(d * 24);

/* ------------------------------ USERS ------------------------------ */
/* Login: username YA email + password. Demo creds README me listed hain. */
export function seedUsers() {
  const mk = (id, username, email, password, name, role, permissions, department, zone, badge) => ({
    id,
    username,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    name,
    role,
    permissions,
    department,
    zone,
    badge,
    is_active: true,
    last_login: null,
    created_at: daysAgo(60),
  });

  return [
    mk(1, "admin", "rathore.v@intel.smartcity.gov", "admin123", "Commander Vikram Rathore", "admin",
      ["view", "acknowledge", "resolve", "dispatch", "manage_users", "manage_cameras", "configure_ai"],
      "Civil Protection & Cyber Intel", "Metropolitan Command Core", "INT-0001"),
    mk(2, "supervisor", "sneha.reddy@command.smartcity.gov", "supervisor123", "Sneha Reddy", "supervisor",
      ["view", "acknowledge", "resolve", "dispatch", "manage_users"],
      "Emergency Response Bureau", "All City Sectors", "ERB-3091"),
    mk(3, "operator", "rajesh.k@command.smartcity.gov", "operator123", "Rajesh Kumar", "operator",
      ["view", "acknowledge"],
      "Urban CCTV Command Unit", "Zone A - North District", "CSD-8842"),
    mk(4, "amir.khan", "amir.khan@traffic.smartcity.gov", "amir1234", "Amir Khan", "operator",
      ["view", "acknowledge"],
      "Highway & Traffic Interceptor Unit", "Zone C - Highway", "HTI-2210"),
    mk(5, "priya.nair", "priya.nair@metro.smartcity.gov", "priya1234", "Priya Nair", "operator",
      ["view", "acknowledge"],
      "Metro Rapid Transit Security", "Zone D - Metro", "MRT-1145"),
  ];
}

/* ----------------------------- CAMERAS ----------------------------- */
/* Live Feeds + Dashboard grid + Map pins (lat/lng) — sab isi se aata hai. */
const THUMBS = [
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop",
];

export function seedCameras() {
  const rows = [
    /* camera_id, name, location, status, zone, lat, lng */
    ["CAM-001", "Main Gate Entrance", "Sector 12, Gate A", "online", "Zone A", 28.6139, 77.209],
    ["CAM-002", "Market Square", "Central Market, Block B", "online", "Zone B", 28.6229, 77.219],
    ["CAM-003", "Highway Junction", "NH-44 Intersection", "warning", "Zone C", 28.6039, 77.229],
    ["CAM-004", "Railway Station", "Platform 3-4", "online", "Zone A", 28.6339, 77.199],
    ["CAM-005", "City Park", "Central Park, North", "offline", "Zone D", 28.6289, 77.179],
    ["CAM-006", "Bus Terminal", "ISBT Terminal A", "online", "Zone B", 28.6189, 77.239],
    ["CAM-007", "Metro Station Gate 2", "Sector 14, Metro Gate 2", "online", "Zone A", 28.645, 77.221],
    ["CAM-008", "Industrial Warehouse 3B", "North Industrial Area, Bay 3", "online", "Zone D", 28.5939, 77.189],
    ["CAM-009", "Flyover Km 12", "Express Highway, Flyover Km 12", "online", "Zone C", 28.5989, 77.249],
    ["CAM-010", "Mall Plaza", "City Center Mall, Main Plaza", "warning", "Zone B", 28.6169, 77.214],
    ["CAM-011", "Amphitheater", "Central Park, South Lawn", "online", "Zone D", 28.6259, 77.184],
    ["CAM-012", "Ring Road Junction", "Ring Road, Sector 8 Junction", "online", "Zone C", 28.6089, 77.254],
  ];

  return rows.map(([camera_id, name, location, status, zone, lat, lng], i) => ({
    id: i + 1,
    camera_id,
    name,
    location,
    status,
    zone,
    rtsp_url: `rtsp://civic.local/stream/${camera_id.toLowerCase()}`,
    lat,
    lng,
    ptz_config: { pan: 0, tilt: 0, zoom: 1 },
    thumbnail_path: THUMBS[i % THUMBS.length],
    created_at: daysAgo(30 - i),
    updated_at: hoursAgo(1 + i * 0.5),
  }));
}

/* ------------------------------ ALERTS ----------------------------- */
/* Alerts page, Dashboard queue, Incidents registry, Analytics charts,
   Map pins — sab alerts collection se derive hote hain.
   Status mix: active (triage queue), investigating, resolved (history). */
export function seedAlerts() {
  /* [event_type, camera_id, location, risk_level, message, status, hoursAgo, confidence] */
  const rows = [
    /* --- Active / recent (Alerts triage queue + Map live pins) --- */
    ["fire", "CAM-008", "North Industrial Area, Bay 3", "critical", "Smoke and heat signature detected in storage bay", "active", 0.75, 0.96],
    ["intrusion", "CAM-001", "Sector 12, Gate A", "critical", "Unauthorized entry detected at restricted area", "active", 1.5, 0.94],
    ["violence", "CAM-006", "ISBT Terminal A", "critical", "Physical altercation detected between two individuals", "active", 2.25, 0.91],
    ["unattended", "CAM-004", "Platform 3-4", "high", "Unattended bag detected near platform 3", "active", 3.5, 0.89],
    ["crowd", "CAM-002", "Central Market, Block B", "high", "Crowd density rising above safe threshold", "investigating", 5, 0.87],
    ["traffic", "CAM-003", "NH-44 Intersection", "medium", "Traffic congestion detected, possible accident", "investigating", 8, 0.83],
    ["intrusion", "CAM-010", "City Center Mall, Service Corridor", "medium", "After-hours motion detected in service corridor", "active", 9.5, 0.81],
    ["crowd", "CAM-007", "Sector 14, Metro Gate 2", "medium", "Evening rush crowding near fare gates", "investigating", 26, 0.85],
    ["traffic", "CAM-009", "Express Highway, Flyover Km 12", "medium", "Slow-moving traffic anomaly on flyover ramp", "investigating", 30, 0.79],
    ["unattended", "CAM-011", "Central Park, South Lawn", "low", "Unattended backpack near seating rows", "investigating", 47, 0.76],

    /* --- Resolved: last 7 days (hourly activity + trend charts) --- */
    ["intrusion", "CAM-005", "Central Park North Fence", "low", "Perimeter loitering detected after hours", "resolved", 20, 0.78],
    ["crowd", "CAM-007", "Metro Station Gate 2", "medium", "Crowd density above safe threshold", "resolved", 24, 0.88],
    ["traffic", "CAM-012", "Ring Road, Sector 8 Junction", "medium", "Illegal parking blocking right lane", "resolved", 28, 0.82],
    ["violence", "CAM-006", "ISBT Terminal A", "high", "Verbal altercation escalated near ticket counter", "resolved", 33, 0.9],
    ["unattended", "CAM-002", "Central Market, Block B", "medium", "Unattended trolley near cold storage", "resolved", 37, 0.8],
    ["intrusion", "CAM-003", "NH-44 Intersection", "medium", "Pedestrian on highway carriageway", "resolved", 41, 0.86],
    ["crowd", "CAM-010", "City Center Mall, Main Plaza", "high", "Weekend sale crowd surge at atrium", "resolved", 45, 0.92],
    ["fire", "CAM-008", "North Industrial Area, Bay 1", "high", "Short-lived smoke burst near exhaust vent", "resolved", 49, 0.87],
    ["traffic", "CAM-009", "Express Highway, Flyover Km 12", "low", "Broken-down vehicle on hard shoulder", "resolved", 53, 0.77],
    ["intrusion", "CAM-011", "Central Park, South Lawn", "low", "Climbing over closed-area fencing", "resolved", 58, 0.74],
    ["crowd", "CAM-004", "Platform 3-4", "medium", "Platform overcrowding after train delay", "resolved", 62, 0.84],
    ["unattended", "CAM-007", "Sector 14, Metro Gate 2", "medium", "Unclaimed suitcase near gate scanner", "resolved", 66, 0.9],
    ["traffic", "CAM-003", "NH-44 Intersection", "high", "Multi-vehicle slow collision at junction", "resolved", 70, 0.93],
    ["intrusion", "CAM-001", "Sector 12, Gate A", "high", "Attempted gate breach after midnight", "resolved", 74, 0.91],
    ["crowd", "CAM-002", "Central Market, Block B", "medium", "Protest gathering forming at market square", "resolved", 84, 0.88],
    ["violence", "CAM-010", "City Center Mall, Main Plaza", "medium", "Shoving match outside food court", "resolved", 96, 0.85],
    ["fire", "CAM-012", "Ring Road, Sector 8 Junction", "low", "Vehicle smoke scare, false alarm verified", "resolved", 120, 0.72],
    ["intrusion", "CAM-005", "Central Park, North", "low", "After-hours jogger in maintenance area", "resolved", 144, 0.71],

    /* --- Resolved: 8-30 days (30-day analytics horizon) --- */
    ["crowd", "CAM-011", "Central Park, Amphitheater", "high", "Concert crowd stampede warning", "resolved", 168, 0.94],
    ["traffic", "CAM-009", "Express Highway, Flyover Km 12", "medium", "Over-speeding cluster detected", "resolved", 240, 0.83],
    ["intrusion", "CAM-008", "North Industrial Area, Bay 3", "critical", "Warehouse break-in, suspects fled", "resolved", 288, 0.95],
    ["unattended", "CAM-004", "Platform 3-4", "high", "Unattended briefcase, bomb squad cleared", "resolved", 360, 0.97],
    ["violence", "CAM-006", "ISBT Terminal A", "high", "Group scuffle at boarding gate", "resolved", 432, 0.89],
    ["fire", "CAM-003", "NH-44 Intersection", "medium", "Engine fire quickly extinguished", "resolved", 504, 0.86],
    ["crowd", "CAM-007", "Sector 14, Metro Gate 2", "medium", "Festival crowd overflow on concourse", "resolved", 600, 0.87],
    ["intrusion", "CAM-010", "City Center Mall, Main Plaza", "medium", "After-hours staff-only zone breach", "resolved", 720, 0.82],
  ];

  return rows.map(([event_type, camera_id, location, risk_level, message, status, h, confidence], i) => {
    const isResolved = status === "resolved";
    const acknowledged = status !== "active";
    return {
      id: i + 1,
      event_ref: `ALT-${String(i + 1).padStart(3, "0")}`,
      event_type,
      camera_id,
      location,
      risk_level,
      message,
      confidence,
      status,
      acknowledged,
      acknowledged_by: acknowledged ? "operator" : null,
      acknowledged_time: acknowledged ? hoursAgo(h - 0.2) : null,
      resolved: isResolved,
      resolved_time: isResolved ? hoursAgo(Math.max(h - 1, 0.1)) : null,
      alert_time: hoursAgo(h),
    };
  });
}

/* ---------------------------- OPERATORS ---------------------------- */
/* Operators page roster + stats — /api/analytics/operators se aata hai. */
const OPERATOR_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=120&h=120&fit=crop",
];

export function seedOperators() {
  const rows = [
    /* badge, name, role, department, unit, status, zone, alerts_handled */
    ["OP-4091", "Rajesh Kumar", "Operator", "Urban CCTV Command Unit", "CSD-8842", "online", "Zone A - North District", 12],
    ["SUP-1022", "Sneha Reddy", "Supervisor", "Emergency Response Bureau", "ERB-3091", "online", "All City Sectors", 34],
    ["ADM-001", "Vikram Rathore", "System Admin", "Civil Protection & Cyber Intel", "INT-0001", "busy", "Metropolitan Command Core", 7],
    ["OP-5110", "Amir Khan", "Tactical Dispatcher", "Highway & Traffic Interceptor Unit", "HTI-2210", "offline", "Zone C - Highway", 21],
    ["OP-6215", "Priya Nair", "Senior Operator", "Metro Rapid Transit Security", "MRT-1145", "online", "Zone D - Metro", 18],
    ["OP-7330", "Kabir Malhotra", "Surveillance Officer", "Urban CCTV Command Unit", "UCU-7330", "online", "Zone B - Central", 9],
    ["OP-8451", "Meera Iyer", "Duty Supervisor", "Emergency Response Bureau", "ERB-8451", "on_break", "All City Sectors", 27],
    ["OP-9902", "Arjun Desai", "Response Coordinator", "Civil Protection Division", "CPD-9902", "online", "Zone D - Industrial", 15],
  ];

  return rows.map(([badge, name, role, department, unit, status, zone, alerts_handled], i) => ({
    id: i + 1,
    badge,
    name,
    role,
    department,
    unit,
    status,
    zone,
    alerts_handled,
    avatar: OPERATOR_AVATARS[i % OPERATOR_AVATARS.length],
    last_active: hoursAgo(i * 2 + 0.5),
  }));
}

/* ----------------------------- SETTINGS ---------------------------- */
/* Settings page — /api/settings. Theme LIGHT hai (dark theme removed). */
export function seedSettings() {
  return [
    {
      id: "global",
      auto_refresh: true,
      telemetry_interval_s: 15,
      theme: "light",
      notifications: { desktop: true, siren_volume: 0.8, email_relay: true, sms_relay: false },
      privacy: { face_anonymization: true, plate_masking: true, retention_days: 60 },
      ai: { model: "yolov8n.pt", confidence_threshold: 0.45, crowd_proximity_px: 120, simulation_enabled: true },
    },
  ];
}
