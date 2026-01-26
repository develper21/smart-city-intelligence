import {
  ChartCard,
  IncidentsLineChart,
  AlertTypesBarChart,
  HourlyActivityChart,
  ResolutionPieChart,
} from "@/components/dashboard/AnalyticsCharts";
import {
  mockIncidentsOverTime,
  mockAlertTypeDistribution,
  mockHourlyData,
  mockResolutionStats,
  mockStats,
} from "@/data/mockData";
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
import { useState } from "react";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7d");

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Incidents"
          value="125"
          subtitle="This period"
          icon={AlertTriangle}
          trend={{ value: 12, isPositive: false }}
        />
        <StatsCard
          title="Resolution Rate"
          value="87%"
          subtitle="Successfully resolved"
          icon={CheckCircle}
          variant="success"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Avg. Response Time"
          value="2.3 min"
          subtitle="Time to acknowledge"
          icon={Clock}
          variant="info"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Detection Accuracy"
          value="94.5%"
          subtitle="AI model accuracy"
          icon={Target}
          variant="warning"
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Incidents Over Time"
          subtitle="Comparison of total incidents vs resolved"
        >
          <IncidentsLineChart data={mockIncidentsOverTime} />
        </ChartCard>
        <ChartCard
          title="Alert Types Distribution"
          subtitle="Breakdown by incident category"
        >
          <AlertTypesBarChart data={mockAlertTypeDistribution} />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Hourly Activity"
          subtitle="Incident frequency by hour"
          className="lg:col-span-2"
        >
          <HourlyActivityChart data={mockHourlyData} />
        </ChartCard>
        <ChartCard title="Resolution Status" subtitle="Current incident status">
          <ResolutionPieChart data={mockResolutionStats} />
          <div className="mt-4 space-y-2">
            {mockResolutionStats.map((item, index) => (
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
              <span className="font-medium">{mockStats.systemUptime}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${mockStats.systemUptime}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Camera Coverage</span>
              <span className="font-medium">93%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "93%" }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Alert Processing</span>
              <span className="font-medium">98%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-info rounded-full" style={{ width: "98%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
