import { useState } from "react";
import { Camera } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Video, MapPin, Clock, MoreVertical, Maximize2, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CameraStreamModal } from "./CameraStreamModal";
import { toast } from "sonner";

interface CameraFeedCardProps {
  camera: Camera;
  className?: string;
  onExpand?: (camera: Camera) => void;
}

export function CameraFeedCard({ camera, className, onExpand }: CameraFeedCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const statusStyles = {
    online: "bg-emerald-500",
    offline: "bg-destructive",
    warning: "bg-warning",
  };

  const handleOpenStream = () => {
    if (onExpand) {
      onExpand(camera);
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleOpenStream}
        className={cn(
          "glass-card rounded-xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 cursor-pointer shadow-md",
          className
        )}
      >
        {/* Thumbnail View */}
        <div className="relative aspect-video overflow-hidden bg-black">
          <img
            src={
              camera.thumbnail ||
              "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=250&fit=crop"
            }
            alt={camera.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Scanline overlay */}
          <div className="absolute inset-0 scanlines opacity-25" />

          {/* Camera gradient overlay */}
          <div className="absolute inset-0 camera-overlay" />

          {/* Status indicator */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                statusStyles[camera.status] || "bg-muted",
                camera.status === "online" && "animate-pulse"
              )}
            />
            <span className="text-[10px] font-mono uppercase tracking-wider text-foreground bg-background/70 backdrop-blur-md px-2 py-0.5 rounded border border-border/50">
              {camera.status}
            </span>
          </div>

          {/* Recording indicator */}
          {camera.status === "online" && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-destructive/80 backdrop-blur-md px-2 py-0.5 rounded text-destructive-foreground">
              <span className="recording-dot" />
              <span className="text-[10px] font-mono font-bold">REC</span>
            </div>
          )}

          {/* Camera ID */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[10px] font-mono text-muted-foreground bg-background/80 backdrop-blur-md px-2 py-0.5 rounded border border-border/40">
              {camera.id}
            </span>
          </div>

          {/* Hover Expand Action Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenStream();
            }}
            className="absolute bottom-2.5 right-2.5 h-7 w-7 bg-background/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all text-primary hover:bg-background"
            title="Open HD Video Feed & PTZ"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Camera Information Footer */}
        <div className="p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <h3 className="font-bold text-xs sm:text-sm truncate text-foreground group-hover:text-primary transition-colors">
                {camera.name}
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs truncate">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                <span className="truncate">{camera.location}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card text-xs">
                <DropdownMenuItem onClick={handleOpenStream} className="cursor-pointer">
                  Open Stream & PTZ
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Exporting 24hr log for ${camera.id}`);
                  }}
                  className="cursor-pointer"
                >
                  Export Telemetry Log
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.error(`Sensor health ticket generated for ${camera.id}`);
                  }}
                  className="text-destructive cursor-pointer"
                >
                  Report Optical Fault
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50 text-[11px] text-muted-foreground font-mono">
            <div className="flex items-center gap-1">
              <Video className="h-3 w-3 text-primary" />
              <span>{camera.zone || "Zone A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{camera.lastUpdated || "Live"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Stream Modal */}
      <CameraStreamModal
        camera={camera}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
