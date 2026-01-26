import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Shield, Activity, Search } from "lucide-react";

const mockOperators = [
  {
    id: "OP-001",
    name: "Rajesh Kumar",
    role: "Senior Operator",
    status: "online",
    zone: "Zone A",
    alerts: 3,
    lastActive: "Active now",
  },
  {
    id: "OP-002",
    name: "Priya Sharma",
    role: "Operator",
    status: "online",
    zone: "Zone B",
    alerts: 5,
    lastActive: "Active now",
  },
  {
    id: "OP-003",
    name: "Amit Patel",
    role: "Operator",
    status: "offline",
    zone: "Zone C",
    alerts: 0,
    lastActive: "2 hours ago",
  },
  {
    id: "OP-004",
    name: "Sneha Reddy",
    role: "Supervisor",
    status: "online",
    zone: "All Zones",
    alerts: 12,
    lastActive: "Active now",
  },
  {
    id: "OP-005",
    name: "Vikram Singh",
    role: "Operator",
    status: "busy",
    zone: "Zone D",
    alerts: 2,
    lastActive: "5 min ago",
  },
];

const Operators = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Operators</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage control room operators and assignments
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Operator
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Operators"
          value="24"
          subtitle="Registered"
          icon={Users}
        />
        <StatsCard
          title="Online Now"
          value="18"
          subtitle="Active operators"
          icon={Activity}
          variant="success"
        />
        <StatsCard
          title="Supervisors"
          value="4"
          subtitle="Team leads"
          icon={Shield}
          variant="info"
        />
        <StatsCard
          title="Assigned Alerts"
          value="22"
          subtitle="Being handled"
          icon={Users}
          variant="warning"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search operators..." className="pl-10" />
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operator</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Assigned Alerts</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOperators.map((operator) => (
              <TableRow key={operator.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                      <span className="text-xs font-semibold text-primary">
                        {operator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{operator.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {operator.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{operator.role}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      operator.status === "online"
                        ? "default"
                        : operator.status === "busy"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      operator.status === "online"
                        ? "bg-success/20 text-success border-success/30"
                        : operator.status === "busy"
                        ? "bg-warning/20 text-warning border-warning/30"
                        : ""
                    }
                  >
                    {operator.status}
                  </Badge>
                </TableCell>
                <TableCell>{operator.zone}</TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      operator.alerts > 5
                        ? "text-destructive"
                        : operator.alerts > 0
                        ? "text-warning"
                        : "text-muted-foreground"
                    }`}
                  >
                    {operator.alerts}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {operator.lastActive}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Manage
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

export default Operators;
