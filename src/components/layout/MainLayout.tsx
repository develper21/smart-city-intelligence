import { useState } from "react";
import { Outlet } from "react-router-dom";
import { TopNavbar } from "./TopNavbar";
import { Sidebar } from "./Sidebar";
import { PrivacyBanner } from "@/components/common/PrivacyBanner";
import { NotificationDrawer } from "./NotificationDrawer";
import { CommandMenu } from "@/components/dashboard/CommandMenu";
import { AlertDetailsModal } from "@/components/dashboard/AlertDetailsModal";
import { CameraStreamModal } from "@/components/dashboard/CameraStreamModal";
import { useNotifications } from "@/contexts/NotificationContext";
import { Alert, Camera } from "@/data/mockData";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  const { selectedAlert, setSelectedAlert } = useNotifications();
  const [inspectedCamera, setInspectedCamera] = useState<Camera | null>(null);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onOpenCommandMenu={() => setCommandMenuOpen(true)}
        />
        <PrivacyBanner />

        <main className="flex-1 p-3 sm:p-5 md:p-6 overflow-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Global Notification Drawer */}
      <NotificationDrawer
        onInspectAlert={(alert) => {
          setSelectedAlert(alert);
        }}
      />

      {/* Global Command Palette */}
      <CommandMenu
        open={commandMenuOpen}
        onOpenChange={setCommandMenuOpen}
        onSelectAlert={(alert) => setSelectedAlert(alert)}
        onSelectCamera={(camera) => setInspectedCamera(camera)}
      />

      {/* Global Alert Details Modal */}
      <AlertDetailsModal
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />

      {/* Global Camera Stream Modal */}
      <CameraStreamModal
        camera={inspectedCamera}
        isOpen={!!inspectedCamera}
        onClose={() => setInspectedCamera(null)}
      />
    </div>
  );
}
