import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Lock,
  Mail,
  User,
  BadgeCheck,
  Building,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [department, setDepartment] = useState("Urban CCTV Command Unit");
  const [clearanceLevel, setClearanceLevel] = useState("Level 2 (Tactical Dispatch)");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Please fill in all officer credentials");
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      await signup({
        name,
        email,
        badgeId: badgeId || `SEC-${Math.floor(1000 + Math.random() * 9000)}`,
        department,
        clearanceLevel: clearanceLevel as any,
        role: "Operator",
      });
      setIsLoading(false);
      toast.success("Officer Clearance Profile Provisioned", {
        description: `Terminal initialized with clearance ${clearanceLevel}.`,
      });
      navigate("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 glow-primary mb-2">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Officer Onboarding & Registration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Register an authorized personnel terminal with municipal clearance.
          </p>
        </div>

        {/* Card Form */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-border/80 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Officer Name
                </label>
                <Input
                  placeholder="e.g. Vikram Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/30 h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  Badge / Personnel ID
                </label>
                <Input
                  placeholder="e.g. CSD-9921"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="bg-secondary/30 h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Government / Municipal Email
              </label>
              <Input
                type="email"
                placeholder="officer@smartcity.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/30 h-10 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-muted-foreground" />
                  Department Bureau
                </label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="bg-secondary/30 h-10 text-xs">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urban CCTV Command Unit">Urban CCTV Command</SelectItem>
                    <SelectItem value="Metropolitan Traffic Authority">Traffic Authority</SelectItem>
                    <SelectItem value="Emergency Response Bureau">Emergency Bureau</SelectItem>
                    <SelectItem value="Civil Protection Division">Civil Protection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                  Clearance Requested
                </label>
                <Select value={clearanceLevel} onValueChange={setClearanceLevel}>
                  <SelectTrigger className="bg-secondary/30 h-10 text-xs">
                    <SelectValue placeholder="Clearance Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Level 1 (Monitoring)">Level 1 (Monitoring)</SelectItem>
                    <SelectItem value="Level 2 (Tactical Dispatch)">Level 2 (Tactical Dispatch)</SelectItem>
                    <SelectItem value="Level 3 (Supervisor)">Level 3 (Supervisor)</SelectItem>
                    <SelectItem value="Top Secret (Commander)">Top Secret (Commander)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                Terminal Access Passkey
              </label>
              <Input
                type="password"
                placeholder="Choose strong security passkey"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/30 h-10 text-sm"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground glow-primary font-semibold text-sm mt-2"
            >
              {isLoading ? "Provisioning Security Credentials..." : "Submit Clearance Registration"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/50 text-center text-xs text-muted-foreground">
            Already provisioned with officer credentials?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Operator Sign In
            </Link>
          </div>
        </div>

        <p className="text-center text-[10px] font-mono text-muted-foreground">
          COMPLIANT WITH CJIS / GDPR / DIGITAL CITIZEN PRIVACY CODES
        </p>
      </div>
    </div>
  );
}
