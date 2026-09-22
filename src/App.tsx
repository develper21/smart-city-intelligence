import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { MainLayout } from "@/components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import LiveFeeds from "./pages/LiveFeeds";
import Alerts from "./pages/Alerts";
import MapPage from "./pages/MapPage";
import Analytics from "./pages/Analytics";
import Incidents from "./pages/Incidents";
import Operators from "./pages/Operators";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner richColors position="top-right" />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/landing" element={<LandingPage />} />

              {/* Authenticated Operations Console */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/live-feeds" element={<LiveFeeds />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/operators" element={<Operators />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
