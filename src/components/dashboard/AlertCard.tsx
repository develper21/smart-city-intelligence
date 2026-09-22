import { useState } from "react";
import { Alert } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { RiskBadge } from "./RiskIndicator";
import {
  AlertTriangle,
  ShieldAlert,
  Users,
  Car,
  Flame,
  Package,
  MapPin,
  Clock,
  Camera,
  MoreVertical,
  ChevronRight,
  Send,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface AlertCardProps {
  alert: Alert;
  className?: string;
  compact?: boolean;
  onInspect?: (alert: Alert) => void;
  onResolve?: (alertId: string) => void;
}

const alertTypeConfig = {
  intrusion: { icon: ShieldAlert, label: "Intrusion Detected" },
  violence: { icon: AlertTriangle, label: "Violence Detected" },
  crowd: { icon: Users, label: "Crowd Gathering" },
  traffic: { icon: Car, label: "Traffic Incident" },
  fire: { icon: Flame, label: "Fire/Smoke Detected" },
  unattended: { icon: Package, label: "Unattended Object" },
};

export function AlertCard({
  alert,
  className,
  compact = false,
  onInspect,
  onResolve,
}: AlertCardProps) {
  const { setSelectedAlert } = useNotifications();
  const config = alertTypeConfig[alert.type] || { icon: AlertTriangle, label: "Security Alert" };
  const Icon = config.icon;

  const cardVariant = {
    low: "alert-low",
    medium: "alert-medium",
    high: "alert-high",
    critical: "alert-critical",
  };

  const handleInspect = () => {
    if (onInspect) onInspect(alert);
    else setSelectedAlert(alert);
  };

  const handleResolveAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onResolve) onResolve(alert.id);
    toast.success(`Alert #${alert.id} Marked Resolved`);
  };

  const handleEscalateAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.error(`Alert #${alert.id} Escalated to Metropolitan Command`);
  };

  const handleAssignOperator = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`Patrol Unit Dispatched to ${alert.location}`);
  };

  if (compact) {
    return (
      <div
        onClick={handleInspect}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl glass-card transition-all hover:scale-[1.01] cursor-pointer hover:border-primary/50",
          cardVariant[alert.riskLevel],
          className
        )}
      >
        <div
          className={cn(
            "p-2 rounded-lg",
            alert.riskLevel === "critical" && "bg-destructive/20 text-destructive",
            alert.riskLevel === "high" && "bg-warning/20 text-warning",
            alert.riskLevel === "medium" && "bg-info/20 text-info",
            alert.riskLevel === "low" && "bg-success/20 text-success"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate text-foreground">{config.label}</p>
          <p className="text-[11px] text-muted-foreground truncate">{alert.location}</p>
        </div>
        <RiskBadge level={alert.riskLevel} />
      </div>
    );
  }

  return (
    <div
      onClick={handleInspect}
      className={cn(
        "glass-card rounded-xl overflow-hidden transition-all hover:scale-[1.01] cursor-pointer hover:border-primary/40 group",
        cardVariant[alert.riskLevel],
        className
      )}
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-xl transition-transform group-hover:scale-110",
                alert.riskLevel === "critical" && "bg-destructive/20 text-destructive glow-destructive",
                alert.riskLevel === "high" && "bg-warning/20 text-warning glow-warning",
                alert.riskLevel === "medium" && "bg-info/20 text-info",
                alert.riskLevel === "low" && "bg-success/20 text-success glow-success"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                {config.label}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">{alert.id}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card text-xs">
              <DropdownMenuItem onClick={handleInspect} className="cursor-pointer">
                View Investigation File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAssignOperator} className="cursor-pointer">
                Assign Responder Unit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleResolveAlert} className="cursor-pointer">
                Mark as Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEscalateAlert} className="text-destructive cursor-pointer">
                Escalate Incident
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2">
          {alert.description}
        </p>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{alert.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Camera className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono">{alert.cameraId}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-mono">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              {alert.timestamp.includes("T")
                ? format(new Date(alert.timestamp), "HH:mm:ss")
                : alert.timestamp}
            </span>
          </div>
          <div>
            <RiskBadge level={alert.riskLevel} />
          </div>
        </div>

        {/* Status footer bar */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
          <span
            className={cn(
              "text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase",
              alert.status === "active" && "bg-destructive/15 text-destructive border border-destructive/25",
              alert.status === "investigating" && "bg-warning/15 text-warning border border-warning/25",
              alert.status === "resolved" && "bg-success/15 text-success border border-success/25"
            )}
          >
            {alert.status}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 gap-1 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
            onClick={(e) => {
              e.stopPropagation();
              handleInspect();
            }}
          >
            <span>Triage Dossier</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
