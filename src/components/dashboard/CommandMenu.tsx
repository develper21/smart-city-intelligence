import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Video,
  AlertTriangle,
  Map,
  BarChart3,
  Activity,
  Users,
  Settings,
  Shield,
  Search,
  Bell,
  Sun,
  Moon,
  Home,
  LogOut,
} from "lucide-react";
import { mockCameras, mockAlerts } from "@/data/mockData";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAlert?: (alert: any) => void;
  onSelectCamera?: (camera: any) => void;
}

export function CommandMenu({
  open,
  onOpenChange,
  onSelectAlert,
  onSelectCamera,
}: CommandMenuProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleRun = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search cameras, active alerts, locations, or actions..." />
      <CommandList className="max-h-[380px] custom-scrollbar">
        <CommandEmpty>No matching intelligence results found.</CommandEmpty>

        {/* Quick Navigation */}
        <CommandGroup heading="Command Center Navigation">
          <CommandItem
            onSelect={() => handleRun(() => navigate("/dashboard"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span>Operations Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleRun(() => navigate("/live-feeds"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Video className="h-4 w-4 text-primary" />
            <span>Live Camera Feeds Wall</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleRun(() => navigate("/alerts"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span>Security Alerts Triage</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleRun(() => navigate("/map"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Map className="h-4 w-4 text-info" />
            <span>Metropolitan GIS Map</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleRun(() => navigate("/analytics"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            <span>City Crime & Trend Analytics</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleRun(() => navigate("/incidents"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Activity className="h-4 w-4 text-warning" />
            <span>Incident Registry & Case Files</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleRun(() => navigate("/operators"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Users className="h-4 w-4 text-purple-400" />
            <span>Personnel & Duty Operators</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleRun(() => navigate("/settings"))}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>System Preferences & AI Sensitivity</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Live Cameras */}
        <CommandGroup heading="Surveillance Cameras">
          {mockCameras.map((cam) => (
            <CommandItem
              key={cam.id}
              onSelect={() =>
                handleRun(() => {
                  if (onSelectCamera) onSelectCamera(cam);
                  else navigate("/live-feeds");
                })
              }
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Video className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium text-xs">{cam.name}</span>
                <span className="text-[11px] text-muted-foreground">({cam.location})</span>
              </div>
              <span className="font-mono text-[10px] text-primary">{cam.id}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Active Alerts */}
        <CommandGroup heading="Active Security Alerts">
          {mockAlerts.slice(0, 4).map((alt) => (
            <CommandItem
              key={alt.id}
              onSelect={() =>
                handleRun(() => {
                  if (onSelectAlert) onSelectAlert(alt);
                  else navigate("/alerts");
                })
              }
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs truncate max-w-[280px]">{alt.description}</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-destructive font-semibold">
                {alt.riskLevel}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Fast Actions */}
        <CommandGroup heading="Operator Actions">
          <CommandItem
            onSelect={() =>
              handleRun(() => {
                toggleTheme();
                toast.info(`Switched theme to ${theme === "dark" ? "light" : "dark"} mode`);
              })
            }
            className="flex items-center gap-2 cursor-pointer"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>Toggle Theme ({theme === "dark" ? "Light Mode" : "Dark Mode"})</span>
          </CommandItem>
          {user && (
            <CommandItem
              onSelect={() =>
                handleRun(() => {
                  logout();
                  navigate("/login");
                  toast.info("Logged out from Command Center session");
                })
              }
              className="flex items-center gap-2 text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out Operator Session</span>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
