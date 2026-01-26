import { Bell, Search, Sun, Moon, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/badge";

interface TopNavbarProps {
  onMenuToggle: () => void;
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold tracking-tight">
                AI Urban Surveillance
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                CONTROL CENTER v2.0
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cameras, alerts, locations..."
              className="pl-10 bg-secondary/50 border-border/50 focus:bg-secondary"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Live Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
            <span className="recording-dot" />
            <span className="text-xs font-medium text-success">LIVE</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
              7
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-transform hover:rotate-12"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Avatar */}
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium">Operator</p>
              <p className="text-xs text-muted-foreground">Control Room A</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
              <span className="text-sm font-semibold text-primary">OP</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
