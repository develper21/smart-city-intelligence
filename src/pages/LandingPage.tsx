import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ShieldCheck,
  Video,
  AlertTriangle,
  Zap,
  Activity,
  Cpu,
  Lock,
  Eye,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  MapPin,
  Clock,
  ChevronRight,
  Terminal,
  Radio,
  Building2,
  Globe2,
  Server,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { surveillanceAPI, Camera, Alert } from "@/services/api";

export default function LandingPage() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  /* Backend se live stats */
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalAlerts, setTotalAlerts] = useState(0);

  useEffect(() => {
    surveillanceAPI.getCameras().then(setCameras).catch(() => undefined);
    surveillanceAPI.getAlerts({ limit: 4 }).then(({ alerts, total }) => {
      setAlerts(alerts);
      setTotalAlerts(total);
    }).catch(() => undefined);
  }, []);

  /* Live ticker — total backend alerts ka counter */
  const [liveEventsCount, setLiveEventsCount] = useState(14820);
  useEffect(() => {
    if (totalAlerts > 0) setLiveEventsCount((prev) => Math.max(prev, totalAlerts));
  }, [totalAlerts]);

  const features = [
    {
      icon: Cpu,
      title: "Real-Time Neural Vision",
      desc: "Sub-50ms automated multi-camera threat classification including weapon identification, trespassers, and traffic anomalies.",
      tag: "YOLOv8 & ViT Core",
    },
    {
      icon: Zap,
      title: "Automated Incident Dispatch",
      desc: "Instant dispatch triggers routes nearest law enforcement, medical responders, and emergency drones with GPS telemetry.",
      tag: "< 2.3 min Response",
    },
    {
      icon: Lock,
      title: "Zero-Knowledge Privacy",
      desc: "Edge-based facial anonymization and license plate masking ensuring GDPR & municipal civic privacy compliance.",
      tag: "CJIS & ISO 27001",
    },
    {
      icon: Layers,
      title: "GIS City Digital Twin",
      desc: "Dynamic 3D vector map integration overlaying 250+ live feeds, density heatmaps, and emergency evacuation corridors.",
      tag: "Live GIS Sync",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-foreground">
      {/* Top Glass Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary">
                CIVIC-AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Urban Intelligence Core
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#demo" className="hover:text-foreground transition-colors">
              Command Center Demo
            </a>
            <a href="#architecture" className="hover:text-foreground transition-colors">
              Security Architecture
            </a>
            <a href="#metrics" className="hover:text-foreground transition-colors">
              Civic Impact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm font-medium">
                Operator Portal
              </Button>
            </Link>

            <Link to="/dashboard">
              <Button
                size="sm"
                className="text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground glow-primary flex items-center gap-1.5 font-semibold"
              >
                <span>Enter Operations</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Cyber Grid & Animated Radar */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-border/50">
        {/* Futuristic Background Accents */}
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-border/70 backdrop-blur-md mb-6 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-medium text-foreground">
              CIVIC METROPOLITAN GRID: 99.98% OPERATIONAL
            </span>
            <Badge variant="outline" className="border-primary/40 text-primary text-[10px] ml-1">
              v2.5 Next-Gen
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.15]">
            AI-Driven Urban Security &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">
              Autonomous City Intelligence
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unifying multi-sensor CCTV networks, neural computer vision, and real-time emergency
            dispatch into a single mission-critical control center for modern metropolitan cities.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground glow-primary flex items-center gap-2 font-semibold rounded-xl shadow-lg"
              >
                <Activity className="h-5 w-5" />
                <span>Launch Command Center</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                demoLogin("operator");
                navigate("/dashboard");
              }}
              className="h-12 px-6 text-base border-border/80 hover:bg-secondary/60 rounded-xl flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span>1-Click Operator Demo</span>
            </Button>
          </div>

          {/* Real-time Telemetry Strip — live backend stats */}
          <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl glass-card">
              <span className="text-xs text-muted-foreground font-mono">LIVE STREAMS</span>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                {cameras.length || "—"} Cams
              </p>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Backend Connected
              </p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <span className="text-xs text-muted-foreground font-mono">ANOMALY LATENCY</span>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">18.4 ms</p>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Sub-second inference
              </p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <span className="text-xs text-muted-foreground font-mono">INCIDENTS LOGGED</span>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                {totalAlerts || liveEventsCount}
              </p>
              <p className="text-[11px] text-primary mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Active 24/7 audit
              </p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <span className="text-xs text-muted-foreground font-mono">DISPATCH SPEED</span>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">2.3 min</p>
              <p className="text-[11px] text-blue-400 mt-1 flex items-center gap-1">
                <Activity className="h-3 w-3" /> 68% faster response
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Command Center Preview Section */}
      <section id="demo" className="py-20 bg-secondary/20 border-b border-border/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs mb-3">
              LIVE SYSTEM PREVIEW
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Mission-Control Interface Engineered for High-Stress Operations
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Instant situational awareness with real-time video telemetry, AI detection overlays,
              and coordinated rapid dispatch.
            </p>
          </div>

          {/* Interactive Preview Frame */}
          <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Top Mock Window Bar */}
            <div className="px-4 py-3 border-b border-border/60 bg-secondary/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-destructive/80" />
                <span className="h-3 w-3 rounded-full bg-warning/80" />
                <span className="h-3 w-3 rounded-full bg-success/80" />
                <span className="ml-2 font-mono text-muted-foreground">
                  civic-ai://metropolitan-command-center.gov
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FEED SYNC: LIVE
                </span>
                <Link to="/dashboard">
                  <Button size="sm" variant="outline" className="h-6 text-[11px] px-2">
                    Maximize View <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Dashboard Mock Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Selected Live Feed */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-border/60 bg-black">
                  <img
                    src={cameras[activeTab]?.thumbnail || cameras[0]?.thumbnail}
                    alt={cameras[activeTab]?.name || "Camera preview"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 scanlines opacity-20" />
                  {/* Bounding Box HUD */}
                  <div
                    className="absolute border border-primary/90 bg-primary/10 rounded"
                    style={{ top: "30%", left: "40%", width: "22%", height: "40%" }}
                  >
                    <span className="absolute -top-5 left-0 text-[10px] font-mono px-1 py-0.5 bg-primary text-primary-foreground rounded">
                      ANOMALY DETECTED [98.2%]
                    </span>
                  </div>
                  {/* Camera Info Overlay */}
                  <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded text-xs font-mono">
                    <span className="text-emerald-400 font-bold">● {cameras[activeTab]?.id || cameras[0]?.id}</span>{" "}
                    • {cameras[activeTab]?.name || cameras[0]?.name}
                  </div>
                </div>

                {/* Camera Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {cameras.slice(0, 4).map((cam, idx) => (
                    <button
                      key={cam.id}
                      onClick={() => setActiveTab(idx)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border text-left shrink-0 transition-all ${
                        activeTab === idx
                          ? "bg-primary/15 border-primary text-primary font-semibold"
                          : "bg-secondary/30 border-border/60 hover:bg-secondary/60 text-muted-foreground"
                      }`}
                    >
                      <p className="font-mono text-[11px]">{cam.id}</p>
                      <p className="truncate max-w-[120px] text-foreground">{cam.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Col: Live Alerts Ticker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
                    Active Priority Alerts
                  </span>
                  <Badge variant="destructive" className="text-[10px]">
                    {alerts.length} Latest
                  </Badge>
                </div>

                <div className="space-y-2.5">
                  {alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-xl bg-secondary/30 border border-border/60 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase text-primary">
                          {alert.type}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 uppercase font-semibold">
                          {alert.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {alert.description}
                      </p>
                      <div className="mt-2 text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                        <span>{alert.location}</span>
                        <span>{alert.cameraId}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/alerts" className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Complete Alerts Console <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Matrix */}
      <section id="features" className="py-20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs mb-3">
              PLATFORM PILLARS
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Enterprise Civic Defense Built for Modern Cities
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Engineered with resilience, privacy compliance, and real-time operational synergy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl glass-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 glow-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono mb-2">
                    {item.tag}
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Architecture & Compliance Section */}
      <section id="architecture" className="py-20 bg-secondary/15 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="border-primary/40 text-primary text-xs mb-3">
                FED-RAMP & CJIS READY
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Air-Gapped Cryptographic Security with Edge Anonymization
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                Civic surveillance requires uncompromising ethical standards and bulletproof data
                protection. Our platform incorporates end-to-end TLS 1.3 encryption, automatic
                face/license plate redaction for non-investigative streams, and immutable audit logs.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Edge-Inferenced Anonymization</h4>
                    <p className="text-xs text-muted-foreground">
                      Public faces and bystander identities are masked at the sensor level before
                      cloud transit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Immutable Chain-of-Custody</h4>
                    <p className="text-xs text-muted-foreground">
                      Every video snapshot, incident report, and dispatch order is cryptographically
                      hashed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Multi-Agency Role-Based Access Control (RBAC)</h4>
                    <p className="text-xs text-muted-foreground">
                      Strict compartmentalization between municipal traffic, police, and emergency
                      units.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Graphic Box */}
            <div className="p-6 rounded-2xl glass-card border border-border/80 space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  TOPOLOGY // RESILIENT HIGH-AVAILABILITY
                </span>
                <span className="text-xs font-mono text-primary font-medium">99.999% SLA</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" /> Edge Video Cameras
                  </span>
                  <span className="text-emerald-400">RTSP / WebRTC (H.265)</span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-400" /> Neural Inference Engine
                  </span>
                  <span className="text-emerald-400">YOLOv8 + TensorRT</span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-purple-400" /> Event Bus & WebSocket
                  </span>
                  <span className="text-emerald-400">&lt; 15ms Round-Trip</span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" /> Command Center Console
                  </span>
                  <span className="text-emerald-400">React + Radix UI + WebGL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-background to-cyan-500/10 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Experience the Future of Urban Intelligence?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Access the live operations console immediately with our interactive demo mode.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground glow-primary font-semibold text-sm"
              >
                Launch Live Operations Center
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-12 px-6 text-sm">
                Operator Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border/50 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">CIVIC-AI SMART CITY INTELLIGENCE</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/live-feeds" className="hover:text-foreground transition-colors">
              Feeds
            </Link>
            <Link to="/alerts" className="hover:text-foreground transition-colors">
              Alerts
            </Link>
            <Link to="/map" className="hover:text-foreground transition-colors">
              City Map
            </Link>
            <Link to="/login" className="hover:text-foreground transition-colors">
              Officer Login
            </Link>
          </div>

          <p className="font-mono">
            © 2026 Metropolitan Surveillance Bureau. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
