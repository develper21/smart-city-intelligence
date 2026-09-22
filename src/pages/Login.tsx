import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Radio,
  KeyRound,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState("rajesh.k@command.smartcity.gov");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your official Badge ID or Email");
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      await login(email, password);
      setIsLoading(false);
      toast.success("Authentication Clearance Verified", {
        description: `Welcome back to Tactical Command, ${email.split("@")[0]}.`,
      });
      navigate("/dashboard");
    }, 600);
  };

  const handleDemo = (role: "operator" | "supervisor" | "admin") => {
    demoLogin(role);
    toast.success(`Demo Access Granted as ${role.toUpperCase()}`, {
      description: "Direct authorization bypass enabled for evaluation.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Left Column: Visual & Cyber Grid */}
      <div className="relative hidden md:flex md:w-1/2 bg-secondary/30 flex-col justify-between p-10 border-r border-border/60 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center glow-primary">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">CIVIC-AI INTELLIGENCE</h2>
            <p className="text-xs font-mono text-muted-foreground">
              METROPOLITAN SECURITY DIVISION
            </p>
          </div>
        </div>

        {/* Center Graphic */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <Badge variant="outline" className="border-primary/40 text-primary text-xs">
            SECURE ACCESS GATEWAY
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Centralized Surveillance & Tactical Triage
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Authorized personnel only. All access, camera pan vectors, and incident dispatches
            are permanently logged on cryptographic audit ledgers.
          </p>

          <div className="p-4 rounded-xl glass-card space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>SECURITY CERTIFICATE</span>
              <span className="text-emerald-400">TLS 1.3 // VALID</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>CONNECTED SENSORS</span>
              <span className="text-foreground">247 CAMS ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>CLEARANCE ENFORCEMENT</span>
              <span className="text-primary">FIPS-140-2 LEVEL 3</span>
            </div>
          </div>
        </div>

        {/* Bottom Link to Landing */}
        <div className="relative z-10 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            ← Return to Public Civic Portal
          </Link>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center md:text-left space-y-2">
            <div className="md:hidden flex justify-center mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Operator Sign In
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your official credentials or select a 1-click demo role.
            </p>
          </div>

          {/* 1-Click Demo Profiles */}
          <div className="p-4 rounded-xl bg-secondary/40 border border-border/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Instant Demo Access
              </span>
              <span className="text-[10px] text-primary font-mono">1-CLICK LOGIN</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 flex flex-col items-center justify-center py-1 hover:border-primary/50"
                onClick={() => handleDemo("operator")}
              >
                <span className="font-semibold">Operator</span>
                <span className="text-[9px] text-muted-foreground font-mono">Level 2</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 flex flex-col items-center justify-center py-1 hover:border-primary/50"
                onClick={() => handleDemo("supervisor")}
              >
                <span className="font-semibold">Supervisor</span>
                <span className="text-[9px] text-muted-foreground font-mono">Level 3</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 flex flex-col items-center justify-center py-1 hover:border-primary/50"
                onClick={() => handleDemo("admin")}
              >
                <span className="font-semibold">Commander</span>
                <span className="text-[9px] text-muted-foreground font-mono">Top Secret</span>
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border/60 w-full" />
            <span className="bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
              Or Manual Officer Authentication
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Badge ID / Gov Email
              </label>
              <Input
                type="text"
                placeholder="e.g. CSD-8842 or officer@smartcity.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/30 h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Security Passkey
                </label>
                <span className="text-xs text-primary hover:underline cursor-pointer">
                  Forgot passkey?
                </span>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter encrypted password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/30 h-10 text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground glow-primary font-semibold text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Verifying Cryptographic Credentials...</span>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4" />
                  <span>Authenticate & Enter Console</span>
                </>
              )}
            </Button>
          </form>

          {/* Footer note */}
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>
              Don't have clearance credentials?{" "}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                Request Officer Onboarding
              </Link>
            </p>
            <p className="font-mono text-[10px]">
              IP RECORDED: 192.168.1.104 • ENCRYPTION: SHA-256
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
