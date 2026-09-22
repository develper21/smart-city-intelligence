import { useState } from "react";
import { Alert } from "@/data/mockData";
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
import { Textarea } from "@/components/ui/textarea";
import { RiskBadge } from "./RiskIndicator";
import {
  FileText,
  MapPin,
  Clock,
  User,
  Shield,
  CheckCircle2,
  Printer,
  Download,
  Paperclip,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

interface IncidentDetailsModalProps {
  incident: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IncidentDetailsModal({
  incident,
  isOpen,
  onClose,
}: IncidentDetailsModalProps) {
  const [notes, setNotes] = useState(
    "Primary officer dispatched at 10:47. Field reconnaissance confirmed incident resolved without civil distress. CCTV recording preserved for evidence index."
  );

  if (!incident) return null;

  const handleExportPDF = () => {
    toast.success("Incident Report Dossier Generated", {
      description: `Case dossier #${incident.id || "INC-2026-99"}.pdf ready for regulatory submission.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <div className="p-6 border-b border-border/60 bg-gradient-to-r from-card to-secondary/30">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-info/10 text-info border border-info/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  CASE DOSSIER #{incident.id || "INC-8812"}
                </span>
                <DialogTitle className="text-xl font-bold">
                  {incident.description || incident.type || "Urban Incident Summary"}
                </DialogTitle>
              </div>
            </div>
            <RiskBadge level={incident.riskLevel || "medium"} />
          </div>

          <DialogDescription className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" /> {incident.location || "Central Sector"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {incident.timestamp || "2026-09-21 08:15"}
            </span>
            <span>•</span>
            <Badge variant="outline" className="text-[10px] uppercase">
              STATUS: {incident.status || "INVESTIGATING"}
            </Badge>
          </DialogDescription>
        </div>

        <div className="p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground">Lead Investigating Unit</span>
              <p className="font-semibold text-foreground mt-0.5">Patrol Division #04</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground">Camera Sensor Tag</span>
              <p className="font-mono font-semibold text-foreground mt-0.5">
                {incident.cameraId || "CAM-002"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 col-span-2 sm:col-span-1">
              <span className="text-muted-foreground">Disposition</span>
              <p className="font-semibold text-emerald-400 mt-0.5">Lawful Clearance</p>
            </div>
          </div>

          {/* Evidence Archive */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-primary" /> Attached Evidence Vault
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-secondary/40 border border-border/60 flex items-center gap-2 hover:border-primary/40 transition-colors cursor-pointer">
                <span className="text-lg">📹</span>
                <div className="truncate">
                  <p className="text-xs font-medium truncate">CCTV_Rec_0815.mp4</p>
                  <p className="text-[10px] text-muted-foreground">18.4 MB • 4K 60fps</p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-secondary/40 border border-border/60 flex items-center gap-2 hover:border-primary/40 transition-colors cursor-pointer">
                <span className="text-lg">🖼️</span>
                <div className="truncate">
                  <p className="text-xs font-medium truncate">ANPR_License_Plate.jpg</p>
                  <p className="text-[10px] text-muted-foreground">2.1 MB • Snapshot</p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-secondary/40 border border-border/60 flex items-center gap-2 hover:border-primary/40 transition-colors cursor-pointer">
                <span className="text-lg">📊</span>
                <div className="truncate">
                  <p className="text-xs font-medium truncate">Telemetry_Log.json</p>
                  <p className="text-[10px] text-muted-foreground">140 KB • Sensor Data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Officer Narrative / Notes */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Official Officer Narrative & Findings
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs h-24 bg-secondary/30 border-border/60"
            />
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-6 border-t border-border/60 bg-secondary/20 flex-row justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close Case View
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download Dossier (.PDF)
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success("Case notes updated successfully");
                onClose();
              }}
              className="text-xs bg-primary text-primary-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Save Updates
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
