import { useState, useEffect } from "react";
import { CameraFeedCard } from "@/components/dashboard/CameraFeedCard";
import { CameraStreamModal } from "@/components/dashboard/CameraStreamModal";
import { surveillanceAPI, Camera } from "@/services/api";
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
import {
  Search,
  Grid,
  List,
  Filter,
  Video,
  Cctv,
  Maximize2,
  RefreshCw,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LiveFeeds() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "wall">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCameraForStream, setSelectedCameraForStream] = useState<Camera | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);

  useEffect(() => {
    surveillanceAPI
      .getCameras()
      .then(setCameras)
      .catch(() => toast.error("Backend se cameras fetch nahi hue"));
  }, []);

  const filteredCameras = cameras.filter((camera) => {
    const matchesStatus = statusFilter === "all" || camera.status === statusFilter;
    const matchesZone = zoneFilter === "all" || camera.zone === zoneFilter;
    const matchesSearch =
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesZone && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Live Surveillance Video Wall
            </h1>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
              4K RTSP / WebRTC
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Real-time multi-angle optical feeds with neural anomaly tagging and PTZ actuators.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              surveillanceAPI
                .getCameras()
                .then((cams) => {
                  setCameras(cams);
                  toast.success("Feeds synced from backend");
                })
                .catch(() => toast.error("Backend unreachable"));
            }}
            className="text-xs h-9"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Sync Feeds
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-medium text-emerald-400">
              {filteredCameras.length} Cameras Streaming
            </span>
          </div>
        </div>
      </div>

      {/* Filters and View Mode Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by camera name, ID (e.g. CAM-001), or sector location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-secondary/40 text-xs sm:text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-10 text-xs bg-secondary/40">
              <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="glass-card text-xs">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>

          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger className="w-[130px] h-10 text-xs bg-secondary/40">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent className="glass-card text-xs">
              <SelectItem value="all">All Zones</SelectItem>
              <SelectItem value="Zone A">Zone A (North)</SelectItem>
              <SelectItem value="Zone B">Zone B (Central)</SelectItem>
              <SelectItem value="Zone C">Zone C (Highway)</SelectItem>
              <SelectItem value="Zone D">Zone D (Industrial)</SelectItem>
            </SelectContent>
          </Select>

          {/* Layout Toggle */}
          <div className="flex rounded-xl border border-border/70 overflow-hidden bg-secondary/40 p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 rounded-lg text-xs",
                viewMode === "grid" && "bg-primary text-primary-foreground font-semibold"
              )}
              onClick={() => setViewMode("grid")}
              title="Standard Grid"
            >
              <Grid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 rounded-lg text-xs",
                viewMode === "wall" && "bg-primary text-primary-foreground font-semibold"
              )}
              onClick={() => setViewMode("wall")}
              title="Matrix Wall Mode"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 rounded-lg text-xs",
                viewMode === "list" && "bg-primary text-primary-foreground font-semibold"
              )}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Camera Feeds Content */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCameras.map((camera) => (
            <CameraFeedCard
              key={camera.id}
              camera={camera}
              onExpand={(c) => setSelectedCameraForStream(c)}
            />
          ))}
        </div>
      )}

      {viewMode === "wall" && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredCameras.map((camera) => (
            <div
              key={camera.id}
              onClick={() => setSelectedCameraForStream(camera)}
              className="relative aspect-video rounded-xl overflow-hidden bg-black border border-border/70 group cursor-pointer hover:border-primary/80 transition-all shadow-md"
            >
              <img
                src={camera.thumbnail}
                alt={camera.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 scanlines opacity-20" />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-background/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{camera.id}</span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] bg-background/80 backdrop-blur-md px-2 py-0.5 rounded">
                <span className="truncate font-medium">{camera.name}</span>
                <span className="font-mono text-muted-foreground">{camera.zone}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredCameras.map((camera) => (
            <div
              key={camera.id}
              onClick={() => setSelectedCameraForStream(camera)}
              className="p-3.5 rounded-xl glass-card flex items-center justify-between gap-4 cursor-pointer hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-24 h-16 rounded-lg overflow-hidden bg-black relative shrink-0">
                  <img src={camera.thumbnail} alt={camera.name} className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 block animate-pulse" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground truncate">{camera.name}</h3>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {camera.id}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{camera.location}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-1">
                    Zone: {camera.zone} • Last Ping: {camera.lastUpdated}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={camera.status === "online" ? "default" : "secondary"}
                  className="font-mono text-xs uppercase"
                >
                  {camera.status}
                </Badge>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <Maximize2 className="h-3.5 w-3.5 mr-1" />
                  PTZ Stream
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCameras.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border/70 glass-card">
          <Cctv className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="font-semibold text-sm">No Cameras Match Search Filter</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search keywords, status filter, or sector zone.
          </p>
        </div>
      )}

      {/* Embedded Camera Stream Modal */}
      <CameraStreamModal
        camera={selectedCameraForStream}
        isOpen={!!selectedCameraForStream}
        onClose={() => setSelectedCameraForStream(null)}
      />
    </div>
  );
}
