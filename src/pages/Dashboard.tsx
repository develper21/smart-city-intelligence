import { useState, useEffect } from "react";
import {
  Camera as CameraIcon,
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
import {
  mockCameras,
  mockAlerts,
  mockStats,
  mockIncidentsOverTime,
  mockHourlyData,
  Camera as CameraType,
  Alert as AlertType,
} from "@/data/mockData";
import { surveillanceAPI, wsManager } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";

export default function Dashboard() {
  const { triggerSimulatedAlert, setSelectedAlert } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [cameras, setCameras] = useState<CameraType[]>(mockCameras);
  const [alerts, setAlerts] = useState<AlertType[]>(mockAlerts);
  const [selectedCameraForStream, setSelectedCameraForStream] = useState<CameraType | null>(null);

  // Attempt backend connection gracefully, fall back to rich mock data
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [status, apiAlerts] = await Promise.allSettled([
          surveillanceAPI.getSystemStatus(),
          surveillanceAPI.getAlerts(10),
        ]);

        if (status.status === "fulfilled" && status.value?.streams) {
          const streamList = Object.entries(status.value.streams).map(([id, s]) => ({
            id,
            name: s.location || `Stream ${id}`,
            location: s.location || "Central Sector",
            status: s.is_active ? ("online" as const) : ("offline" as const),
            zone: "Zone A",
            lastUpdated: "Just now",
            thumbnail: mockCameras[0]?.thumbnail || "",
          }));
          if (streamList.length > 0 && isMounted) {
            setCameras(streamList);
          }
        }

        if (apiAlerts.status === "fulfilled" && apiAlerts.value?.alerts?.length > 0) {
          const converted: AlertType[] = apiAlerts.value.alerts.map((a: any) => ({
            id: `ALT-${a.id}`,
            type: (a.event_type as any) || "intrusion",
            location: a.message?.split("at ")[1] || "City Center",
            cameraId: "CAM-001",
            riskLevel: (a.risk_level as any) || "high",
            timestamp: a.alert_time || new Date().toISOString(),
            description: a.message || "Anomalous event flagged by neural engine.",
            status: a.acknowledged ? "resolved" : "active",
          }));
          if (isMounted) setAlerts(converted);
        }
      } catch {
        // Mock fallback active
      }
    };

    loadData();

    // WebSocket attempt
    try {
      wsManager.connect((data) => {
        if (isMounted) setWsConnected(true);
      });
    } catch {
      // Offline fallback
    }

    return () => {
      isMounted = false;
      try {
        wsManager.disconnect();
      } catch {}
    };
  }, []);

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
              <Badge variant="outline" className="border-primary/40 text-primary text-[10px] font-mono">
                GRID LEVEL: OPTIMAL
              </Badge>
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
            <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"}`} />
            <span className="text-xs font-mono font-medium">
              {wsConnected ? "AI Engine Connected" : "Local AI Standby"}
            </span>
          </div>

          <div className="glass-card px-3 py-1.5 rounded-xl flex items-center gap-2 border border-border/70">
            <RiskIndicator level={criticalCount > 0 ? "critical" : "medium"} size="sm" />
            <span className="text-xs font-semibold text-muted-foreground">Grid Threat Level</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Cameras"
          value={`${mockStats.activeCameras}/${mockStats.totalCameras}`}
          subtitle="94.8% City Coverage"
          icon={Cctv}
          trend={{ value: 4, isPositive: true }}
        />
        <StatsCard
          title="Active Alerts"
          value={activeAlerts.length}
          subtitle={`${criticalCount} Critical Flagged`}
          icon={Bell}
          variant={criticalCount > 0 ? "destructive" : "default"}
          trend={{ value: 12, isPositive: false }}
        />
        <StatsCard
          title="Resolved Today"
          value={mockStats.resolvedToday}
          subtitle="Mean Triage < 2.3 min"
          icon={ShieldCheck}
          variant="success"
          trend={{ value: 9, isPositive: true }}
        />
        <StatsCard
          title="Neural Response"
          value="18.2 ms"
          subtitle="Real-time GPU Inference"
          icon={Zap}
          variant="info"
          trend={{ value: 15, isPositive: true }}
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
              <span className="text-xs font-mono text-muted-foreground">({cameras.length} Active Feeds)</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toast.info("Refreshed all camera sensor heartbeats")}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cameras.slice(0, 6).map((cam) => (
              <CameraFeedCard
                key={cam.id}
                camera={cam}
                onExpand={(c) => setSelectedCameraForStream(c)}
              />
            ))}
          </div>

          {/* Incident Telemetry Trend Charts */}
          <div className="pt-2">
            <ChartCard
              title="24-Hour Municipal Incident & Triage Volume"
              subtitle="Real-time neural detections vs. dispatch officer resolution rates."
            >
              <IncidentsLineChart data={mockIncidentsOverTime} />
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
                onResolve={(id) => {
                  setAlerts((prev) =>
                    prev.map((item) =>
                      item.id === id ? { ...item, status: "resolved" } : item
                    )
                  );
                }}
              />
            ))}
          </div>

          {/* Hourly Incident Activity */}
          <div className="pt-2">
            <ChartCard
              title="Peak Hourly Traffic & Density"
              subtitle="Anomaly clusters throughout city patrol sectors."
            >
              <HourlyActivityChart data={mockHourlyData} />
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
