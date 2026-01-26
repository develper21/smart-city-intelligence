import { cn } from "@/lib/utils";

interface RiskIndicatorProps {
  level: "low" | "medium" | "high" | "critical";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const riskConfig = {
  low: {
    label: "Low Risk",
    color: "bg-risk-low",
    textColor: "text-risk-low",
    glow: "glow-success",
  },
  medium: {
    label: "Medium Risk",
    color: "bg-risk-medium",
    textColor: "text-risk-medium",
    glow: "glow-warning",
  },
  high: {
    label: "High Risk",
    color: "bg-risk-high",
    textColor: "text-risk-high",
    glow: "glow-destructive",
  },
  critical: {
    label: "Critical",
    color: "bg-risk-critical",
    textColor: "text-risk-critical",
    glow: "glow-destructive",
  },
};

const sizeConfig = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function RiskIndicator({
  level,
  showLabel = true,
  size = "md",
  className,
}: RiskIndicatorProps) {
  const config = riskConfig[level];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "rounded-full animate-pulse",
          sizeConfig[size],
          config.color
        )}
      />
      {showLabel && (
        <span className={cn("text-xs font-medium uppercase tracking-wider", config.textColor)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export function RiskBadge({
  level,
  className,
}: {
  level: RiskIndicatorProps["level"];
  className?: string;
}) {
  const config = riskConfig[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        level === "low" && "bg-success/20 text-success",
        level === "medium" && "bg-warning/20 text-warning",
        level === "high" && "bg-destructive/20 text-destructive",
        level === "critical" && "bg-destructive/30 text-destructive animate-pulse",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.color)} />
      {config.label}
    </span>
  );
}
