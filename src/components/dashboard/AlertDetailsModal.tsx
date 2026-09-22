import { useState } from "react";
import { Alert } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "./RiskIndicator";
import {
  ShieldAlert,
  MapPin,
  Clock,
  Camera,
  Radio,
  CheckCircle,
  AlertTriangle,
  Send,
  Download,
  Share2,
  XCircle,
  Cpu,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface AlertDetailsModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve?: (alertId: string) => void;
}

export function AlertDetailsModal({
  alert,
  isOpen,
  onClose,
  onResolve,
}: AlertDetailsModalProps) {
  const [isDispatched, setIsDispatched] = useState(false);
  const [resolvedState, setResolvedState] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  if (!alert) return null;

  const handleDispatch = () => {
    setIsDispatched(true);
    toast.success("Emergency Response Unit Dispatched", {
      description: `Patrol Unit #12 & Drone Unit #4 deployed to ${alert.location}. Estimated ETA: 3.5 mins.`,
    });
  };

  const handleResolve = () => {
    setResolvedState(true);
    if (onResolve) onResolve(alert.id);
    toast.success("Incident Marked as Resolved", {
      description: `Alert #${alert.id} has been logged in the historical incident registry.`,
    });
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleEscalate = () => {
    toast.error("Alert Escalated to Metropolitan Command", {
      description: `Priority-1 notification sent to City Police HQ and Fire Control.`,
    });
  };

  // Mock camera frame background based on alert type
  const snapshotImage =
    alert.type === "intrusion"
      ? "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&h=450&fit=crop"
      : alert.type === "fire"
      ? "https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&h=450&fit=crop"
      : alert.type === "traffic"
      ? "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=450&fit=crop"
      : alert.type === "crowd"
      ? "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=800&h=450&fit=crop"
      : "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=450&fit=crop";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        {/* Header with Risk Banner */}
        <div className="p-6 border-b border-border/60 bg-gradient-to-r from-card to-secondary/30">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary glow-primary">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
                  INCIDENT INVESTIGATION FILE
                </span>
                <DialogTitle className="text-xl md:text-2xl font-bold flex items-center gap-3">
                  {alert.description}
                </DialogTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge level={alert.riskLevel} />
              <Badge variant="outline" className="font-mono text-xs">
                {alert.id}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-muted-foreground text-sm flex items-center gap-4 flex-wrap mt-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {alert.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-muted-foreground" /> {alert.cameraId}
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {alert.timestamp}
            </span>
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Detection Visualizer */}
          <div className="relative rounded-xl overflow-hidden border border-border/70 aspect-video bg-black group">
            <img
              src={snapshotImage}
              alt="CCTV Capture"
              className="w-full h-full object-cover"
            />
            {/* HUD scanlines */}
            <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

            {/* AI Bounding Box Simulation */}
            {showBoundingBoxes && (
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute border-2 border-destructive bg-destructive/10 rounded-sm"
                  style={{ top: "28%", left: "35%", width: "24%", height: "42%" }}
                >
                  <div className="absolute -top-6 left-0 bg-destructive text-destructive-foreground text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    TARGET IDENTIFIED (CONF: 97.4%)
                  </div>
                  <div className="absolute -bottom-5 right-0 bg-background/80 backdrop-blur-sm text-[10px] font-mono px-1 rounded text-foreground border border-border/60">
                    CLASS: {alert.type.toUpperCase()}
                  </div>
                </div>
              </div>
            )}

            {/* Live Camera Overlays */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="px-2 py-1 rounded bg-background/70 backdrop-blur-md border border-border/50 text-[11px] font-mono text-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
                LIVE REC
              </div>
              <div className="px-2 py-1 rounded bg-background/70 backdrop-blur-md border border-border/50 text-[11px] font-mono text-muted-foreground">
                FEED: {alert.cameraId} // 4K UHD
              </div>
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs bg-background/80 backdrop-blur-md hover:bg-background"
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              >
                <Cpu className="h-3 w-3 mr-1.5 text-primary" />
                {showBoundingBoxes ? "Hide AI Overlays" : "Show AI Overlays"}
              </Button>
            </div>
          </div>

          {/* Telemetry & Analysis Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <p className="text-xs text-muted-foreground">AI Model</p>
              <p className="text-sm font-semibold mt-0.5">YOLOv8-UrbanNet</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <p className="text-xs text-muted-foreground">Confidence Score</p>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">97.8%</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <p className="text-xs text-muted-foreground">Coordinates</p>
              <p className="text-sm font-mono mt-0.5">28.6139°N, 77.2090°E</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <p className="text-xs text-muted-foreground">Assigned Unit</p>
              <p className="text-sm font-semibold text-primary mt-0.5">
                {isDispatched ? "Patrol #12 (En Route)" : "Pending Dispatch"}
              </p>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Event Chronology & Audit Log
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border/50">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Object Recognition Alert Triggered</p>
                  <p className="text-muted-foreground">Neural inference engine flagged anomalous pattern at {alert.location}.</p>
                </div>
                <span className="text-muted-foreground font-mono">T+0.0s</span>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border/50">
                <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Operator Automated Queue Notification</p>
                  <p className="text-muted-foreground">Dispatched alert to Central Console Operator Station 4.</p>
                </div>
                <span className="text-muted-foreground font-mono">T+1.2s</span>
              </div>
              {isDispatched && (
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-primary/10 border border-primary/30">
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5 animate-ping" />
                  <div className="flex-1">
                    <p className="font-medium text-primary">Rapid Response Vector Authorized</p>
                    <p className="text-muted-foreground">Officer assigned: Unit #12. Bodycam sync initiated.</p>
                  </div>
                  <span className="text-primary font-mono font-medium">DISPATCHED</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <DialogFooter className="p-4 sm:p-6 border-t border-border/60 bg-secondary/20 flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEscalate}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Escalate to HQ
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toast.info("Alert flagged as False Positive", {
                  description: "Model retraining feedback queued.",
                });
                onClose();
              }}
              className="text-xs text-muted-foreground"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              False Alarm
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {!isDispatched ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleDispatch}
                className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Dispatch Response Unit
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="bg-primary/20 text-primary border border-primary/40"
              >
                <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                Unit En Route
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleResolve}
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Mark Resolved
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
