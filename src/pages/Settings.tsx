import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Shield,
  Bell,
  Monitor,
  Lock,
  Database,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { surveillanceAPI } from "@/services/api";
import { toast } from "sonner";

interface SystemSettings {
  auto_refresh: boolean;
  telemetry_interval_s: number;
  notifications: { desktop: boolean; siren_volume: number; email_relay: boolean; sms_relay: boolean };
  privacy: { face_anonymization: boolean; plate_masking: boolean; retention_days: number };
  ai: { model: string; confidence_threshold: number; crowd_proximity_px: number; simulation_enabled: boolean };
}

const DEFAULTS: SystemSettings = {
  auto_refresh: true,
  telemetry_interval_s: 15,
  notifications: { desktop: true, siren_volume: 0.8, email_relay: true, sms_relay: false },
  privacy: { face_anonymization: true, plate_masking: true, retention_days: 60 },
  ai: { model: "yolov8n.pt", confidence_threshold: 0.45, crowd_proximity_px: 120, simulation_enabled: true },
};

const Settings = () => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULTS);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- backend metrics envelope is untyped */
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    surveillanceAPI
      .getSettings()
      .then((s) => setSettings({ ...DEFAULTS, ...s }))
      .catch(() => toast.error("Backend se settings load nahi hui"));
    surveillanceAPI
      .getSystemStatus()
      .then(setSystemStatus)
      .catch(() => undefined);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await surveillanceAPI.updateSettings(settings);
      setSettings({ ...DEFAULTS, ...updated });
      toast.success("Settings backend par save ho gayi", {
        description: "Sab connected operators ke liye live apply.",
      });
    } catch {
      toast.error("Save failed", { description: "Admin clearance required ya backend offline." });
    } finally {
      setIsSaving(false);
    }
  };

  const set = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure your surveillance dashboard preferences — persisted on the backend
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Display & Telemetry</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Refresh</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh camera feeds
                  </p>
                </div>
                <Switch
                  checked={settings.auto_refresh}
                  onCheckedChange={(v) => set("auto_refresh", v)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Telemetry Polling Interval</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.telemetry_interval_s} seconds
                  </span>
                </div>
                <Slider
                  value={[settings.telemetry_interval_s]}
                  onValueChange={(v) => set("telemetry_interval_s", v[0])}
                  min={5}
                  max={60}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Alert Notifications</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for new incidents
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.desktop}
                  onCheckedChange={(v) => set("notifications", { ...settings.notifications, desktop: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Relay</Label>
                  <p className="text-sm text-muted-foreground">
                    Critical incidents ko email par bhejein
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email_relay}
                  onCheckedChange={(v) => set("notifications", { ...settings.notifications, email_relay: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Relay</Label>
                  <p className="text-sm text-muted-foreground">
                    High/critical alerts SMS par bhejein
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.sms_relay}
                  onCheckedChange={(v) => set("notifications", { ...settings.notifications, sms_relay: v })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Siren Volume</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.notifications.siren_volume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.notifications.siren_volume]}
                  onValueChange={(v) =>
                    set("notifications", { ...settings.notifications, siren_volume: v[0] })
                  }
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="mt-6 space-y-6">
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Privacy Controls</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Face Anonymization</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically blur faces in video feeds
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.face_anonymization}
                  onCheckedChange={(v) => set("privacy", { ...settings.privacy, face_anonymization: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>License Plate Masking</Label>
                  <p className="text-sm text-muted-foreground">
                    Vehicle plates mask karein compliance ke liye
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.plate_masking}
                  onCheckedChange={(v) => set("privacy", { ...settings.privacy, plate_masking: v })}
                />
              </div>

              <div>
                <Label>Data Retention Policy</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Archived footage auto-purge window
                </p>
                <Select
                  value={String(settings.privacy.retention_days)}
                  onValueChange={(v) =>
                    set("privacy", { ...settings.privacy, retention_days: Number(v) })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Access Control</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure who can access surveillance data and controls.
              Contact your system administrator for changes.
            </p>
            <Button variant="outline" disabled>
              Manage Access (Admin Only)
            </Button>
          </div>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="mt-6 space-y-6">
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Model Configuration</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>YOLOv8 Model Weights</Label>
                <Select
                  value={settings.ai.model}
                  onValueChange={(v) => set("ai", { ...settings.ai, model: v })}
                >
                  <SelectTrigger className="mt-2 w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yolov8n.pt">yolov8n.pt (Nano — Fast)</SelectItem>
                    <SelectItem value="yolov8s.pt">yolov8s.pt (Small — Balanced)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Detection Confidence Threshold</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.ai.confidence_threshold.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[settings.ai.confidence_threshold]}
                  onValueChange={(v) => set("ai", { ...settings.ai, confidence_threshold: v[0] })}
                  min={0.25}
                  max={0.95}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Crowd Proximity Threshold (px)</Label>
                  <span className="text-sm text-muted-foreground">{settings.ai.crowd_proximity_px}px</span>
                </div>
                <Slider
                  value={[settings.ai.crowd_proximity_px]}
                  onValueChange={(v) => set("ai", { ...settings.ai, crowd_proximity_px: v[0] })}
                  min={40}
                  max={300}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>AI Alert Simulation</Label>
                  <p className="text-sm text-muted-foreground">
                    Backend synthetic detection engine
                  </p>
                </div>
                <Switch
                  checked={settings.ai.simulation_enabled}
                  onCheckedChange={(v) => set("ai", { ...settings.ai, simulation_enabled: v })}
                />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-3 text-sm">
            <h3 className="font-semibold">Backend System Status</h3>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Status</span>
              <span className="font-mono">{systemStatus?.status || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Connected Cameras</span>
              <span className="font-mono">{systemStatus?.cameras?.total ?? "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Active Streams</span>
              <span className="font-mono">{systemStatus?.metrics?.active_streams ?? 0}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-mono">{Math.floor((systemStatus?.metrics?.uptime_seconds ?? 0) / 60)} min</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="glow-primary">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving to Backend..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
