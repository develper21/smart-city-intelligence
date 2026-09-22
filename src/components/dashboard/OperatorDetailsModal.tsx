import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Shield,
  Radio,
  Clock,
  MapPin,
  CheckCircle,
  PhoneCall,
  Mail,
  Award,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface OperatorDetailsModalProps {
  operator: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OperatorDetailsModal({
  operator,
  isOpen,
  onClose,
}: OperatorDetailsModalProps) {
  if (!operator) return null;

  const handleCommsCall = () => {
    toast.success("Tactical Radio Channel Opened", {
      description: `Connecting secure VoIP encrypted channel with ${operator.name} (${operator.id})...`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <div className="p-6 border-b border-border/60 bg-gradient-to-r from-card to-secondary/40">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/40 shadow-lg">
              <AvatarImage src={`https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop`} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                {operator.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold">{operator.name}</DialogTitle>
                <Badge
                  variant={operator.status === "online" ? "default" : "secondary"}
                  className="text-[10px] uppercase font-mono"
                >
                  {operator.status}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {operator.role} • <span className="font-mono">{operator.id}</span>
              </DialogDescription>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
                <Shield className="h-3.5 w-3.5" />
                <span>Sector Clear: {operator.zone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
              <span className="text-muted-foreground">Active Incidents Handled</span>
              <p className="text-base font-bold text-foreground mt-0.5">
                {operator.alerts || 4} Today
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
              <span className="text-muted-foreground">Avg. Triage Response</span>
              <p className="text-base font-bold text-emerald-400 mt-0.5">1.4 min</p>
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-secondary/20 border border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Security Clearance</span>
              <span className="font-semibold text-primary">Level 2 (Tactical Operations)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Duty Shift</span>
              <span>08:00 - 16:00 (Alpha Shift)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last Activity Pulse</span>
              <span className="font-mono text-muted-foreground">{operator.lastActive || "Active now"}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border/60 bg-secondary/20 flex-row justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Dismiss
          </Button>
          <Button
            size="sm"
            onClick={handleCommsCall}
            className="text-xs bg-primary text-primary-foreground glow-primary"
          >
            <Radio className="h-3.5 w-3.5 mr-1.5" />
            Open Tactical Radio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
