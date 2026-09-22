import { useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { OperatorDetailsModal } from "@/components/dashboard/OperatorDetailsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, UserPlus, Shield, Activity, Search, Radio, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const initialOperators = [
  {
    id: "OP-001",
    name: "Rajesh Kumar",
    role: "Senior Operator",
    status: "online",
    zone: "Zone A (North)",
    alerts: 3,
    lastActive: "Active now",
  },
  {
    id: "OP-002",
    name: "Priya Sharma",
    role: "Tactical Dispatcher",
    status: "online",
    zone: "Zone B (Central)",
    alerts: 5,
    lastActive: "Active now",
  },
  {
    id: "OP-003",
    name: "Amit Patel",
    role: "Surveillance Officer",
    status: "offline",
    zone: "Zone C (Highway)",
    alerts: 0,
    lastActive: "2 hours ago",
  },
  {
    id: "OP-004",
    name: "Sneha Reddy",
    role: "Duty Supervisor",
    status: "online",
    zone: "All City Sectors",
    alerts: 12,
    lastActive: "Active now",
  },
  {
    id: "OP-005",
    name: "Vikram Singh",
    role: "Response Coordinator",
    status: "busy",
    zone: "Zone D (Industrial)",
    alerts: 2,
    lastActive: "5 min ago",
  },
];

export default function Operators() {
  const [operators, setOperators] = useState(initialOperators);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<any | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Operator Form
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Surveillance Officer");
  const [newZone, setNewZone] = useState("Zone A (North)");

  const filteredOperators = operators.filter(
    (op) =>
      op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newOp = {
      id: `OP-00${operators.length + 1}`,
      name: newName,
      role: newRole,
      status: "online",
      zone: newZone,
      alerts: 0,
      lastActive: "Active now",
    };

    setOperators([newOp, ...operators]);
    setAddModalOpen(false);
    setNewName("");
    toast.success("Officer Provisioned to Console Roster", {
      description: `${newName} assigned to ${newZone}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Control Room Personnel & Shifts
            </h1>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
              DUTY ROSTER
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Active console operators, duty shifts, and tactical communications dispatch.
          </p>
        </div>

        <Button onClick={() => setAddModalOpen(true)} className="text-xs h-9 bg-primary text-primary-foreground">
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
          Provision Officer
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Duty Personnel"
          value={operators.length}
          subtitle="Authorized Roster"
          icon={Users}
        />
        <StatsCard
          title="Active On-Shift"
          value={operators.filter((o) => o.status === "online").length}
          subtitle="Console Stations Manned"
          icon={Shield}
          variant="success"
        />
        <StatsCard
          title="Incidents Assigned"
          value="22 Active"
          subtitle="Under active triage"
          icon={Activity}
          variant="info"
        />
        <StatsCard
          title="Mean Response"
          value="1.4 min"
          subtitle="Triage SLA: < 3 min"
          icon={Radio}
          variant="success"
        />
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search officer by name, badge ID, or patrol sector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 bg-secondary/40 text-xs sm:text-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/70 overflow-hidden glass-card shadow-lg">
        <Table>
          <TableHeader className="bg-secondary/40">
            <TableRow>
              <TableHead className="text-xs">Officer Profile</TableHead>
              <TableHead className="text-xs font-mono">Badge ID</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Assigned Sector</TableHead>
              <TableHead className="text-xs">Active Alerts</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-right text-xs">Comms</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOperators.map((operator) => (
              <TableRow
                key={operator.id}
                onClick={() => setSelectedOperator(operator)}
                className="cursor-pointer hover:bg-secondary/40 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                        {operator.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-xs text-foreground">{operator.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{operator.lastActive}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {operator.id}
                </TableCell>
                <TableCell className="text-xs font-medium">{operator.role}</TableCell>
                <TableCell className="text-xs">{operator.zone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {operator.alerts} Handled
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold",
                      operator.status === "online" && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                      operator.status === "busy" && "bg-warning/15 text-warning border border-warning/30",
                      operator.status === "offline" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {operator.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success(`Encrypted VoIP connected to ${operator.name}`);
                    }}
                  >
                    <Radio className="h-3.5 w-3.5 mr-1" />
                    Radio
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Operator Details Modal */}
      <OperatorDetailsModal
        operator={selectedOperator}
        isOpen={!!selectedOperator}
        onClose={() => setSelectedOperator(null)}
      />

      {/* Provision Officer Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md p-6 glass-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Provision Officer to Duty Roster</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add an authorized console operator to the tactical roster.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddOperator} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Officer Full Name</label>
              <Input
                placeholder="e.g. Inspector R. Verma"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-xs bg-secondary/30"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Operational Role</label>
              <Input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="text-xs bg-secondary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Assigned Sector</label>
              <Input
                value={newZone}
                onChange={(e) => setNewZone(e.target.value)}
                className="text-xs bg-secondary/30"
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="submit" className="text-xs bg-primary text-primary-foreground w-full">
                Register Officer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
