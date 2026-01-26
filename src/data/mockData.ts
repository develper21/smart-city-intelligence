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
  riskLevel: "low" | "medium" | "high" | "critical";
  timestamp: string;
  description: string;
  status: "active" | "resolved" | "investigating";
}

export interface Incident {
  id: string;
  date: string;
  count: number;
  type: string;
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  type: Alert["type"];
  riskLevel: Alert["riskLevel"];
  location: string;
}

// Mock camera data
export const mockCameras: Camera[] = [
  {
    id: "CAM-001",
    name: "Main Gate Entrance",
    location: "Sector 12, Gate A",
    status: "online",
    zone: "Zone A",
    lastUpdated: "2 min ago",
    thumbnail: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=250&fit=crop",
  },
  {
    id: "CAM-002",
    name: "Market Square",
    location: "Central Market, Block B",
    status: "online",
    zone: "Zone B",
    lastUpdated: "1 min ago",
    thumbnail: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=400&h=250&fit=crop",
  },
  {
    id: "CAM-003",
    name: "Highway Junction",
    location: "NH-44 Intersection",
    status: "warning",
    zone: "Zone C",
    lastUpdated: "5 min ago",
    thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop",
  },
  {
    id: "CAM-004",
    name: "Railway Station",
    location: "Platform 3-4",
    status: "online",
    zone: "Zone A",
    lastUpdated: "30 sec ago",
    thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=250&fit=crop",
  },
  {
    id: "CAM-005",
    name: "City Park",
    location: "Central Park, North",
    status: "offline",
    zone: "Zone D",
    lastUpdated: "1 hour ago",
    thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=250&fit=crop",
  },
  {
    id: "CAM-006",
    name: "Bus Terminal",
    location: "ISBT Terminal A",
    status: "online",
    zone: "Zone B",
    lastUpdated: "1 min ago",
    thumbnail: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop",
  },
];

// Mock alerts data
export const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    type: "intrusion",
    location: "Sector 12, Gate A",
    cameraId: "CAM-001",
    riskLevel: "critical",
    timestamp: "2024-01-26T10:45:00",
    description: "Unauthorized entry detected at restricted area",
    status: "active",
  },
  {
    id: "ALT-002",
    type: "crowd",
    location: "Central Market, Block B",
    cameraId: "CAM-002",
    riskLevel: "high",
    timestamp: "2024-01-26T10:30:00",
    description: "Unusual crowd gathering detected",
    status: "investigating",
  },
  {
    id: "ALT-003",
    type: "unattended",
    location: "Railway Station Platform 3",
    cameraId: "CAM-004",
    riskLevel: "high",
    timestamp: "2024-01-26T10:15:00",
    description: "Unattended bag detected near platform",
    status: "active",
  },
  {
    id: "ALT-004",
    type: "traffic",
    location: "NH-44 Intersection",
    cameraId: "CAM-003",
    riskLevel: "medium",
    timestamp: "2024-01-26T10:00:00",
    description: "Traffic congestion detected, possible accident",
    status: "investigating",
  },
  {
    id: "ALT-005",
    type: "violence",
    location: "Bus Terminal A",
    cameraId: "CAM-006",
    riskLevel: "critical",
    timestamp: "2024-01-26T09:45:00",
    description: "Physical altercation detected",
    status: "active",
  },
  {
    id: "ALT-006",
    type: "fire",
    location: "Industrial Zone, Building 4",
    cameraId: "CAM-007",
    riskLevel: "critical",
    timestamp: "2024-01-26T09:30:00",
    description: "Smoke and heat signature detected",
    status: "active",
  },
];

// Mock incidents over time
export const mockIncidentsOverTime = [
  { date: "Jan 20", incidents: 12, resolved: 10 },
  { date: "Jan 21", incidents: 19, resolved: 15 },
  { date: "Jan 22", incidents: 15, resolved: 14 },
  { date: "Jan 23", incidents: 22, resolved: 18 },
  { date: "Jan 24", incidents: 18, resolved: 16 },
  { date: "Jan 25", incidents: 25, resolved: 20 },
  { date: "Jan 26", incidents: 14, resolved: 8 },
];

// Mock alert types distribution
export const mockAlertTypeDistribution = [
  { type: "Intrusion", count: 45, color: "hsl(var(--chart-4))" },
  { type: "Violence", count: 23, color: "hsl(var(--chart-4))" },
  { type: "Unattended", count: 38, color: "hsl(var(--chart-3))" },
  { type: "Crowd", count: 52, color: "hsl(var(--chart-2))" },
  { type: "Traffic", count: 67, color: "hsl(var(--chart-1))" },
  { type: "Fire", count: 12, color: "hsl(var(--chart-4))" },
];

// Mock map pins
export const mockMapPins: MapPin[] = [
  { id: "1", lat: 28.6139, lng: 77.209, type: "intrusion", riskLevel: "critical", location: "Sector 12" },
  { id: "2", lat: 28.6229, lng: 77.219, type: "crowd", riskLevel: "high", location: "Central Market" },
  { id: "3", lat: 28.6339, lng: 77.199, type: "unattended", riskLevel: "high", location: "Railway Station" },
  { id: "4", lat: 28.6039, lng: 77.229, type: "traffic", riskLevel: "medium", location: "NH-44" },
  { id: "5", lat: 28.6189, lng: 77.239, type: "violence", riskLevel: "critical", location: "Bus Terminal" },
  { id: "6", lat: 28.5939, lng: 77.189, type: "fire", riskLevel: "critical", location: "Industrial Zone" },
  { id: "7", lat: 28.6289, lng: 77.179, type: "crowd", riskLevel: "medium", location: "City Park" },
  { id: "8", lat: 28.6089, lng: 77.249, type: "traffic", riskLevel: "low", location: "Ring Road" },
];

// Stats
export const mockStats = {
  totalCameras: 247,
  activeCameras: 231,
  totalAlerts: 14,
  criticalAlerts: 4,
  resolvedToday: 28,
  avgResponseTime: "2.3 min",
  riskLevel: "high" as const,
  systemUptime: 99.7,
};

// Hourly data for analytics
export const mockHourlyData = [
  { hour: "00:00", incidents: 3 },
  { hour: "02:00", incidents: 2 },
  { hour: "04:00", incidents: 1 },
  { hour: "06:00", incidents: 5 },
  { hour: "08:00", incidents: 12 },
  { hour: "10:00", incidents: 18 },
  { hour: "12:00", incidents: 15 },
  { hour: "14:00", incidents: 14 },
  { hour: "16:00", incidents: 20 },
  { hour: "18:00", incidents: 25 },
  { hour: "20:00", incidents: 16 },
  { hour: "22:00", incidents: 8 },
];

// Resolution stats
export const mockResolutionStats = [
  { status: "Resolved", count: 91, percentage: 65 },
  { status: "Investigating", count: 35, percentage: 25 },
  { status: "Active", count: 14, percentage: 10 },
];
