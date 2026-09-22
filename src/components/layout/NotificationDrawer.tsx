import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNotifications, NotificationItem } from "@/contexts/NotificationContext";
import { RiskBadge } from "@/components/dashboard/RiskIndicator";
import {
  Bell,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  ShieldAlert,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert } from "@/services/api";

interface NotificationDrawerProps {
  onInspectAlert: (alert: Alert) => void;
}

export function NotificationDrawer({ onInspectAlert }: NotificationDrawerProps) {
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    soundEnabled,
    toggleSound,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    triggerSimulatedAlert,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("all");

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "critical") return notif.riskLevel === "critical";
    if (activeTab === "active") return !notif.read;
    return true;
  });

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-card/95 backdrop-blur-2xl border-l border-border/70 shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/60 bg-secondary/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary glow-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold">
                  Surveillance Dispatch Hub
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread security events` : "All alerts acknowledged"}
                </SheetDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={toggleSound}
              title={soundEnabled ? "Mute audio alarms" : "Unmute audio alarms"}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-primary" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 text-xs"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark All Read
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={triggerSimulatedAlert}
              className="h-7 text-xs bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Simulate Event
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-secondary/50">
              <TabsTrigger value="all" className="text-xs">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="critical" className="text-xs">
                Critical ({notifications.filter((n) => n.riskLevel === "critical").length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs">
                Unread ({unreadCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <ShieldAlert className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-foreground">No alerts in this view</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Municipal sensor grid is operating nominally without flagged threats.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markAsRead(notif.id);
                  if (notif.rawAlert) {
                    onInspectAlert(notif.rawAlert);
                    setIsDrawerOpen(false);
                  }
                }}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01]",
                  notif.read
                    ? "bg-secondary/20 border-border/50 text-muted-foreground hover:bg-secondary/40"
                    : "bg-secondary/50 border-primary/30 text-foreground hover:border-primary/60 shadow-md",
                  notif.riskLevel === "critical" && !notif.read && "border-destructive/50 bg-destructive/5"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                    <span className="font-semibold text-xs tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {notif.title}
                    </span>
                  </div>
                  <RiskBadge level={notif.riskLevel} />
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 group-hover:text-foreground/90 transition-colors">
                  {notif.message}
                </p>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{notif.location}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{notif.timestamp}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/60 bg-secondary/30 text-center">
          <p className="text-[11px] text-muted-foreground font-mono">
            CONNECTED TO CIVIC-AI EVENT BUS • STREAM ENCRYPTED
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
