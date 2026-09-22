import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  Shield,
  Zap,
  Bell,
  Cctv,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CameraFeedCard } from "@/components/dashboard/CameraFeedCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RiskIndicator } from "@/components/dashboard/RiskIndicator";
import {
  ChartCard,
  IncidentsLineChart,
  HourlyActivityChart,
} from "@/components/dashboard/AnalyticsCharts";
import { CameraStreamModal } from "@/components/dashboard/CameraStreamModal";
import { surveillanceAPI, Camera, Alert, wsManager } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Dashboard() {
  const { triggerSimulatedAlert, setSelectedAlert, wsConnected } = useNotifications();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [kpis, setKpis] = useState({
    total_cameras: 0,
    active_cameras: 0,
    total_alerts: 0,
    critical_alerts: 0,
    resolved_today: 0,
    fps: 0,
  });
  const [selectedCameraForStream, setSelectedCameraForStream] = useState<Camera | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cams, alertsRes, summary, hourly, overTime] = await Promise.all([
        surveillanceAPI.getCameras(),
        surveillanceAPI.getAlerts({ limit: 12 }),
        surveillanceAPI.getSummary(),
        surveillanceAPI.getHourlyActivity().catch(() => []),
        surveillanceAPI.getIncidentsOverTime(7).catch(() => []),
      ]);

      setCameras(cams);
      setAlerts(alertsRes.alerts);
      const perf = await surveillanceAPI.getPerformance().catch(() => null);
      setKpis({
        total_cameras: summary.total_cameras ?? cams.length,
        active_cameras: summary.active_cameras ?? cams.filter((c) => c.status !== "offline").length,
        total_alerts: summary.total_alerts ?? alertsRes.total,
        critical_alerts: summary.critical_alerts ?? 0,
        resolved_today: summary.resolved_today ?? 0,
        fps: perf?.fps ?? 0,
      });
      setHourlyData(hourly);
      setOverTimeData(overTime);
    } catch {
      toast.error("Backend se data fetch nahi ho paya", {
        description: "Server port 8000 par chal raha hai? `npm run server:dev` try karein.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const [hourlyData, setHourlyData] = useState<{ hour: string; incidents: number }[]>([]);
  const [overTimeData, setOverTimeData] = useState<{ date: string; incidents: number; resolved: number }[]>([]);

  /* WebSocket se naye alerts live inject karo */
  useEffect(() => {
    const off: () => void = wsManager.on((msg) => {
      if (msg.type === "new_alert" && msg.payload?.alert) {
        const a = msg.payload.alert;
        setAlerts((prev) => {
          if (prev.some((p) => p.numericId === a.id)) return prev;
          return [
            {
              id: a.event_ref || `ALT-${a.id}`,
              numericId: a.id,
              type: a.event_type,
              location: a.location,
              cameraId: a.camera_id,
              riskLevel: a.risk_level,
              timestamp: a.alert_time,
              description: a.message,
              status: "active",
            },
            ...prev,
          ];
        });
      }
    });
    return () => {
      off();
    };
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleResolve = async (alertId: string) => {
    const target = alerts.find((a) => a.id === alertId);
    if (!target?.numericId) return;
    try {
      await surveillanceAPI.resolveAlert(target.numericId, user?.badgeId || "operator");
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: "resolved" } : a)));
      toast.success(`Alert ${alertId} resolved via backend`);
    } catch {
      toast.error("Resolve failed", { description: "Supervisor/Admin clearance required." });
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const criticalCount = activeAlerts.filter((a) => a.riskLevel === "critical").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Command Status */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/30 rounded-xl glow-primary">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Metropolitan Command & Control
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Autonomous AI surveillance, automated incident dispatch, and urban safety telemetry.
            </p>
          </div>
        </div>

        {/* Action Controls & Telemetry Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerSimulatedAlert}
            className="text-xs h-9 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Simulate Alert
          </Button>

          <div className="glass-card px-3 py-1.5 rounded-xl flex items-center gap-2 border border-border/70">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
            <span className="text-xs font-mono font-medium">
              {wsConnected ? "AI Engine Connected" : "AI Engine Offline"}
            </span>
          </div>

          <div className="glass-card px-3 py-1.5 rounded-xl flex items-center gap-2 border border-border/70">
            <RiskIndicator level={criticalCount > 0 ? "critical" : "medium"} size="sm" />
            <span className="text-xs font-semibold text-muted-foreground">Grid Threat Level</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid — live backend summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Cameras"
          value={`${kpis.active_cameras}/${kpis.total_cameras}`}
          subtitle="City Coverage"
          icon={Cctv}
        />
        <StatsCard
          title="Active Alerts"
          value={activeAlerts.length}
          subtitle={`${criticalCount} Critical Flagged`}
          icon={Bell}
          variant={criticalCount > 0 ? "destructive" : "default"}
        />
        <StatsCard
          title="Resolved Today"
          value={kpis.resolved_today}
          subtitle="Mean Triage < 2.3 min"
          icon={ShieldCheck}
          variant="success"
        />
        <StatsCard
          title="AI Pipeline Speed"
          value={`${kpis.fps.toFixed(1)} FPS`}
          subtitle="Real-time GPU Inference"
          icon={Zap}
          variant="info"
        />
      </div>

      {/* Main Command Center Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Video Matrix */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cctv className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-base sm:text-lg">Live Optical Surveillance Matrix</h2>
              <span className="text-xs font-mono text-muted-foreground">({cameras.length} Feeds)</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  loadAll();
                  toast.info("Refreshed from backend");
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Link to="/live-feeds">
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  View Full Wall <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Camera Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl aspect-video animate-pulse bg-muted/50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cameras.slice(0, 6).map((cam) => (
                <CameraFeedCard
                  key={cam.id}
                  camera={cam}
                  onExpand={(c) => setSelectedCameraForStream(c)}
                />
              ))}
            </div>
          )}

          {/* Incident Telemetry Trend Charts */}
          <div className="pt-2">
            <ChartCard
              title="24-Hour Municipal Incident & Triage Volume"
              subtitle="Live backend analytics — detections vs resolution rates."
            >
              <HourlyActivityChart data={hourlyData} />
            </ChartCard>
          </div>
        </div>

        {/* Right Column: Active Alerts Triage & Incident Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="font-bold text-base sm:text-lg">Live Alerts Queue</h2>
            </div>
            <Link to="/alerts">
              <Button variant="ghost" size="sm" className="text-xs h-8">
                Triage All ({activeAlerts.length})
              </Button>
            </Link>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {alerts.slice(0, 5).map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onInspect={(a) => setSelectedAlert(a)}
                onResolve={handleResolve}
              />
            ))}
            {alerts.length === 0 && !loading && (
              <div className="p-8 text-center glass-card rounded-xl">
                <ShieldCheck className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No alerts — city grid nominal.</p>
              </div>
            )}
          </div>

          {/* 7-Day Trend */}
          <div className="pt-2">
            <ChartCard
              title="7-Day Incident & Resolution Trend"
              subtitle="Backend-aggregated municipal incident history."
            >
              <IncidentsLineChart data={overTimeData} />
            </ChartCard>
          </div>
        </div>
      </div>

      {/* Embedded Live Camera Modal */}
      <CameraStreamModal
        camera={selectedCameraForStream}
        isOpen={!!selectedCameraForStream}
        onClose={() => setSelectedCameraForStream(null)}
      />
    </div>
  );
}
