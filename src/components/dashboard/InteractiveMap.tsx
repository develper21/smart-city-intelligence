import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ZoomIn, ZoomOut, Locate, Layers } from "lucide-react";

interface InteractiveMapProps {
  pins: MapPin[];
  className?: string;
}

// Custom marker icons based on incident type and risk level
const createCustomIcon = (type: MapPin["type"], riskLevel: MapPin["riskLevel"]) => {
  const colorMap = {
    critical: "#ef4444",
    high: "#f59e0b",
    medium: "#3b82f6",
    low: "#22c55e",
  };

  const iconMap = {
    intrusion: "🛡️",
    violence: "⚠️",
    crowd: "👥",
    traffic: "🚗",
    fire: "🔥",
    unattended: "📦",
  };

  const color = colorMap[riskLevel];
  const icon = iconMap[type];

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px ${color}80, 0 4px 12px rgba(0,0,0,0.4);
        border: 2px solid rgba(255,255,255,0.3);
        animation: pulse 2s infinite;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${icon}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Map controls component
function MapControls() {
  const map = useMap();

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 bg-card/95 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg"
        onClick={() => map.zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 bg-card/95 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg"
        onClick={() => map.zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 bg-card/95 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg"
        onClick={() => map.setView([28.6139, 77.209], 13)}
      >
        <Locate className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 bg-card/95 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg"
      >
        <Layers className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Filter buttons component
function FilterButtons({
  activeFilter,
  setActiveFilter,
}: {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}) {
  const filters = [
    { key: "all", label: "All" },
    { key: "critical", label: "Critical", color: "bg-destructive" },
    { key: "high", label: "High", color: "bg-warning" },
    { key: "medium", label: "Medium", color: "bg-info" },
    { key: "low", label: "Low", color: "bg-success" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(filter.key)}
          className={cn(
            "text-xs h-8 bg-card/95 backdrop-blur-sm shadow-md border-border/50",
            activeFilter === filter.key && "glow-primary"
          )}
        >
          {filter.color && (
            <span className={cn("h-2 w-2 rounded-full mr-1.5", filter.color)} />
          )}
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

// Incident type filter buttons
function IncidentTypeFilters({
  activeType,
  setActiveType,
}: {
  activeType: string;
  setActiveType: (type: string) => void;
}) {
  const types = [
    { key: "all", label: "All Types", icon: "📍" },
    { key: "intrusion", label: "Intrusion", icon: "🛡️" },
    { key: "violence", label: "Violence", icon: "⚠️" },
    { key: "crowd", label: "Crowd", icon: "👥" },
    { key: "traffic", label: "Traffic", icon: "🚗" },
    { key: "fire", label: "Fire", icon: "🔥" },
    { key: "unattended", label: "Unattended", icon: "📦" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {types.map((type) => (
        <Button
          key={type.key}
          variant={activeType === type.key ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveType(type.key)}
          className={cn(
            "text-xs h-8 bg-card/95 backdrop-blur-sm shadow-md border-border/50",
            activeType === type.key && "glow-primary"
          )}
        >
          <span className="mr-1">{type.icon}</span>
          {type.label}
        </Button>
      ))}
    </div>
  );
}

export function InteractiveMap({ pins, className }: InteractiveMapProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPins = pins.filter((pin) => {
    const matchesRisk = activeFilter === "all" || pin.riskLevel === activeFilter;
    const matchesType = activeType === "all" || pin.type === activeType;
    const matchesSearch =
      searchQuery === "" ||
      pin.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesType && matchesSearch;
  });

  // Default center on Delhi, India
  const defaultCenter: [number, number] = [28.6139, 77.209];
  const defaultZoom = 12;

  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      {/* Search and Filters */}
      <div className="absolute top-4 left-4 right-4 z-[1000] space-y-3">
        {/* Search bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg"
          />
        </div>

        {/* Risk level filters */}
        <FilterButtons activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        {/* Incident type filters */}
        <IncidentTypeFilters activeType={activeType} setActiveType={setActiveType} />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-card p-4 rounded-xl shadow-lg">
        <p className="text-xs font-semibold mb-3 text-foreground">Incident Types</p>
        <div className="space-y-2">
          {[
            { type: "Intrusion", icon: "🛡️", color: "bg-destructive" },
            { type: "Violence", icon: "⚠️", color: "bg-destructive" },
            { type: "Crowd", icon: "👥", color: "bg-warning" },
            { type: "Traffic", icon: "🚗", color: "bg-info" },
            { type: "Fire", icon: "🔥", color: "bg-destructive" },
            { type: "Unattended", icon: "📦", color: "bg-warning" },
          ].map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              <span className="text-sm">{item.icon}</span>
              <span className={cn("h-2 w-2 rounded-full", item.color)} />
              <span className="text-xs text-muted-foreground">{item.type}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs font-semibold mb-2">Risk Levels</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { level: "Critical", color: "bg-destructive" },
              { level: "High", color: "bg-warning" },
              { level: "Medium", color: "bg-info" },
              { level: "Low", color: "bg-success" },
            ].map((item) => (
              <div key={item.level} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", item.color)} />
                <span className="text-xs text-muted-foreground">{item.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-32 right-4 z-[1000] glass-card p-3 rounded-xl shadow-lg">
        <p className="text-xs font-semibold mb-2">Active Incidents</p>
        <p className="text-2xl font-bold text-primary">{filteredPins.length}</p>
        <p className="text-xs text-muted-foreground">of {pins.length} total</p>
      </div>

      {/* Map container */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        style={{ height: "100%", width: "100%", background: "hsl(var(--background))" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {filteredPins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={createCustomIcon(pin.type, pin.riskLevel)}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium text-white",
                      pin.riskLevel === "critical" && "bg-destructive",
                      pin.riskLevel === "high" && "bg-warning",
                      pin.riskLevel === "medium" && "bg-info",
                      pin.riskLevel === "low" && "bg-success"
                    )}
                  >
                    {pin.riskLevel.toUpperCase()}
                  </span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {pin.type} Alert
                  </span>
                </div>
                <p className="font-semibold text-sm mb-1">{pin.location}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Lat: {pin.lat.toFixed(4)}, Lng: {pin.lng.toFixed(4)}
                </p>
                <Button size="sm" className="w-full text-xs h-7">
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapControls />
      </MapContainer>

      {/* Custom styles */}
      <style>{`
        .leaflet-container {
          background: hsl(var(--background)) !important;
          font-family: inherit;
        }
        
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px currentColor, 0 4px 12px rgba(0,0,0,0.4);
          }
          50% {
            box-shadow: 0 0 30px currentColor, 0 4px 12px rgba(0,0,0,0.4);
          }
        }
        
        .leaflet-popup-content-wrapper {
          background: hsl(var(--card)) !important;
          color: hsl(var(--card-foreground)) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        
        .leaflet-popup-tip {
          background: hsl(var(--card)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        
        .leaflet-popup-close-button {
          color: hsl(var(--muted-foreground)) !important;
        }
        
        .leaflet-popup-close-button:hover {
          color: hsl(var(--foreground)) !important;
        }
        
        .leaflet-control-attribution {
          background: hsl(var(--card) / 0.9) !important;
          color: hsl(var(--muted-foreground)) !important;
          font-size: 10px !important;
        }
        
        .leaflet-control-attribution a {
          color: hsl(var(--primary)) !important;
        }
      `}</style>
    </div>
  );
}
