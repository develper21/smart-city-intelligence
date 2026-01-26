import { Camera } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Video, MapPin, Clock, MoreVertical, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CameraFeedCardProps {
  camera: Camera;
  className?: string;
}

export function CameraFeedCard({ camera, className }: CameraFeedCardProps) {
  const statusStyles = {
    online: "bg-success",
    offline: "bg-destructive",
    warning: "bg-warning",
  };

  return (
    <div
      className={cn(
        "glass-card rounded-xl overflow-hidden group transition-all hover:scale-[1.02] animate-fade-in",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={camera.thumbnail}
          alt={camera.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Scanline overlay */}
        <div className="absolute inset-0 scanlines opacity-30" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 camera-overlay" />
        
        {/* Status indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              statusStyles[camera.status],
              camera.status === "online" && "animate-pulse"
            )}
          />
          <span className="text-xs font-mono uppercase tracking-wider text-foreground bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded">
            {camera.status}
          </span>
        </div>

        {/* Recording indicator */}
        {camera.status === "online" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-destructive/80 backdrop-blur-sm px-2 py-0.5 rounded">
            <span className="recording-dot" />
            <span className="text-xs font-medium text-destructive-foreground">REC</span>
          </div>
        )}

        {/* Camera ID */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-mono text-muted-foreground bg-background/60 backdrop-blur-sm px-2 py-1 rounded">
            {camera.id}
          </span>
        </div>

        {/* Expand button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-3 right-3 h-8 w-8 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-sm">{camera.name}</h3>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{camera.location}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Full Screen</DropdownMenuItem>
              <DropdownMenuItem>View Analytics</DropdownMenuItem>
              <DropdownMenuItem>Export Recording</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Report Issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Video className="h-3 w-3" />
            <span className="text-xs">{camera.zone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{camera.lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
