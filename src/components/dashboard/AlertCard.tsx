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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface AlertCardProps {
  alert: Alert;
  className?: string;
  compact?: boolean;
}

const alertTypeConfig = {
  intrusion: { icon: ShieldAlert, label: "Intrusion Detected" },
  violence: { icon: AlertTriangle, label: "Violence Detected" },
  crowd: { icon: Users, label: "Crowd Gathering" },
  traffic: { icon: Car, label: "Traffic Incident" },
  fire: { icon: Flame, label: "Fire/Smoke Detected" },
  unattended: { icon: Package, label: "Unattended Object" },
};

export function AlertCard({ alert, className, compact = false }: AlertCardProps) {
  const config = alertTypeConfig[alert.type];
  const Icon = config.icon;

  const cardVariant = {
    low: "alert-low",
    medium: "alert-medium",
    high: "alert-high",
    critical: "alert-critical",
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg glass-card animate-fade-in",
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
          <p className="text-sm font-medium truncate">{config.label}</p>
          <p className="text-xs text-muted-foreground truncate">{alert.location}</p>
        </div>
        <RiskBadge level={alert.riskLevel} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "glass-card rounded-xl overflow-hidden transition-all hover:scale-[1.01] animate-fade-in",
        cardVariant[alert.riskLevel],
        className
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-lg",
                alert.riskLevel === "critical" && "bg-destructive/20 text-destructive glow-destructive",
                alert.riskLevel === "high" && "bg-warning/20 text-warning glow-warning",
                alert.riskLevel === "medium" && "bg-info/20 text-info",
                alert.riskLevel === "low" && "bg-success/20 text-success glow-success"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{config.label}</h3>
              <p className="text-xs text-muted-foreground font-mono">{alert.id}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Assign Operator</DropdownMenuItem>
              <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Escalate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">{alert.description}</p>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{alert.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Camera className="h-3.5 w-3.5" />
            <span>{alert.cameraId}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{format(new Date(alert.timestamp), "HH:mm:ss")}</span>
          </div>
          <RiskBadge level={alert.riskLevel} />
        </div>

        {/* Status */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full capitalize",
              alert.status === "active" && "bg-destructive/20 text-destructive",
              alert.status === "investigating" && "bg-warning/20 text-warning",
              alert.status === "resolved" && "bg-success/20 text-success"
            )}
          >
            {alert.status}
          </span>
          <Button size="sm" variant="outline" className="text-xs h-7">
            Take Action
          </Button>
        </div>
      </div>
    </div>
  );
}
