import {
  Camera,
  AlertTriangle,
  Activity,
  Clock,
  Shield,
  TrendingUp,
  Video,
  Eye,
  Users,
  MapPin,
  Zap,
  Radio,
  Database,
  Server,
  Wifi,
  WifiOff,
  Settings,
  Bell,
  Search,
  Filter,
  Navigation,
  Monitor,
  Cctv,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX
} from "lucide-react";
import { useState, useEffect } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CameraFeedCard } from "@/components/dashboard/CameraFeedCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { GoogleMapView } from "@/components/dashboard/GoogleMapView";
import { RiskIndicator } from "@/components/dashboard/RiskIndicator";
import {
  ChartCard,
  IncidentsLineChart,
  HourlyActivityChart,
} from "@/components/dashboard/AnalyticsCharts";
import { surveillanceAPI, wsManager, Alert, SystemStatus, Analytics } from "@/services/api";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [realTimeAlerts, setRealTimeAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [status, alerts, analyticsData] = await Promise.all([
          surveillanceAPI.getSystemStatus(),
          surveillanceAPI.getAlerts(10),
          surveillanceAPI.getAnalytics(),
        ]);

        setSystemStatus(status);
        setRealTimeAlerts(alerts.alerts);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    wsManager.connect((data) => {
      console.log('Received WebSocket data:', data);
      
      if (data.type === 'alert') {
        // Add new alert to the list
        const newAlert: Alert = {
          id: Date.now(),
          event_type: data.data.event_type,
          risk_level: data.data.risk_level,
          message: data.data.description,
          alert_time: new Date().toISOString(),
          acknowledged: false,
        };
        
        setRealTimeAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep only 10 most recent
      }
      
      setWsConnected(true);
    });

    return () => {
      wsManager.disconnect();
      setWsConnected(false);
    };
  }, []);

  // Fallback to real-time data only (no mock data)
  const activeAlerts = realTimeAlerts.filter((a) => !a.acknowledged);
  const criticalAlerts = activeAlerts.filter((a) => a.risk_level === "critical");
  
  // Use only real-time data
  const stats = analytics ? {
    activeCameras: `${systemStatus?.metrics.active_streams || 0}/4`,
    totalAlerts: analytics.statistics.total_detections || 0,
    resolvedToday: analytics.statistics.total_detections || 0,
    avgResponseTime: systemStatus?.metrics.avg_processing_time ? `${systemStatus.metrics.avg_processing_time.toFixed(2)}s` : "0.00s",
    riskLevel: analytics.statistics.critical_alerts > 0 ? 'critical' : 'medium'
  } : {
    activeCameras: "0/4",
    totalAlerts: 0,
    resolvedToday: 0,
    avgResponseTime: "0.00s",
    riskLevel: 'medium'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading surveillance system...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Smart City Surveillance</h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-powered crime detection and monitoring system
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-3">
            <Server className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">AI System:</span>
            <RiskIndicator level={(stats.riskLevel as 'critical' | 'high' | 'medium' | 'low') || 'medium'} size="lg" />
          </div>
          <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Wifi className={`h-4 w-4 ${wsConnected ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {wsConnected ? 'AI Connected' : 'AI Offline'}
            </span>
          </div>
          <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">PostgreSQL</span>
            <CheckCircle className="h-3 w-3 text-green-500" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Cameras"
          value={stats.activeCameras}
          subtitle="Cameras online"
          icon={Cctv}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="Active Alerts"
          value={stats.totalAlerts}
          subtitle={`${criticalAlerts.length} critical`}
          icon={Bell}
          variant="destructive"
          trend={{ value: 15, isPositive: false }}
        />
        <StatsCard
          title="Resolved Today"
          value={stats.resolvedToday}
          subtitle="Incidents handled"
          icon={ShieldCheck}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Avg Response Time"
          value={stats.avgResponseTime}
          subtitle="To acknowledge"
          icon={Zap}
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
              <Cctv className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Live Camera Feeds</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Link to="/live-feeds">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Real-time camera feeds from API */}
            {systemStatus?.streams && Object.keys(systemStatus.streams).length > 0 ? (
              Object.entries(systemStatus.streams).slice(0, 6).map(([streamId, stream]) => (
                <CameraFeedCard 
                  key={streamId}
                  camera={{
                    id: streamId,
                    name: stream.location,
                    status: stream.is_active ? 'online' : 'offline',
                    location: stream.location,
                    lastUpdated: 'Live'
                  } as any}
                />
              ))
            ) : (
              // Placeholder when no streams are active
              Array.from({ length: 6 }, (_, i) => (
                <CameraFeedCard 
                  key={`placeholder-${i}`}
                  camera={{
                    id: `cam-${i + 1}`,
                    name: `Camera ${i + 1}`,
                    status: 'offline',
                    location: 'Location Unknown',
                    lastUpdated: 'No Activity'
                  } as any}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column - Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-destructive" />
              <h2 className="font-semibold">Recent Alerts</h2>
              {realTimeAlerts.length > 0 && (
                <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                  {realTimeAlerts.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4" />
              </Button>
              <Link to="/alerts">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {realTimeAlerts.length > 0 ? (
              realTimeAlerts.slice(0, 5).map((alert) => (
                <AlertCard 
                  key={alert.id} 
                  alert={{
                    id: alert.id.toString(),
                    type: (alert.event_type as any) || 'violence',
                    location: 'Unknown Location',
                    cameraId: 'AI System',
                    timestamp: alert.alert_time,
                    riskLevel: (alert.risk_level as any) || 'medium',
                    description: alert.message,
                    status: (alert.acknowledged ? 'resolved' : 'active') as any
                  }} 
                  compact 
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No alerts detected</p>
                <p className="text-xs">System is monitoring for threats</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map and Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Google Map */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">City Overview</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <GoogleMapView pins={[]} />
        </div>

        {/* Analytics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Analytics</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ChartCard
            title="Incidents Over Time"
            subtitle="Last 7 days"
          >
            <IncidentsLineChart data={analytics ? [] : []} />
          </ChartCard>
          <ChartCard
            title="Hourly Activity"
            subtitle="Today's incident distribution"
          >
            <HourlyActivityChart data={analytics ? [] : []} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
