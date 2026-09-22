import {
  ChartCard,
  IncidentsLineChart,
  AlertTypesBarChart,
  HourlyActivityChart,
  ResolutionPieChart,
} from "@/components/dashboard/AnalyticsCharts";
import { surveillanceAPI } from "@/services/api";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [incidentsOverTime, setIncidentsOverTime] = useState<{ date: string; incidents: number; resolved: number }[]>([]);
  const [alertTypes, setAlertTypes] = useState<{ type: string; count: number; color: string }[]>([]);
  const [hourlyData, setHourlyData] = useState<{ hour: string; incidents: number }[]>([]);
  const [resolutionStats, setResolutionStats] = useState<{ status: string; count: number; percentage: number }[]>([]);
  /* eslint-disable @typescript-eslint/no-explicit-any -- backend KPI envelopes are untyped */
  const [summary, setSummary] = useState<any>(null);
  const [perf, setPerf] = useState<any>(null);

  useEffect(() => {
    const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    Promise.all([
      surveillanceAPI.getIncidentsOverTime(days),
      surveillanceAPI.getAlertTypes(),
      surveillanceAPI.getHourlyActivity(),
      surveillanceAPI.getResolutionStatus(),
      surveillanceAPI.getSummary().catch(() => null),
      surveillanceAPI.getPerformance().catch(() => null),
    ])
      .then(([overTime, types, hourly, resolution, sum, performance]) => {
        setIncidentsOverTime(overTime);
        setAlertTypes(types);
        setHourlyData(hourly);
        setResolutionStats(resolution);
        setSummary(sum);
        setPerf(performance);
      })
      .catch(() => toast.error("Backend se analytics fetch nahi hui"));
  }, [timeRange]);

  const totalIncidents = incidentsOverTime.reduce((s, d) => s + d.incidents, 0);
  const totalResolved = incidentsOverTime.reduce((s, d) => s + d.resolved, 0);
  const resolutionRate = totalIncidents > 0 ? Math.round((totalResolved / totalIncidents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Insights and trends from surveillance data
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards — live backend summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Incidents"
          value={totalIncidents}
          subtitle="This period"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          subtitle="Successfully resolved"
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Avg. Response Time"
          value={summary?.avg_response_time || "—"}
          subtitle="Time to acknowledge"
          icon={Clock}
          variant="info"
        />
        <StatsCard
          title="AI Pipeline"
          value={`${perf?.fps?.toFixed?.(1) ?? "0"} FPS`}
          subtitle={`${perf?.avg_processing_time ?? "—"} ms avg latency`}
          icon={Target}
          variant="warning"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Incidents Over Time"
          subtitle="Comparison of total incidents vs resolved"
        >
          <IncidentsLineChart data={incidentsOverTime} />
        </ChartCard>
        <ChartCard
          title="Alert Types Distribution"
          subtitle="Breakdown by incident category"
        >
          <AlertTypesBarChart data={alertTypes} />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Hourly Activity"
          subtitle="Incident frequency by hour"
          className="lg:col-span-2"
        >
          <HourlyActivityChart data={hourlyData} />
        </ChartCard>
        <ChartCard title="Resolution Status" subtitle="Current incident status">
          <ResolutionPieChart data={resolutionStats} />
          <div className="mt-4 space-y-2">
            {resolutionStats.map((item, index) => (
              <div key={item.status} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        index === 0
                          ? "hsl(var(--chart-1))"
                          : index === 1
                          ? "hsl(var(--chart-3))"
                          : "hsl(var(--chart-4))",
                    }}
                  />
                  <span className="text-muted-foreground">{item.status}</span>
                </div>
                <span className="font-medium">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Performance Metrics */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">System Uptime</span>
              <span className="font-medium">{perf?.system_uptime ?? "—"}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${perf?.system_uptime ?? 0}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Camera Coverage</span>
              <span className="font-medium">{perf?.camera_coverage ?? "—"}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${perf?.camera_coverage ?? 0}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Alert Processing</span>
              <span className="font-medium">{perf?.alert_processing ?? "—"}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-info rounded-full" style={{ width: `${perf?.alert_processing ?? 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
