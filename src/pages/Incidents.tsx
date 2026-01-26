import { StatsCard } from "@/components/dashboard/StatsCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { mockAlerts } from "@/data/mockData";
import {
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskBadge } from "@/components/dashboard/RiskIndicator";
import { format } from "date-fns";

const mockIncidentHistory = [
  ...mockAlerts,
  ...mockAlerts.map((a) => ({
    ...a,
    id: `${a.id}-2`,
    status: "resolved" as const,
    timestamp: "2024-01-25T14:30:00",
  })),
];

const Incidents = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Incidents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete incident history and management
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Incidents"
          value="1,247"
          subtitle="All time"
          icon={AlertTriangle}
        />
        <StatsCard
          title="This Month"
          value="87"
          subtitle="January 2024"
          icon={Calendar}
          variant="info"
        />
        <StatsCard
          title="Avg. Resolution"
          value="4.2 hrs"
          subtitle="Mean time to resolve"
          icon={Clock}
          variant="success"
        />
        <StatsCard
          title="Pending Review"
          value="12"
          subtitle="Requires attention"
          icon={FileText}
          variant="warning"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search incidents..." className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockIncidentHistory.slice(0, 10).map((incident) => (
              <TableRow key={incident.id}>
                <TableCell className="font-mono text-xs">{incident.id}</TableCell>
                <TableCell className="capitalize">{incident.type}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {incident.location}
                </TableCell>
                <TableCell>
                  <RiskBadge level={incident.riskLevel} />
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                      incident.status === "active"
                        ? "bg-destructive/20 text-destructive"
                        : incident.status === "investigating"
                        ? "bg-warning/20 text-warning"
                        : "bg-success/20 text-success"
                    }`}
                  >
                    {incident.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(incident.timestamp), "MMM dd, HH:mm")}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Incidents;
