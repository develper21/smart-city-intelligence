import { useState, useEffect } from "react";
import { InteractiveMap } from "@/components/dashboard/InteractiveMap";
import { surveillanceAPI, Alert, MapPin } from "@/services/api";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { AlertDetailsModal } from "@/components/dashboard/AlertDetailsModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Map as MapIcon,
  List,
  Maximize2,
  Minimize2,
  X,
  Satellite,
  Radio,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MapPage() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<Alert | null>(null);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    surveillanceAPI
      .getMapPins()
      .then(setPins)
      .catch(() => toast.error("Backend se map pins fetch nahi hue"));
    surveillanceAPI
      .getAlerts({ limit: 100 })
      .then(({ alerts }) => setAlerts(alerts.filter((a) => a.status !== "resolved")))
      .catch(() => undefined);
  }, []);

  const activeAlerts = alerts;

  const handlePinInspect = (pin: MapPin) => {
    // Matching alert dhundo ya pin data se synthetic alert banao
    const matched = alerts.find((a) => a.location === pin.location) || {
      id: `MAP-ALT-${pin.id}`,
      type: pin.type,
      location: pin.location,
      cameraId: `CAM-00${pin.id}`,
      riskLevel: pin.riskLevel,
      timestamp: new Date().toISOString(),
      description: `Active anomaly vector flagged on satellite GIS grid at ${pin.location}.`,
      status: "active" as const,
    };
    setSelectedAlertForModal(matched);
  };

  // Listen to Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Fullscreen Mode with high-z-index and floating HUD controls
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex flex-col w-screen h-screen overflow-hidden">
        {/* Fullscreen Floating Header Bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 p-2 px-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl pointer-events-auto">
            <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
              <Satellite className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Satellite GIS Tactical Command
              </h2>
              <p className="text-[10px] text-muted-foreground font-mono">
                METROPOLITAN DIGITAL TWIN (FULLSCREEN)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs bg-card/95 backdrop-blur-xl border-border/80 shadow-xl gap-1.5 text-foreground hover:bg-card"
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Exit Fullscreen (Esc)</span>
            </Button>
          </div>
        </div>

        {/* Map taking 100% of viewport */}
        <div className="flex-1 w-full h-full">
          <InteractiveMap
            pins={pins}
            onInspectAlert={handlePinInspect}
            className="h-full w-full rounded-none border-none"
          />
        </div>

        {/* Alert Details Modal inside Fullscreen */}
        <AlertDetailsModal
          alert={selectedAlertForModal}
          isOpen={!!selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Metropolitan Satellite GIS Map
            </h1>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
              HIGH-RES SATELLITE
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Real-time geospatial visualization of anomalies, CCTV sensor coverage, and field response vectors.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Button
            variant={showSidebar ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-xs h-9"
          >
            <List className="h-3.5 w-3.5 mr-1.5" />
            {showSidebar ? "Hide Incidents Panel" : "Show Incidents Panel"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsFullscreen(true);
              toast.info("Entered Fullscreen Tactical GIS Map mode (Press Esc to exit)");
            }}
            className="text-xs h-9"
          >
            <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
            Fullscreen Map
          </Button>
        </div>
      </div>

      {/* Map with Interactive Sidebar */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main Map Canvas */}
        <div className="flex-1 min-w-0">
          <InteractiveMap
            pins={pins}
            onInspectAlert={handlePinInspect}
            className="h-[calc(100vh-210px)] min-h-[560px]"
          />
        </div>

        {/* Tactical Incidents & Map Stats Sidebar */}
        {showSidebar && (
          <div className="w-full lg:w-84 xl:w-96 space-y-4 shrink-0">
            {/* Active Incidents Feed */}
            <div className="glass-card p-4 rounded-2xl border border-border/70 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary animate-pulse" />
                  <h3 className="font-bold text-sm text-foreground">Sector Incidents</h3>
                </div>
                <Badge variant="destructive" className="font-mono text-[10px]">
                  {activeAlerts.length} Active
                </Badge>
              </div>

              <div className="space-y-2.5 max-h-[calc(100vh-420px)] min-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {activeAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    compact
                    onInspect={(a) => setSelectedAlertForModal(a)}
                  />
                ))}
              </div>
            </div>

            {/* Map Telemetry Stats Card */}
            <div className="glass-card p-4 rounded-2xl border border-border/70 shadow-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground font-mono">
                Geospatial Threat Matrix
              </h3>
              <div className="grid grid-cols-2 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                  <p className="text-xl font-extrabold text-primary font-mono">{pins.length}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Mapped Beacons</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25">
                  <p className="text-xl font-extrabold text-destructive font-mono">
                    {pins.filter((p) => p.riskLevel === "critical").length}
                  </p>
                  <p className="text-[11px] text-destructive font-medium">Critical</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10 border border-warning/25">
                  <p className="text-xl font-extrabold text-warning font-mono">
                    {pins.filter((p) => p.riskLevel === "high").length}
                  </p>
                  <p className="text-[11px] text-warning font-medium">High Risk</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                  <p className="text-xl font-extrabold text-emerald-400 font-mono">
                    {pins.filter((p) => p.riskLevel === "low").length}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-medium">Normal / Low</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Alert Details Modal */}
      <AlertDetailsModal
        alert={selectedAlertForModal}
        isOpen={!!selectedAlertForModal}
        onClose={() => setSelectedAlertForModal(null)}
      />
    </div>
  );
}
