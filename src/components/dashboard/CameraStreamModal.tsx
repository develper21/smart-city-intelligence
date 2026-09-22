import { useState, useEffect } from "react";
import { Camera } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Maximize2,
  Minimize2,
  Camera as CameraIcon,
  Volume2,
  VolumeX,
  Radio,
  Eye,
  Crosshair,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Signal,
  Cpu,
  Download,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CameraStreamModalProps {
  camera: Camera | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CameraStreamModal({
  camera,
  isOpen,
  onClose,
}: CameraStreamModalProps) {
  const [zoomLevel, setZoomLevel] = useState([1]);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isThermalMode, setIsThermalMode] = useState(false);
  const [showAiBoxes, setShowAiBoxes] = useState(true);
  const [ptzOffset, setPtzOffset] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString() + "." + String(now.getMilliseconds()).padStart(3, "0"));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  if (!camera) return null;

  const handlePan = (dx: number, dy: number) => {
    setPtzOffset((prev) => ({
      x: Math.max(-40, Math.min(40, prev.x + dx)),
      y: Math.max(-30, Math.min(30, prev.y + dy)),
    }));
    toast.info("PTZ Actuator Moved", { duration: 1000 });
  };

  const handleResetPTZ = () => {
    setPtzOffset({ x: 0, y: 0 });
    setZoomLevel([1]);
    toast.info("Camera PTZ Reset to Home Preset");
  };

  const handleCaptureSnapshot = () => {
    toast.success("Snapshot Saved to Evidence Vault", {
      description: `HD capture taken from ${camera.id} at ${currentTime}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border/60 flex flex-wrap items-center justify-between gap-3 bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <CameraIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg sm:text-xl font-bold">
                  {camera.name}
                </DialogTitle>
                <Badge
                  variant={camera.status === "online" ? "default" : "destructive"}
                  className="font-mono text-xs uppercase"
                >
                  {camera.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>{camera.location}</span> • <span>Zone: {camera.zone}</span> • <span className="font-mono">{camera.id}</span>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCaptureSnapshot}
              className="text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Capture Frame
            </Button>
            <Button
              size="sm"
              variant={isThermalMode ? "default" : "outline"}
              onClick={() => setIsThermalMode(!isThermalMode)}
              className="text-xs"
            >
              <Flame className="h-3.5 w-3.5 mr-1.5" />
              {isThermalMode ? "Thermal Mode (ON)" : "IR Thermal"}
            </Button>
          </div>
        </div>

        {/* Video Canvas Area */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-border/70 group shadow-inner">
            <div
              className={cn(
                "w-full h-full transition-transform duration-300",
                isThermalMode && "filter invert hue-rotate-180 contrast-150"
              )}
              style={{
                transform: `scale(${zoomLevel[0]}) translate(${ptzOffset.x}px, ${ptzOffset.y}px)`,
              }}
            >
              <img
                src={camera.thumbnail}
                alt={camera.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Scanlines & HUD grid */}
            <div className="absolute inset-0 scanlines opacity-25 pointer-events-none" />

            {/* Crosshair target overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
              <Crosshair className="h-16 w-16 text-primary stroke-[1]" />
            </div>

            {/* AI Bounding Boxes */}
            {showAiBoxes && (
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute border border-primary/80 bg-primary/10 rounded-sm"
                  style={{ top: "35%", left: "42%", width: "16%", height: "28%" }}
                >
                  <span className="absolute -top-5 left-0 text-[10px] font-mono px-1 py-0.2 bg-primary text-primary-foreground rounded">
                    PEDESTRIAN #104 [0.94]
                  </span>
                </div>
                <div
                  className="absolute border border-emerald-400/80 bg-emerald-400/10 rounded-sm"
                  style={{ top: "48%", left: "62%", width: "22%", height: "30%" }}
                >
                  <span className="absolute -top-5 left-0 text-[10px] font-mono px-1 py-0.2 bg-emerald-600 text-white rounded">
                    VEHICLE (SEDAN) [0.98]
                  </span>
                </div>
              </div>
            )}

            {/* Top HUD Telemetry */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="px-2.5 py-1 rounded bg-background/80 backdrop-blur-md border border-border/50 text-xs font-mono flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
                  <span className="font-bold text-destructive">REC</span>
                  <span className="text-muted-foreground">{currentTime}</span>
                </div>
                <div className="px-2 py-1 rounded bg-background/80 backdrop-blur-md border border-border/50 text-[11px] font-mono text-foreground hidden sm:block">
                  CAM-OPTICS: 4K UHD 60FPS
                </div>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-background/70 backdrop-blur-md hover:bg-background text-foreground"
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                >
                  {isAudioMuted ? (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-background/70 backdrop-blur-md hover:bg-background text-foreground"
                  onClick={() => setShowAiBoxes(!showAiBoxes)}
                  title="Toggle AI Overlays"
                >
                  <Cpu className={cn("h-4 w-4", showAiBoxes ? "text-primary" : "text-muted-foreground")} />
                </Button>
              </div>
            </div>

            {/* Bottom HUD bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded bg-background/80 backdrop-blur-md border border-border/50 text-[11px] font-mono text-muted-foreground flex items-center gap-3">
                <span>BITRATE: 4,820 kbps</span>
                <span>LATENCY: 16ms</span>
                <span>PTZ: [{ptzOffset.x}, {ptzOffset.y}, {zoomLevel[0]}x]</span>
              </div>
              <div className="px-2 py-1 rounded bg-background/80 backdrop-blur-md border border-border/50 text-[11px] font-mono text-emerald-400">
                AI NEURAL INFERENCE: ACTIVE
              </div>
            </div>
          </div>

          {/* Interactive PTZ & Optics Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* PTZ Direction Pad */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 flex flex-col items-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary" /> PTZ Controller
              </p>
              <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 mx-auto"
                  onClick={() => handlePan(0, -10)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 mx-auto"
                  onClick={() => handlePan(-10, 0)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 mx-auto"
                  onClick={handleResetPTZ}
                  title="Reset PTZ"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 mx-auto"
                  onClick={() => handlePan(10, 0)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 mx-auto"
                  onClick={() => handlePan(0, 10)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <div />
              </div>
            </div>

            {/* Optical Zoom & Diagnostics */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Optical Zoom ({zoomLevel[0]}x)
                  </span>
                  <span className="text-xs font-mono text-primary font-bold">
                    {zoomLevel[0] === 1 ? "Wide Angle" : `${zoomLevel[0]}x Telephoto`}
                  </span>
                </div>
                <Slider
                  value={zoomLevel}
                  min={1}
                  max={4}
                  step={0.25}
                  onValueChange={setZoomLevel}
                  className="my-3"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sensor Hardware</span>
                  <span className="font-mono">Sony STARVIS 2 CMOS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Field of View</span>
                  <span className="font-mono">112° Horizontal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Edge Storage</span>
                  <span className="font-mono text-emerald-400">512 GB (92% free)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Presets */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Camera Presets & Vector
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => {
                      setPtzOffset({ x: -20, y: -10 });
                      setZoomLevel([1.5]);
                      toast.info("Switched to Gate Entrance Preset");
                    }}
                  >
                    Preset 1: Gate A
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => {
                      setPtzOffset({ x: 20, y: 5 });
                      setZoomLevel([2]);
                      toast.info("Switched to Traffic Lane Preset");
                    }}
                  >
                    Preset 2: Traffic
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => {
                      setPtzOffset({ x: 0, y: -20 });
                      setZoomLevel([1]);
                      toast.info("Switched to Wide Skyway Preset");
                    }}
                  >
                    Preset 3: Wide Walk
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => {
                      setPtzOffset({ x: -10, y: 15 });
                      setZoomLevel([2.5]);
                      toast.info("Switched to Perimeter Preset");
                    }}
                  >
                    Preset 4: Perimeter
                  </Button>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-3 text-xs"
                onClick={handleCaptureSnapshot}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download High-Res Snapshot
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
