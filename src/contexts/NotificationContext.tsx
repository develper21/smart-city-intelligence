import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Alert, mockAlerts } from "@/data/mockData";
import { toast } from "sonner";

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
  triggerSimulatedAlert: () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = mockAlerts.map((alert, idx) => ({
  id: `notif-${alert.id}`,
  title: `${alert.type.toUpperCase()} DETECTED`,
  message: alert.description,
  timestamp: idx === 0 ? "Just now" : `${idx * 4 + 2} min ago`,
  riskLevel: alert.riskLevel,
  type: alert.type,
  location: alert.location,
  cameraId: alert.cameraId,
  read: idx > 2,
  rawAlert: alert,
}));

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
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

  const triggerSimulatedAlert = () => {
    const types: Alert["type"][] = ["intrusion", "violence", "fire", "crowd", "traffic"];
    const risks: Alert["riskLevel"][] = ["critical", "high", "medium"];
    const locations = [
      "Sector 14 - Metro Station Gate 2",
      "City Center Mall - Main Plaza",
      "Express Highway Flyover Km 12",
      "North Industrial Warehouse 3B",
      "Central Park - Amphitheater",
    ];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomRisk = risks[Math.floor(Math.random() * risks.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const id = `ALT-${Math.floor(100 + Math.random() * 900)}`;

    const newRawAlert: Alert = {
      id,
      type: randomType,
      location: randomLocation,
      cameraId: `CAM-00${Math.floor(1 + Math.random() * 6)}`,
      riskLevel: randomRisk,
      timestamp: new Date().toISOString(),
      description: `Automated AI trigger: ${randomType} event flagged with high confidence.`,
      status: "active",
    };

    const newNotif: NotificationItem = {
      id: `notif-${id}`,
      title: `${randomType.toUpperCase()} ALERT`,
      message: newRawAlert.description,
      timestamp: "Just now",
      riskLevel: randomRisk,
      type: randomType,
      location: randomLocation,
      cameraId: newRawAlert.cameraId,
      read: false,
      rawAlert: newRawAlert,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    toast.warning(`High Risk Alert: ${randomType.toUpperCase()} detected`, {
      description: `${randomLocation} — ${newRawAlert.cameraId}`,
      action: {
        label: "Inspect",
        onClick: () => {
          setSelectedAlert(newRawAlert);
        },
      },
    });
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
