import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "@/services/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ZoomIn,
  ZoomOut,
  Locate,
  Layers,
  ShieldAlert,
  AlertTriangle,
  Users,
  Car,
  Flame,
  Package,
  MapPin as MapPinIcon,
  ChevronRight,
  Eye,
  Radio,
  Satellite,
  Compass,
} from "lucide-react";
import { RiskBadge } from "./RiskIndicator";

interface InteractiveMapProps {
  pins: MapPin[];
  className?: string;
  onInspectAlert?: (pin: MapPin) => void;
}

// Tactical SVG marker generator (Clean vector icons, no cartoon emojis)
const createTacticalMarkerIcon = (type: MapPin["type"], riskLevel: MapPin["riskLevel"]) => {
  const colorMap = {
    critical: "#ef4444",
    high: "#f59e0b",
    medium: "#38bdf8",
    low: "#22c55e",
  };

  const svgIcons: Record<MapPin["type"], string> = {
    intrusion: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
    violence: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    crowd: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    traffic: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.9 2 11.2 2 11.6V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
    fire: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    unattended: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  };

  const color = colorMap[riskLevel] || "#38bdf8";
  const icon = svgIcons[type] || svgIcons.intrusion;

  return L.divIcon({
    className: "tactical-marker",
    html: `
      <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; inset:0; border-radius:50%; background:${color}33; border:1.5px solid ${color}88; animation:ping-radar 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:relative; width:30px; height:30px; border-radius:50%; background:${color}; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px ${color}cc, 0 4px 10px rgba(0,0,0,0.6); border:2px solid #ffffff;">
          ${icon}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
};

// Automatic Resize Handler for smooth Fullscreen, Sidebar, and Tab transitions
function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);
  return null;
}

// On-Map Tactical Navigation Controls
function MapControls({
  mapMode,
  setMapMode,
}: {
  mapMode: "satellite" | "vector";
  setMapMode: (mode: "satellite" | "vector") => void;
}) {
  const map = useMap();

  return (
    <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-2 pointer-events-auto">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 bg-card/95 backdrop-blur-md border-border/80 hover:bg-card shadow-xl text-foreground"
        onClick={() => map.zoomIn()}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 bg-card/95 backdrop-blur-md border-border/80 hover:bg-card shadow-xl text-foreground"
        onClick={() => map.zoomOut()}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 bg-card/95 backdrop-blur-md border-border/80 hover:bg-card shadow-xl text-foreground"
        onClick={() => map.setView([28.6139, 77.209], 13)}
        title="Recenter Metro Core"
      >
        <Locate className="h-4 w-4 text-primary" />
      </Button>
      <Button
        variant={mapMode === "satellite" ? "default" : "outline"}
        size="icon"
        className={cn(
          "h-9 w-9 backdrop-blur-md shadow-xl transition-all",
          mapMode === "satellite"
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card/95 border-border/80 text-foreground"
        )}
        onClick={() => setMapMode(mapMode === "satellite" ? "vector" : "satellite")}
        title={mapMode === "satellite" ? "Switch to Vector Street Map" : "Switch to Satellite Imagery"}
      >
        <Satellite className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function InteractiveMap({
  pins,
  className,
  onInspectAlert,
}: InteractiveMapProps) {
  const [activeRiskFilter, setActiveRiskFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapMode, setMapMode] = useState<"satellite" | "vector">("satellite");

  const filteredPins = pins.filter((pin) => {
    const matchesRisk = activeRiskFilter === "all" || pin.riskLevel === activeRiskFilter;
    const matchesType = activeTypeFilter === "all" || pin.type === activeTypeFilter;
    const matchesSearch =
      searchQuery === "" ||
      pin.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesType && matchesSearch;
  });

  const defaultCenter: [number, number] = [28.6139, 77.209];
  const defaultZoom = 12;

  const incidentTypes = [
    { key: "all", label: "All Anomalies", icon: MapPinIcon },
    { key: "intrusion", label: "Intrusion", icon: ShieldAlert },
    { key: "violence", label: "Violence", icon: AlertTriangle },
    { key: "crowd", label: "Crowd", icon: Users },
    { key: "traffic", label: "Traffic", icon: Car },
    { key: "fire", label: "Fire / Smoke", icon: Flame },
    { key: "unattended", label: "Unattended", icon: Package },
  ];

  return (
    <div className={cn("relative rounded-2xl overflow-hidden border border-border/70 shadow-2xl isolate", className)}>
      {/* Top Floating Tactical Command Filter Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2.5 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Quick Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search sector, street, or anomaly..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-card/95 backdrop-blur-xl border-border/80 shadow-lg text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Risk Level Filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-lg">
            {[
              { key: "all", label: "All Risks" },
              { key: "critical", label: "Critical", color: "bg-destructive" },
              { key: "high", label: "High", color: "bg-warning" },
              { key: "medium", label: "Medium", color: "bg-sky-400" },
              { key: "low", label: "Low", color: "bg-emerald-500" },
            ].map((rf) => (
              <Button
                key={rf.key}
                variant={activeRiskFilter === rf.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveRiskFilter(rf.key)}
                className={cn(
                  "h-7 px-2.5 text-[11px] font-medium rounded-lg text-foreground hover:bg-secondary",
                  activeRiskFilter === rf.key && "font-semibold text-primary-foreground bg-primary glow-primary hover:bg-primary/90"
                )}
              >
                {rf.color && <span className={cn("h-2 w-2 rounded-full mr-1.5", rf.color)} />}
                {rf.label}
              </Button>
            ))}
          </div>

          {/* Map Layer Mode Switcher Pill */}
          <div className="ml-auto hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-lg text-xs font-mono text-foreground">
            <span className="text-muted-foreground px-2 text-[10px]">LAYER:</span>
            <Button
              variant={mapMode === "satellite" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMapMode("satellite")}
              className={cn(
                "h-7 text-[11px] px-2.5 rounded-lg",
                mapMode === "satellite" && "bg-primary text-primary-foreground font-semibold"
              )}
            >
              Satellite Hybrid
            </Button>
            <Button
              variant={mapMode === "vector" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMapMode("vector")}
              className={cn(
                "h-7 text-[11px] px-2.5 rounded-lg",
                mapMode === "vector" && "bg-primary text-primary-foreground font-semibold"
              )}
            >
              Vector Street
            </Button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 pointer-events-auto custom-scrollbar">
          {incidentTypes.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTypeFilter === item.key;
            return (
              <Button
                key={item.key}
                variant={isSelected ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveTypeFilter(item.key)}
                className={cn(
                  "h-7 px-2.5 text-[11px] rounded-xl shrink-0 backdrop-blur-md border shadow-sm",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "bg-card/95 text-foreground hover:bg-card border-border/80"
                )}
              >
                <Icon className={cn("h-3 w-3 mr-1.5 shrink-0", isSelected ? "text-primary-foreground" : "text-primary")} />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Floating Tactical Legend & Telemetry */}
      <div className="absolute bottom-5 left-5 z-20 glass-card p-3.5 rounded-2xl shadow-2xl border border-border/80 max-w-[240px] hidden md:block">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-primary animate-pulse" /> SENSOR RADAR
          </span>
          <Badge variant="outline" className="text-[9px] font-mono border-primary/40 text-primary">
            {filteredPins.length} PINS
          </Badge>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Critical Hotspots</span>
            <span className="font-mono text-destructive font-bold">
              {pins.filter((p) => p.riskLevel === "critical").length}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>High Risk Targets</span>
            <span className="font-mono text-warning font-bold">
              {pins.filter((p) => p.riskLevel === "high").length}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Satellite Mode</span>
            <span className="font-mono text-emerald-400 font-bold uppercase">{mapMode}</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        style={{ height: "100%", width: "100%", minHeight: "550px", background: "#eef2f6" }}
        zoomControl={false}
      >
        <MapAutoResize />

        {/* High-Resolution Satellite Tiles (Esri World Imagery) without API Key Watermarks */}
        {mapMode === "satellite" ? (
          <>
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            {/* Satellite Street Labels & City Boundaries Overlay */}
            <TileLayer
              attribution=""
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              opacity={0.85}
            />
          </>
        ) : (
          /* High-Contrast Clean Vector OpenStreetMap */
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* Tactical Incident Markers */}
        {filteredPins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={createTacticalMarkerIcon(pin.type, pin.riskLevel)}
          >
            <Popup className="tactical-hud-popup">
              <div className="p-2 space-y-2 min-w-[220px]">
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                    {pin.type} ALERT
                  </span>
                  <RiskBadge level={pin.riskLevel} />
                </div>

                <div>
                  <p className="text-xs font-bold text-foreground">{pin.location}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    GEO: {pin.lat.toFixed(4)}°N, {pin.lng.toFixed(4)}°E
                  </p>
                </div>

                <Button
                  size="sm"
                  className="w-full text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-1.5 mt-1"
                  onClick={() => {
                    if (onInspectAlert) onInspectAlert(pin);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Triage Case Dossier</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapControls mapMode={mapMode} setMapMode={setMapMode} />
      </MapContainer>

      {/* Global Embedded Styles for Map HUD */}
      <style>{`
        .leaflet-container {
          background: #eef2f6 !important;
          font-family: inherit;
        }

        .tactical-marker {
          background: transparent !important;
          border: none !important;
        }

        @keyframes ping-radar {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        .leaflet-popup-content-wrapper {
          background: hsl(var(--card) / 0.95) !important;
          backdrop-filter: blur(16px) !important;
          color: hsl(var(--card-foreground)) !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
          border: 1px solid hsl(var(--border) / 0.8) !important;
          padding: 4px !important;
        }

        .leaflet-popup-tip {
          background: hsl(var(--card) / 0.95) !important;
          border: 1px solid hsl(var(--border) / 0.8) !important;
        }

        .leaflet-popup-close-button {
          color: hsl(var(--muted-foreground)) !important;
          padding: 6px !important;
        }

        .leaflet-popup-close-button:hover {
          color: hsl(var(--foreground)) !important;
        }

        .leaflet-control-attribution {
          background: hsl(var(--card) / 0.75) !important;
          backdrop-filter: blur(8px) !important;
          color: hsl(var(--muted-foreground)) !important;
          font-size: 9px !important;
          border-radius: 6px !important;
          margin: 4px !important;
        }

        .leaflet-control-attribution a {
          color: hsl(var(--primary)) !important;
        }
      `}</style>
    </div>
  );
}
