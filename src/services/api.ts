import axios, { AxiosError, AxiosRequestConfig } from "axios";

/* Backend base URL — VITE_API_URL set karke override kar sakte hain */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_PREFIX = "/api";
const TOKEN_KEY = "civic-ai-access-token";
const REFRESH_KEY = "civic-ai-refresh-token";

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const setTokens = (access: string, refresh?: string) => {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
};
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

export const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

/* ---------- JWT injection + single-flight refresh on 401 ---------- */
let refreshPromise: Promise<boolean> | null = null;

export async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, { refresh_token: refreshToken })
      .then((res) => {
        setTokens(res.data.access_token);
        return true;
      })
      .catch(() => {
        clearTokens();
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/register");
    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      const refreshed = await tryRefresh();
      if (refreshed && original.headers) {
        original.headers.Authorization = `Bearer ${getAccessToken()}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export const wsUrl = `${API_BASE_URL.replace(/^http/, "ws")}/ws`;

/* ================= Types (frontend UI shapes) ================= */
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type AlertStatus = "active" | "resolved" | "investigating";

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "warning";
  zone: string;
  lastUpdated: string;
  thumbnail: string;
}

export interface Alert {
  id: string;
  type: "intrusion" | "violence" | "unattended" | "crowd" | "traffic" | "fire";
  location: string;
  cameraId: string;
  riskLevel: RiskLevel;
  timestamp: string;
  description: string;
  status: AlertStatus;
  confidence?: number;
  numericId?: number;
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  type: Alert["type"];
  riskLevel: Alert["riskLevel"];
  location: string;
}

export interface Operator {
  id: string;
  name: string;
  role: string;
  status: "online" | "offline" | "busy" | "on_break";
  zone: string;
  alerts: number;
  lastActive: string;
  avatar?: string | null;
  department?: string;
}

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  badge?: string;
  department?: string;
  zone?: string;
  is_active: boolean;
}

export interface AuthPayload {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: BackendUser;
}

/* ================= Mappers: backend rows → UI shapes ================= */
/* eslint-disable @typescript-eslint/no-explicit-any -- backend JSON rows are untyped at the boundary */
type Raw = Record<string, any>;

export function mapCamera(c: Raw): Camera {
  return {
    id: c.camera_id ?? `CAM-${c.id}`,
    name: c.name ?? "Camera",
    location: c.location ?? "Unknown",
    status: (["online", "offline", "warning"].includes(c.status) ? c.status : "online") as Camera["status"],
    zone: c.zone ?? "Zone A",
    lastUpdated: c.updated_at ? timeAgo(c.updated_at) : "Just now",
    thumbnail:
      c.thumbnail_path ||
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=250&fit=crop",
  };
}

export function mapAlert(a: Raw): Alert {
  const status: AlertStatus =
    a.status === "resolved" ? "resolved" : a.status === "investigating" ? "investigating" : "active";
  return {
    id: a.event_ref || `ALT-${String(a.id).padStart(3, "0")}`,
    numericId: a.id,
    type: (["intrusion", "violence", "unattended", "crowd", "traffic", "fire"].includes(a.event_type)
      ? a.event_type
      : "intrusion") as Alert["type"],
    location: a.location ?? "Unknown",
    cameraId: a.camera_id ?? "CAM-001",
    riskLevel: (["low", "medium", "high", "critical"].includes(a.risk_level) ? a.risk_level : "medium") as RiskLevel,
    timestamp: a.alert_time ?? new Date().toISOString(),
    description: a.message ?? "Anomalous event flagged by neural engine.",
    status,
    confidence: a.confidence,
  };
}

export function mapOperator(o: Raw): Operator {
  return {
    id: o.badge ?? `OP-${o.id}`,
    name: o.name ?? "Operator",
    role: o.role ?? "Operator",
    status: o.status === "on_break" ? "busy" : o.status,
    zone: o.zone ?? "All City Sectors",
    alerts: o.alerts_handled ?? 0,
    lastActive: timeAgo(o.last_active ?? new Date().toISOString()),
    avatar: o.avatar,
    department: o.department,
  };
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

/* ================= API functions ================= */
export const surveillanceAPI = {
  /* ---- Auth ---- */
  async login(identifier: string, password: string): Promise<AuthPayload> {
    const body: Record<string, string> = { password };
    if (identifier.includes("@")) body.email = identifier;
    else body.username = identifier;
    const { data } = await api.post<AuthPayload>("/auth/login", body);
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async register(payload: {
    username: string;
    email: string;
    password: string;
    name?: string;
    role?: string;
    department?: string;
    zone?: string;
    badge?: string;
  }): Promise<{ message: string; user: BackendUser }> {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  async getMe(): Promise<BackendUser> {
    const { data } = await api.get("/auth/me");
    return data;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      /* stateless logout — ignore */
    }
    clearTokens();
  },

  /* ---- System ---- */
  async getSystemStatus() {
    const { data } = await api.get("/system-status");
    return data;
  },

  /* ---- Alerts ---- */
  async getAlerts(params?: {
    limit?: number;
    offset?: number;
    risk_level?: string;
    event_type?: string;
    status?: string;
    camera_id?: string;
  }): Promise<{ alerts: Alert[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    if (params?.risk_level && params.risk_level !== "all") qs.set("risk_level", params.risk_level);
    if (params?.event_type && params.event_type !== "all") qs.set("event_type", params.event_type);
    if (params?.status && params.status !== "all") qs.set("status", params.status);
    if (params?.camera_id) qs.set("camera_id", params.camera_id);
    const { data } = await api.get(`/alerts?${qs.toString()}`);
    return { alerts: (data.alerts || []).map(mapAlert), total: data.total ?? 0 };
  },

  async acknowledgeAlert(numericId: number, by: string) {
    const { data } = await api.put(`/alerts/${numericId}/acknowledge`, null, {
      params: { acknowledged_by: by },
    });
    return data;
  },

  async resolveAlert(numericId: number, by: string) {
    const { data } = await api.put(`/alerts/${numericId}/resolve`, null, {
      params: { acknowledged_by: by },
    });
    return data;
  },

  async bulkResolveAlerts(numericIds: number[], by: string) {
    const { data } = await api.post(`/alerts/bulk-resolve?acknowledged_by=${encodeURIComponent(by)}`, {
      alert_ids: numericIds,
    });
    return data;
  },

  async raiseAlert(payload: {
    event_type: string;
    message: string;
    camera_id?: string;
    location?: string;
    risk_level?: string;
  }) {
    const { data } = await api.post("/alerts", payload);
    return mapAlert(data);
  },

  /* ---- Cameras ---- */
  async getCameras(params?: { status?: string; zone?: string }): Promise<Camera[]> {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== "all") qs.set("status", params.status);
    if (params?.zone && params.zone !== "all") qs.set("zone", params.zone);
    const { data } = await api.get(`/cameras?${qs.toString()}`);
    return (Array.isArray(data) ? data : []).map(mapCamera);
  },

  async createCamera(payload: {
    camera_id: string;
    name: string;
    location: string;
    zone: string;
    rtsp_url?: string;
  }) {
    const { data } = await api.post("/cameras", payload);
    return mapCamera(data);
  },

  async deleteCamera(id: number) {
    const { data } = await api.delete(`/cameras/${id}`);
    return data;
  },

  async controlPTZ(id: number, ptz: { pan?: number; tilt?: number; zoom?: number }) {
    const { data } = await api.post(`/cameras/${id}/ptz`, ptz);
    return data;
  },

  /* ---- Analytics ---- */
  async getSummary() {
    const { data } = await api.get("/analytics/summary");
    return data;
  },

  async getIncidentsOverTime(days = 7): Promise<{ date: string; incidents: number; resolved: number }[]> {
    const { data } = await api.get(`/analytics/incidents-over-time?days=${days}`);
    return data.data ?? [];
  },

  async getAlertTypes(): Promise<{ type: string; count: number; color: string }[]> {
    const { data } = await api.get("/analytics/alert-types");
    return data.data ?? [];
  },

  async getHourlyActivity(): Promise<{ hour: string; incidents: number }[]> {
    const { data } = await api.get("/analytics/hourly-activity");
    return data.data ?? [];
  },

  async getResolutionStatus(): Promise<{ status: string; count: number; percentage: number }[]> {
    const { data } = await api.get("/analytics/resolution-status");
    return data.data ?? [];
  },

  async getPerformance() {
    const { data } = await api.get("/analytics/performance");
    return data;
  },

  async getMapPins(): Promise<MapPin[]> {
    const { data } = await api.get("/analytics/map-pins");
    return (data.pins ?? []).map((p: Raw): MapPin => ({
      id: String(p.id),
      lat: Number(p.lat) || 28.6139,
      lng: Number(p.lng) || 77.209,
      type: (["intrusion", "violence", "unattended", "crowd", "traffic", "fire"].includes(p.type)
        ? p.type
        : "intrusion") as MapPin["type"],
      riskLevel: (["low", "medium", "high", "critical"].includes(p.riskLevel) ? p.riskLevel : "medium") as RiskLevel,
      location: p.location ?? "Unknown",
    }));
  },

  /* ---- Operators ---- */
  async getOperators(): Promise<Operator[]> {
    const { data } = await api.get("/analytics/operators");
    return (Array.isArray(data) ? data : []).map(mapOperator);
  },

  /* ---- Settings ---- */
  async getSettings() {
    const { data } = await api.get("/settings");
    return data;
  },

  async updateSettings(patch: object) {
    const { data } = await api.put("/settings", patch);
    return data;
  },
};

/* ================= WebSocket manager ================= */
export type WsMessage = { type: string; payload?: any; timestamp?: string };

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private listeners = new Set<(msg: WsMessage) => void>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 8;
  private reconnectDelay = 1500;
  private closedByUser = false;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    this.closedByUser = false;
    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.listeners.forEach((l) => l({ type: "system_status", payload: { status: "connected" } }));
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WsMessage;
          this.listeners.forEach((l) => l(data));
        } catch {
          /* ignore malformed frames */
        }
      };
      this.ws.onclose = () => {
        if (!this.closedByUser) this.attemptReconnect();
      };
      this.ws.onerror = () => this.ws?.close();
    } catch {
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect() {
    this.closedByUser = true;
    this.ws?.close();
    this.ws = null;
  }

  on(listener: (msg: WsMessage) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();

export default surveillanceAPI;
