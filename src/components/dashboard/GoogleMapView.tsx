import React, { useCallback, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldAlert, Users, Car, Flame, Package, MapPin as MapPinIcon, Search, Filter, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GoogleMapViewProps {
  pins: MapPin[];
  className?: string;
}

const pinConfig = {
  intrusion: { icon: ShieldAlert, color: "#ef4444" },
  violence: { icon: AlertTriangle, color: "#ef4444" },
  crowd: { icon: Users, color: "#f59e0b" },
  traffic: { icon: Car, color: "#3b82f6" },
  fire: { icon: Flame, color: "#ef4444" },
  unattended: { icon: Package, color: "#f59e0b" },
};

const render = (status: Status, pins: MapPin[]) => {
  switch (status) {
    case Status.LOADING:
      return <div className="flex items-center justify-center h-full">Loading maps...</div>;
    case Status.FAILURE:
      return <div className="flex items-center justify-center h-full">Error loading maps</div>;
    case Status.SUCCESS:
      return <MapComponent pins={pins} />;
  }
};

interface MapComponentProps {
  pins: MapPin[];
}

const MapComponent: React.FC<MapComponentProps> = ({ pins }) => {
  const [map, setMap] = useState<any>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filters = ["all", "critical", "high", "medium", "low"];

  const filteredPins = pins.filter((pin) => 
    activeFilter === "all" ? true : pin.riskLevel === activeFilter
  );

  const onLoad = useCallback((mapInstance: any) => {
    setMap(mapInstance);
    
    // Set initial center (Delhi coordinates)
    mapInstance.setCenter({ lat: 28.6139, lng: 77.2090 });
    mapInstance.setZoom(12);

    // Add markers for each pin
    filteredPins.forEach((pin, index) => {
      const config = pinConfig[pin.type];
      
      // Create custom marker
      const marker = new (window as any).google.maps.Marker({
        position: { 
          lat: 28.6139 + (Math.random() - 0.5) * 0.1, // Random around Delhi
          lng: 77.2090 + (Math.random() - 0.5) * 0.1
        },
        map: mapInstance,
        title: `${pin.type} Alert - ${pin.location}`,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: config.color,
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedPin(pin);
      });
    });
  }, [filteredPins]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search location..."
            className="pl-10 bg-white/90 backdrop-blur-sm border-gray-300"
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
                "capitalize text-xs h-8 bg-white/90 backdrop-blur-sm border-gray-300",
                activeFilter === filter && "bg-blue-600 text-white"
              )}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <Button variant="outline" size="icon" className="h-10 w-10 bg-white/90 backdrop-blur-sm border-gray-300">
          <Layers className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-10 w-10 bg-white/90 backdrop-blur-sm border-gray-300">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected Pin Info */}
      {selectedPin && (
        <div className="absolute bottom-4 left-4 z-10 max-w-sm bg-white rounded-xl shadow-lg p-4 animate-slide-in-left">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-blue-600" />
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
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="capitalize">{selectedPin.type} Alert</span>
            <span>•</span>
            <span
              className={cn(
                "capitalize font-medium",
                selectedPin.riskLevel === "critical" && "text-red-600",
                selectedPin.riskLevel === "high" && "text-orange-600",
                selectedPin.riskLevel === "medium" && "text-blue-600",
                selectedPin.riskLevel === "low" && "text-green-600"
              )}
            >
              {selectedPin.riskLevel} risk
            </span>
          </div>
          <Button size="sm" className="mt-3 w-full text-xs bg-blue-600 hover:bg-blue-700">
            View Details
          </Button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-20 sm:top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <p className="text-xs font-medium mb-2">Incident Types</p>
        <div className="space-y-1.5">
          {Object.entries(pinConfig).map(([type, config]) => (
            <div key={type} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white" 
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function GoogleMapView({ pins, className }: GoogleMapViewProps) {
  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      <div className="h-[500px] md:h-[600px] w-full">
        <Wrapper
          apiKey="YOUR_GOOGLE_MAPS_API_KEY" // Replace with your API key
          render={(status) => render(status, pins)}
          libraries={['places']}
        />
      </div>
    </div>
  );
}
