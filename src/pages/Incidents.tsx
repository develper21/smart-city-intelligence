import { useState, useEffect } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { IncidentDetailsModal } from "@/components/dashboard/IncidentDetailsModal";
import { Alert, surveillanceAPI } from "@/services/api";
import {
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle,
  Filter,
  Search,
  Download,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Incidents() {
  const [incidents, setIncidents] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIncident, setSelectedIncident] = useState<Alert | null>(null);

  useEffect(() => {
    surveillanceAPI
      .getAlerts({ limit: 300 })
      .then(({ alerts }) => setIncidents(alerts))
      .catch(() => toast.error("Backend se incident registry fetch nahi hui"));
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesStatus = statusFilter === "all" || inc.status === statusFilter;
    const matchesSearch =
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.cameraId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExport = () => {
    if (filteredIncidents.length === 0) {
      toast.info("Export ke liye koi incident nahi mila");
      return;
    }
    const header = "Case ID,Category,Location,Camera,Threat Level,Timestamp,Status,Description";
    const rows = filteredIncidents.map((inc) =>
      [
        inc.id,
        inc.type,
        `"${inc.location.replace(/"/g, '""')}"`,
        inc.cameraId,
        inc.riskLevel,
        inc.timestamp,
        inc.status,
        `"${inc.description.replace(/"/g, '""')}"`,
      ].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `civic_incidents_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Incident Log Registry Exported", {
      description: `${filteredIncidents.length} records CSV me export ho gaye.`,
    });
  };

  const totalResolved = incidents.filter((i) => i.status === "resolved").length;
  const resolvedRate = incidents.length ? Math.round((totalResolved / incidents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Incident Registry & Case Files
            </h1>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
              LIVE BACKEND REGISTRY
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Official municipal ledger of security incidents, dispatch orders, and field outcomes.
          </p>
        </div>

        <Button onClick={handleExport} className="text-xs h-9 bg-primary text-primary-foreground">
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export Audit Dossier (.CSV)
        </Button>
      </div>

      {/* Stats Summary — backend derived */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Incidents" value={incidents.length} subtitle="All-time Backend Registry" icon={AlertTriangle} />
        <StatsCard
          title="Active Now"
          value={incidents.filter((i) => i.status === "active").length}
          subtitle="Awaiting triage"
          icon={Calendar}
          variant="info"
        />
        <StatsCard
          title="Resolved"
          value={totalResolved}
          subtitle="Backend-verified closure"
          icon={Clock}
          variant="success"
        />
        <StatsCard
          title="Resolved Rate"
          value={`${resolvedRate}%`}
          subtitle="Successful legal clearance"
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incident case ID, sensor, or sector location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-secondary/40 text-xs sm:text-sm"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-10 text-xs bg-secondary/40">
            <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Status Filter" />
          </SelectTrigger>
          <SelectContent className="glass-card text-xs">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Incident Case Table */}
      <div className="rounded-2xl border border-border/70 overflow-hidden glass-card shadow-lg">
        <Table>
          <TableHeader className="bg-secondary/40">
            <TableRow>
              <TableHead className="font-mono text-xs">Case ID</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Location & Sensor</TableHead>
              <TableHead className="text-xs">Threat Level</TableHead>
              <TableHead className="text-xs">Timestamp</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-right text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.map((incident) => (
              <TableRow
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                className="cursor-pointer hover:bg-secondary/40 transition-colors"
              >
                <TableCell className="font-mono font-semibold text-xs text-primary">
                  {incident.id}
                </TableCell>
                <TableCell className="text-xs font-medium capitalize">{incident.type}</TableCell>
                <TableCell className="text-xs">
                  <div className="font-medium text-foreground">{incident.location}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{incident.cameraId}</div>
                </TableCell>
                <TableCell>
                  <RiskBadge level={incident.riskLevel} />
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {format(new Date(incident.timestamp), "MMM dd, HH:mm")}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold",
                      incident.status === "active" && "bg-destructive/15 text-destructive border border-destructive/25",
                      incident.status === "investigating" && "bg-warning/15 text-warning border border-warning/25",
                      incident.status === "resolved" && "bg-success/15 text-success border border-success/25"
                    )}
                  >
                    {incident.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-primary hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIncident(incident);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Dossier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredIncidents.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold">No Incidents Match Filters</p>
            <p className="text-xs text-muted-foreground mt-1">
              Backend registry me is query ke liye koi record nahi mila.
            </p>
          </div>
        )}
      </div>

      {/* Embedded Incident Dossier Modal */}
      <IncidentDetailsModal
        incident={selectedIncident}
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
}
