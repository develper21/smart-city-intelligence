import { InteractiveMap } from "@/components/dashboard/InteractiveMap";
import { mockMapPins, mockAlerts } from "@/data/mockData";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Button } from "@/components/ui/button";
import { Map, List, Maximize2, X } from "lucide-react";
import { useState } from "react";

const MapPage = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const activeAlerts = mockAlerts.filter((a) => a.status !== "resolved").slice(0, 5);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-[1001] bg-card/95 shadow-lg"
          onClick={() => setIsFullscreen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <InteractiveMap pins={mockMapPins} className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">City Map</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Geographic view of all incidents and cameras across the city
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showSidebar ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <List className="h-4 w-4 mr-2" />
            {showSidebar ? "Hide" : "Show"} Alerts
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Map with sidebar */}
      <div className="flex gap-6">
        {/* Map */}
        <div className="flex-1">
          <InteractiveMap pins={mockMapPins} className="h-[calc(100vh-220px)] min-h-[500px]" />
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="hidden lg:block w-80 space-y-4">
            <div className="glass-card p-4 rounded-xl">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Map className="h-4 w-4 text-primary" />
                Active Incidents
              </h3>
              <div className="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto custom-scrollbar pr-2">
                {activeAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} compact />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="glass-card p-4 rounded-xl space-y-3">
              <h3 className="font-semibold text-sm">Map Statistics</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{mockMapPins.length}</p>
                  <p className="text-xs text-muted-foreground">Total Pins</p>
                </div>
                <div className="text-center p-3 bg-destructive/10 rounded-lg">
                  <p className="text-2xl font-bold text-destructive">
                    {mockMapPins.filter((p) => p.riskLevel === "critical").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
                <div className="text-center p-3 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">
                    {mockMapPins.filter((p) => p.riskLevel === "high").length}
                  </p>
                  <p className="text-xs text-muted-foreground">High Risk</p>
                </div>
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">
                    {mockMapPins.filter((p) => p.riskLevel === "low").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Low Risk</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
