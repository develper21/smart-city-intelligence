import {
  Camera,
  AlertTriangle,
  Activity,
  Clock,
  Shield,
  TrendingUp,
  Video,
  Eye,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CameraFeedCard } from "@/components/dashboard/CameraFeedCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { CityMapView } from "@/components/dashboard/CityMapView";
import { RiskIndicator } from "@/components/dashboard/RiskIndicator";
import {
  ChartCard,
  IncidentsLineChart,
  HourlyActivityChart,
} from "@/components/dashboard/AnalyticsCharts";
import {
  mockCameras,
  mockAlerts,
  mockStats,
  mockIncidentsOverTime,
  mockHourlyData,
  mockMapPins,
} from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const activeAlerts = mockAlerts.filter((a) => a.status === "active");
  const criticalAlerts = mockAlerts.filter((a) => a.riskLevel === "critical");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time surveillance monitoring and alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="text-xs text-muted-foreground">System Risk Level:</span>
            <RiskIndicator level={mockStats.riskLevel} size="lg" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Cameras"
          value={`${mockStats.activeCameras}/${mockStats.totalCameras}`}
          subtitle="Cameras online"
          icon={Camera}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="Active Alerts"
          value={mockStats.totalAlerts}
          subtitle={`${criticalAlerts.length} critical`}
          icon={AlertTriangle}
          variant="destructive"
          trend={{ value: 15, isPositive: false }}
        />
        <StatsCard
          title="Resolved Today"
          value={mockStats.resolvedToday}
          subtitle="Incidents handled"
          icon={Shield}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Avg Response Time"
          value={mockStats.avgResponseTime}
          subtitle="To acknowledge"
          icon={Clock}
          variant="info"
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Camera Feeds */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Live Camera Feeds</h2>
            </div>
            <Link to="/live-feeds">
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCameras.slice(0, 6).map((camera) => (
              <CameraFeedCard key={camera.id} camera={camera} />
            ))}
          </div>
        </div>

        {/* Right Column - Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="font-semibold">Recent Alerts</h2>
            </div>
            <Link to="/alerts">
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {activeAlerts.slice(0, 5).map((alert) => (
              <AlertCard key={alert.id} alert={alert} compact />
            ))}
          </div>
        </div>
      </div>

      {/* Map and Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* City Map */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">City Overview</h2>
          </div>
          <CityMapView pins={mockMapPins} />
        </div>

        {/* Analytics */}
        <div className="space-y-4">
          <ChartCard
            title="Incidents Over Time"
            subtitle="Last 7 days"
          >
            <IncidentsLineChart data={mockIncidentsOverTime} />
          </ChartCard>
          <ChartCard
            title="Hourly Activity"
            subtitle="Today's incident distribution"
          >
            <HourlyActivityChart data={mockHourlyData} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
