import { useState, useEffect, useCallback } from "react";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { AlertDetailsModal } from "@/components/dashboard/AlertDetailsModal";
import { Alert, surveillanceAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function Alerts() {
  const { user } = useAuth();
  const [alertsList, setAlertsList] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sirenActive, setSirenActive] = useState(false);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<Alert | null>(null);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const { alerts } = await surveillanceAPI.getAlerts({ limit: 200 });
      setAlertsList(alerts);
    } catch {
      toast.error("Backend se alerts fetch nahi hue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const filterAlerts = (status: string) => {
    return alertsList.filter((alert) => {
      const matchesStatus = status === "all" || alert.status === status;
      const matchesRisk = riskFilter === "all" || alert.riskLevel === riskFilter;
      const matchesType = typeFilter === "all" || alert.type === typeFilter;
      const matchesSearch =
        alert.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.cameraId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesRisk && matchesType && matchesSearch;
    });
  };

  const handleResolveAlert = async (id: string) => {
    const target = alertsList.find((a) => a.id === id);
    if (!target?.numericId) return;
    try {
      await surveillanceAPI.resolveAlert(target.numericId, user?.badgeId || "operator");
      setAlertsList((prev) => prev.map((item) => (item.id === id ? { ...item, status: "resolved" } : item)));
      toast.success(`Alert ${id} resolved`);
    } catch {
      toast.error("Resolve failed — supervisor/admin clearance required");
    }
  };

  const handleResolveAllActive = async () => {
    const activeIds = alertsList
      .filter((a) => a.status === "active" && a.numericId)
      .map((a) => a.numericId!) as number[];
    if (activeIds.length === 0) return;
    try {
      await surveillanceAPI.bulkResolveAlerts(activeIds, user?.badgeId || "operator");
      setAlertsList((prev) =>
        prev.map((item) => (item.status === "active" ? { ...item, status: "resolved" } : item))
      );
      toast.success(`${activeIds.length} active alerts resolved via backend`);
    } catch {
      toast.error("Bulk resolve failed — admin/supervisor role required");
    }
  };

  const handleToggleSiren = () => {
    setSirenActive(!sirenActive);
    if (!sirenActive) {
      toast.warning("Audio Alarm Siren Active", {
        description: "Audible acoustic alert broadcast enabled for high/critical threats.",
      });
    } else {
      toast.info("Audio Alarm Siren Muted");
    }
  };

  const activeAlerts = filterAlerts("active");
  const investigatingAlerts = filterAlerts("investigating");
  const resolvedAlerts = filterAlerts("resolved");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Security Alerts Triage Hub
            </h1>
            <Badge variant="outline" className="border-destructive/40 text-destructive text-xs font-mono">
              LIVE BACKEND QUEUE
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Prioritized multi-sensor threat stream with one-click dispatch and case audit.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSiren}
            className={`text-xs h-9 ${sirenActive ? "border-destructive text-destructive bg-destructive/10" : ""}`}
          >
            {sirenActive ? (
              <Volume2 className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 mr-1.5" />
            )}
            {sirenActive ? "Siren Active" : "Mute Siren"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResolveAllActive}
            disabled={activeAlerts.length === 0}
            className="text-xs h-9"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
            Resolve All Active
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/15 border border-destructive/30">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-mono font-medium text-destructive">
              {activeAlerts.length} Active Incidents
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, description, or camera ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-secondary/40 text-xs sm:text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[140px] h-10 text-xs bg-secondary/40">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent className="glass-card text-xs">
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] h-10 text-xs bg-secondary/40">
              <SelectValue placeholder="Alert Type" />
            </SelectTrigger>
            <SelectContent className="glass-card text-xs">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="intrusion">Intrusion</SelectItem>
              <SelectItem value="violence">Violence</SelectItem>
              <SelectItem value="crowd">Crowd</SelectItem>
              <SelectItem value="traffic">Traffic</SelectItem>
              <SelectItem value="fire">Fire / Smoke</SelectItem>
              <SelectItem value="unattended">Unattended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Triage Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-secondary/50">
          <TabsTrigger value="active" className="text-xs">
            Active ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="investigating" className="text-xs">
            Investigating ({investigatingAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs">
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onInspect={(a) => setSelectedAlertForModal(a)}
                onResolve={handleResolveAlert}
              />
            ))}
          </div>
          {activeAlerts.length === 0 && !loading && (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/70 glass-card">
              <ShieldAlert className="h-10 w-10 text-emerald-500/50 mx-auto mb-2" />
              <p className="font-semibold text-sm">No Active Security Alerts</p>
              <p className="text-xs text-muted-foreground mt-1">
                All sensor channels within chosen filters report normal conditions.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="investigating" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {investigatingAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onInspect={(a) => setSelectedAlertForModal(a)}
                onResolve={handleResolveAlert}
              />
            ))}
          </div>
          {investigatingAlerts.length === 0 && !loading && (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/70 glass-card">
              <p className="text-xs text-muted-foreground">No alerts currently under active field investigation.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {resolvedAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onInspect={(a) => setSelectedAlertForModal(a)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Embedded Alert Details Modal */}
      <AlertDetailsModal
        alert={selectedAlertForModal}
        isOpen={!!selectedAlertForModal}
        onClose={() => setSelectedAlertForModal(null)}
        onResolve={handleResolveAlert}
      />
    </div>
  );
}
