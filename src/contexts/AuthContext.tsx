import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { surveillanceAPI, BackendUser, clearTokens, getAccessToken } from "@/services/api";

export interface OperatorUser {
  id: string;
  name: string;
  email: string;
  role: "Operator" | "Supervisor" | "System Admin" | "Field Responder";
  department: string;
  badgeId: string;
  clearanceLevel: "Level 1 (Monitoring)" | "Level 2 (Tactical Dispatch)" | "Level 3 (Supervisor)" | "Top Secret (Commander)";
  zone: string;
  avatar: string;
}

interface AuthContextType {
  user: OperatorUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (identifier: string, password?: string) => Promise<boolean>;
  signup: (userData: Partial<OperatorUser> & { password?: string; username?: string }) => Promise<boolean>;
  demoLogin: (roleType: "operator" | "supervisor" | "admin") => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLEARANCE_BY_ROLE: Record<string, OperatorUser["clearanceLevel"]> = {
  admin: "Top Secret (Commander)",
  supervisor: "Level 3 (Supervisor)",
  operator: "Level 2 (Tactical Dispatch)",
};

function toOperatorUser(u: BackendUser): OperatorUser {
  const roleLabel =
    u.role === "admin" ? "System Admin" : u.role === "supervisor" ? "Supervisor" : "Operator";
  return {
    id: String(u.id),
    name: u.name || u.username,
    email: u.email,
    role: roleLabel as OperatorUser["role"],
    department: u.department || "Central Surveillance Division",
    badgeId: u.badge || u.username.toUpperCase(),
    clearanceLevel: CLEARANCE_BY_ROLE[u.role] || "Level 1 (Monitoring)",
    zone: u.zone || "All City Sectors",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OperatorUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  /* Page load par stored access token se session restore karo */
  useEffect(() => {
    let isMounted = true;
    const restore = async () => {
      if (!getAccessToken()) {
        setIsInitializing(false);
        return;
      }
      try {
        const me = await surveillanceAPI.getMe();
        if (isMounted) setUser(toOperatorUser(me));
      } catch {
        clearTokens();
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };
    restore();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier: string, password = ""): Promise<boolean> => {
    if (!password) return false;
    try {
      const payload = await surveillanceAPI.login(identifier, password);
      setUser(toOperatorUser(payload.user));
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (
    userData: Partial<OperatorUser> & { password?: string; username?: string }
  ): Promise<boolean> => {
    if (!userData.email || !userData.password) return false;
    try {
      const username =
        userData.username ||
        userData.email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "") ||
        `officer${Date.now()}`;
      await surveillanceAPI.register({
        username,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        badge: userData.badgeId,
        department: userData.department,
        zone: userData.zone,
        role: "operator",
      });
      /* Auto-login after successful provisioning */
      return await login(userData.email, userData.password);
    } catch {
      return false;
    }
  };

  const demoLogin = async (roleType: "operator" | "supervisor" | "admin"): Promise<boolean> => {
    const creds = {
      operator: "rajesh.k@command.smartcity.gov|operator123",
      supervisor: "sneha.reddy@command.smartcity.gov|supervisor123",
      admin: "rathore.v@intel.smartcity.gov|admin123",
    }[roleType];
    const [identifier, password] = creds.split("|");
    return login(identifier, password);
  };

  const logout = () => {
    surveillanceAPI.logout().finally(() => setUser(null));
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isInitializing, login, signup, demoLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
