import { AlertCard } from "@/components/dashboard/AlertCard";
import { mockAlerts } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Bell, BellOff, CheckCircle } from "lucide-react";
import { useState } from "react";

const Alerts = () => {
  const [riskFilter, setRiskFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filterAlerts = (status: string) => {
    return mockAlerts.filter((alert) => {
      const matchesStatus = status === "all" || alert.status === status;
      const matchesRisk = riskFilter === "all" || alert.riskLevel === riskFilter;
      const matchesType = typeFilter === "all" || alert.type === typeFilter;
      const matchesSearch =
        alert.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesRisk && matchesType && matchesSearch;
    });
  };

  const activeAlerts = filterAlerts("active");
  const investigatingAlerts = filterAlerts("investigating");
  const resolvedAlerts = filterAlerts("resolved");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and respond to security alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-medium text-destructive">
              {activeAlerts.length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Alert Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="intrusion">Intrusion</SelectItem>
              <SelectItem value="violence">Violence</SelectItem>
              <SelectItem value="crowd">Crowd</SelectItem>
              <SelectItem value="traffic">Traffic</SelectItem>
              <SelectItem value="fire">Fire</SelectItem>
              <SelectItem value="unattended">Unattended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Active ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="investigating" className="flex items-center gap-2">
            <BellOff className="h-4 w-4" />
            Investigating ({investigatingAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
          {activeAlerts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active alerts found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="investigating" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {investigatingAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
          {investigatingAlerts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No alerts under investigation.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {resolvedAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
          {resolvedAlerts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No resolved alerts found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Alerts;
