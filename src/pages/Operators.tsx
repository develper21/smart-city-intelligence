import { useState, useEffect } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { OperatorDetailsModal } from "@/components/dashboard/OperatorDetailsModal";
import { surveillanceAPI, Operator } from "@/services/api";
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
import { Users, UserPlus, Shield, Activity, Search, Radio } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Operators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Operator Form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    surveillanceAPI
      .getOperators()
      .then(setOperators)
      .catch(() => toast.error("Backend se operator roster fetch nahi hua"));
  }, []);

  const filteredOperators = operators.filter(
    (op) =>
      op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) {
      toast.error("Name, email aur password required hain");
      return;
    }
    try {
      const username = newEmail.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "") || `op${Date.now()}`;
      await surveillanceAPI.register({
        username,
        email: newEmail,
        password: newPassword,
        name: newName,
        role: "operator",
      });
      toast.success("Officer Provisioned on Backend", {
        description: `${newName} registered with operator clearance.`,
      });
      setAddModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      const roster = await surveillanceAPI.getOperators();
      setOperators(roster);
    } catch {
      toast.error("Provisioning failed", {
        description: "Email/username already registered ya admin clearance required.",
      });
    }
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
        <StatsCard title="Total Duty Personnel" value={operators.length} subtitle="Authorized Roster" icon={Users} />
        <StatsCard
          title="Active On-Shift"
          value={operators.filter((o) => o.status === "online").length}
          subtitle="Console Stations Manned"
          icon={Shield}
          variant="success"
        />
        <StatsCard
          title="Alerts Handled"
          value={operators.reduce((s, o) => s + o.alerts, 0)}
          subtitle="Cumulative triage load"
          icon={Activity}
          variant="info"
        />
        <StatsCard
          title="On Break / Offline"
          value={operators.filter((o) => o.status !== "online").length}
          subtitle="Awaiting shift return"
          icon={Radio}
          variant="warning"
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
              <TableHead className="text-xs">Alerts Handled</TableHead>
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
                      {operator.avatar && <AvatarImage src={operator.avatar} />}
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
                <TableCell className="font-mono text-xs text-muted-foreground">{operator.id}</TableCell>
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
                      operator.status === "online" && "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
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
        {filteredOperators.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold">No Officers Match Search</p>
          </div>
        )}
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
              Backend par naya operator account create hoga (operator clearance).
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
              <label className="text-xs font-medium">Official Email</label>
              <Input
                type="email"
                placeholder="officer@smartcity.gov"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="text-xs bg-secondary/30"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Temporary Passkey</label>
              <Input
                type="password"
                placeholder="Set initial password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-xs bg-secondary/30"
                required
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="submit" className="text-xs bg-primary text-primary-foreground w-full">
                Register Officer on Backend
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
