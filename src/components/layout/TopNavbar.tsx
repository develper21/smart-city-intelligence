import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Sun,
  Moon,
  Shield,
  Menu,
  Globe,
  LogOut,
  User,
  Settings,
  Radio,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";

interface TopNavbarProps {
  onMenuToggle: () => void;
  onOpenCommandMenu?: () => void;
}

export function TopNavbar({ onMenuToggle, onOpenCommandMenu }: TopNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { unreadCount, setIsDrawerOpen } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("Logged out from operations console");
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-border/70 bg-card/85 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-3 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center glow-primary">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm md:text-base font-bold tracking-tight">
                CIVIC-AI COMMAND
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono">
                METROPOLITAN SURVEILLANCE v2.5
              </p>
            </div>
          </Link>
        </div>

        {/* Center Section - Global Search Trigger */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={onOpenCommandMenu}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-secondary/50 border border-border/70 text-xs text-muted-foreground hover:bg-secondary hover:border-primary/40 transition-all shadow-sm group"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span>Search cameras, alerts, locations, vectors...</span>
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-1 font-mono text-[10px] bg-background/80 px-1.5 py-0.5 rounded border border-border/60">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenCommandMenu}
            className="md:hidden h-9 w-9"
          >
            <Search className="h-4 w-4" />
          </Button>



          {/* Live Status Telemetry */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-emerald-400">AI LIVE</span>
          </div>

          {/* Notifications Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDrawerOpen(true)}
            className="relative h-9 w-9 hover:bg-secondary"
            title="Open Notification Dispatch Drawer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-mono bg-destructive text-destructive-foreground animate-pulse">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 hover:bg-secondary transition-transform hover:rotate-12"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 p-1 rounded-full hover:bg-secondary/60 transition-colors focus:outline-none">
                <Avatar className="h-8 w-8 border border-primary/40">
                  <AvatarImage src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop"} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "OP"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left pr-1">
                  <p className="text-xs font-semibold leading-none">{user?.name || "Operator"}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {user?.badgeId || "CSD-8842"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 glass-card">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-bold leading-none">{user?.name || "Officer"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email || "officer@smartcity.gov"}</p>
                  <div className="pt-1">
                    <Badge variant="outline" className="text-[9px] font-mono text-primary border-primary/30">
                      {user?.clearanceLevel || "Level 2 (Tactical Dispatch)"}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate("/settings")} className="text-xs cursor-pointer">
                <Settings className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <span>Station Settings</span>
              </DropdownMenuItem>



              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout} className="text-xs text-destructive cursor-pointer">
                <LogOut className="h-3.5 w-3.5 mr-2" />
                <span>Log Out Operator Session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
