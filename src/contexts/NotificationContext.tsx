import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { Alert, surveillanceAPI, wsManager, WsMessage } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  riskLevel: Alert["riskLevel"];
  type: Alert["type"];
  location: string;
  cameraId: string;
  read: boolean;
  rawAlert?: Alert;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  selectedAlert: Alert | null;
  setSelectedAlert: (alert: Alert | null) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  triggerSimulatedAlert: () => Promise<void>;
  wsConnected: boolean;
}

function alertToNotification(a: Alert, read = false): NotificationItem {
  return {
    id: `notif-${a.numericId ?? a.id}`,
    title: `${a.type.toUpperCase()} DETECTED`,
    message: a.description,
    timestamp: "Just now",
    riskLevel: a.riskLevel,
    type: a.type,
    location: a.location,
    cameraId: a.cameraId,
    read,
    rawAlert: a,
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);
  const isMountedRef = useRef(true);
  const { isAuthenticated } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* Backend se initial alerts + WebSocket live stream */
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    surveillanceAPI
      .getAlerts({ limit: 15 })
      .then(({ alerts }) => {
        if (!isMounted) return;
        const items = alerts.map((a) =>
          alertToNotification(a, firstLoad.current && a.status !== "active")
        );
        items.forEach((i) => i.rawAlert && seenIds.current.add(i.rawAlert.id));
        firstLoad.current = false;
        setNotifications(items);
      })
      .catch(() => undefined);

    wsManager.connect();
    const off = wsManager.on(handleWs);

    return () => {
      isMounted = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const playSiren = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      /* audio blocked */
    }
  };

  const handleWs = (msg: WsMessage) => {
    if (msg.type === "system_status" && msg.payload?.status === "connected") {
      setWsConnected(true);
      return;
    }
    if (msg.type === "new_alert" && msg.payload?.alert) {
      const alert: Alert = {
        id: msg.payload.alert.event_ref || `ALT-${msg.payload.alert.id}`,
        numericId: msg.payload.alert.id,
        type: msg.payload.alert.event_type || "intrusion",
        location: msg.payload.alert.location || "Unknown",
        cameraId: msg.payload.alert.camera_id || "CAM-001",
        riskLevel: msg.payload.alert.risk_level || "medium",
        timestamp: msg.payload.alert.alert_time || new Date().toISOString(),
        description: msg.payload.alert.message || "Live detection event",
        status: "active",
        confidence: msg.payload.alert.confidence,
      };
      if (seenIds.current.has(alert.id)) return;
      seenIds.current.add(alert.id);

      if (isMountedRef.current) {
        setNotifications((prev) => [alertToNotification(alert), ...prev].slice(0, 50));
      }
      playSiren();
      toast.warning(`${alert.type.toUpperCase()} ALERT — ${alert.riskLevel.toUpperCase()}`, {
        description: `${alert.location} • ${alert.cameraId}`,
        action: { label: "Inspect", onClick: () => setSelectedAlert(alert) },
      });
    }
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      wsManager.disconnect();
    };
  }, []);

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    toast.success("All notifications marked as read");
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast.info("Notifications cleared");
  };

  /* "Simulate Alert" drill — POST /api/alerts ke through, real backend cameras se */
  const triggerSimulatedAlert = async () => {
    try {
      const types = ["intrusion", "violence", "crowd", "traffic", "fire", "unattended"];
      const risks = ["critical", "high", "medium"];
      const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
      const cameras = await surveillanceAPI.getCameras().catch(() => []);
      const cam = cameras.length > 0 ? pick(cameras) : null;
      await surveillanceAPI.raiseAlert({
        event_type: pick(types),
        message: "Manual drill trigger: synthetic event injected from Command Console.",
        camera_id: cam?.id ?? "CAM-001",
        location: cam?.location ?? "Unknown sector",
        risk_level: pick(risks),
      });
      toast.success("Drill alert injected into backend event bus");
    } catch {
      toast.error("Failed to inject drill alert — backend unreachable");
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isDrawerOpen,
        setIsDrawerOpen,
        selectedAlert,
        setSelectedAlert,
        soundEnabled,
        toggleSound,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        triggerSimulatedAlert,
        wsConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
