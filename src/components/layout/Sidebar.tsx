import { NavLink, useLocation, Link } from "react-router-dom";
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
  Globe,
  Radio,
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
  { icon: LayoutDashboard, label: "Operations Dashboard", path: "/dashboard" },
  { icon: Video, label: "Live Camera Feeds", path: "/live-feeds" },
  { icon: AlertTriangle, label: "Security Alerts", path: "/alerts", badge: "6 Active" },
  { icon: Map, label: "Metropolitan Map", path: "/map" },
  { icon: BarChart3, label: "City Analytics", path: "/analytics" },
  { icon: Activity, label: "Incident Registry", path: "/incidents" },
  { icon: Users, label: "Personnel & Shifts", path: "/operators" },
  { icon: Settings, label: "System Settings", path: "/settings" },
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

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col justify-between",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            {!isCollapsed ? (
              <Link to="/dashboard" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sidebar-primary/10 border border-sidebar-primary/30 flex items-center justify-center text-sidebar-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs tracking-wider text-sidebar-foreground uppercase">
                    CIVIC COMMAND
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    SEC-SYS v2.5
                  </span>
                </div>
              </Link>
            ) : (
              <div className="mx-auto">
                <ShieldCheck className="h-6 w-6 text-sidebar-primary" />
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={cn(
                "hidden md:flex h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg",
                isCollapsed && "mx-auto mt-2"
              )}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="py-4 px-2 space-y-1">
            {!isCollapsed && (
              <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Command Navigation
              </p>
            )}

            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/dashboard" && location.pathname === "/");
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-md shadow-sidebar-primary/20 glow-primary"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && !isActive && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/25">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

          </nav>
        </div>

        {/* Footer Status Widget */}
        <div className="p-3 border-t border-sidebar-border">
          {!isCollapsed ? (
            <div className="glass-card p-3 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-foreground">AI Node #1</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">99.8%</span>
              </div>
              <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-primary w-[98%] rounded-full" />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>RTSP Ingestion</span>
                <span>247/247 Live</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
