import { MapPin } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldAlert, Users, Car, Flame, Package, MapPin as MapPinIcon, Search, Filter, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CityMapViewProps {
  pins: MapPin[];
  className?: string;
}

const pinConfig = {
  intrusion: { icon: ShieldAlert, color: "bg-destructive" },
  violence: { icon: AlertTriangle, color: "bg-destructive" },
  crowd: { icon: Users, color: "bg-warning" },
  traffic: { icon: Car, color: "bg-info" },
  fire: { icon: Flame, color: "bg-destructive" },
  unattended: { icon: Package, color: "bg-warning" },
};

export function CityMapView({ pins, className }: CityMapViewProps) {
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filters = ["all", "critical", "high", "medium", "low"];

  const filteredPins = pins.filter((pin) => 
    activeFilter === "all" ? true : pin.riskLevel === activeFilter
  );

  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      {/* Map Container with grid pattern */}
      <div className="relative h-[500px] md:h-[600px] bg-gradient-to-b from-card to-background grid-pattern">
        {/* Dark overlay for map feel */}
        <div className="absolute inset-0 bg-background/40" />
        
        {/* SVG Map Illustration */}
        <svg
          viewBox="0 0 800 600"
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.3 }}
        >
          {/* Main roads */}
          <path
            d="M0 300 L800 300 M400 0 L400 600"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="none"
          />
          {/* Secondary roads */}
          <path
            d="M100 0 L100 600 M200 0 L200 600 M300 0 L300 600 M500 0 L500 600 M600 0 L600 600 M700 0 L700 600"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0 100 L800 100 M0 200 L800 200 M0 400 L800 400 M0 500 L800 500"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            fill="none"
          />
          {/* Blocks */}
          <rect x="120" y="120" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="220" y="120" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="320" y="120" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="520" y="120" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="620" y="120" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="120" y="320" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="220" y="320" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="520" y="320" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="620" y="320" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="120" y="420" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="220" y="420" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="320" y="420" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="520" y="420" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="620" y="420" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
          <rect x="720" y="420" width="60" height="60" fill="hsl(var(--muted))" opacity="0.5" rx="4" />
        </svg>

        {/* Alert Pins */}
        {filteredPins.map((pin, index) => {
          const config = pinConfig[pin.type];
          const Icon = config.icon;
          // Distribute pins across the map
          const x = 10 + (index * 12) % 80;
          const y = 15 + ((index * 17) % 70);
          
          return (
            <button
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 z-10",
                selectedPin?.id === pin.id && "scale-125"
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative">
                {/* Pulse ring */}
                <span
                  className={cn(
                    "absolute inset-0 rounded-full animate-ping opacity-75",
                    pin.riskLevel === "critical" && "bg-destructive",
                    pin.riskLevel === "high" && "bg-warning",
                    pin.riskLevel === "medium" && "bg-info",
                    pin.riskLevel === "low" && "bg-success"
                  )}
                />
                {/* Pin */}
                <div
                  className={cn(
                    "relative p-2 rounded-full",
                    config.color,
                    pin.riskLevel === "critical" && "glow-destructive",
                    pin.riskLevel === "high" && "glow-warning"
                  )}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </button>
          );
        })}

        {/* Controls */}
        <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search location..."
              className="pl-10 bg-card/90 backdrop-blur-sm border-border/50"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "capitalize text-xs h-8 bg-card/90 backdrop-blur-sm",
                  activeFilter === filter && "glow-primary"
                )}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10 bg-card/90 backdrop-blur-sm">
            <Layers className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10 bg-card/90 backdrop-blur-sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Pin Info */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 max-w-sm glass-card p-4 rounded-xl animate-slide-in-left">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{selectedPin.location}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setSelectedPin(null)}
              >
                ×
              </Button>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="capitalize">{selectedPin.type} Alert</span>
              <span>•</span>
              <span
                className={cn(
                  "capitalize font-medium",
                  selectedPin.riskLevel === "critical" && "text-destructive",
                  selectedPin.riskLevel === "high" && "text-warning",
                  selectedPin.riskLevel === "medium" && "text-info",
                  selectedPin.riskLevel === "low" && "text-success"
                )}
              >
                {selectedPin.riskLevel} risk
              </span>
            </div>
            <Button size="sm" className="mt-3 w-full text-xs">
              View Details
            </Button>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-20 sm:top-4 right-4 glass-card p-3 rounded-lg">
          <p className="text-xs font-medium mb-2">Incident Types</p>
          <div className="space-y-1.5">
            {Object.entries(pinConfig).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", config.color)} />
                <span className="text-xs text-muted-foreground capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
