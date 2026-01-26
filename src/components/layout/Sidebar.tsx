import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  AlertTriangle,
  BarChart3,
  Settings,
  Map,
  ChevronLeft,
  ShieldCheck,
  Users,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Video, label: "Live Feeds", path: "/live-feeds" },
  { icon: AlertTriangle, label: "Alerts", path: "/alerts" },
  { icon: Map, label: "City Map", path: "/map" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Activity, label: "Incidents", path: "/incidents" },
  { icon: Users, label: "Operators", path: "/operators" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-[70px]" : "w-64"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-sidebar-primary" />
              <span className="font-semibold text-sm">SURVEILLANCE</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "hidden md:flex h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent",
              isCollapsed && "mx-auto"
            )}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Main Navigation
              </p>
            )}
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground glow-primary"
                      : "text-sidebar-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "animate-pulse-glow")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          {!isCollapsed ? (
            <div className="glass-card p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium">System Status</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
              <div className="mt-2 flex gap-1">
                <div className="flex-1 h-1 rounded-full bg-success/30">
                  <div className="h-full w-[95%] rounded-full bg-success" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">95% uptime</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
