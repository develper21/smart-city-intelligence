import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (userData: Partial<OperatorUser>) => Promise<boolean>;
  demoLogin: (roleType: "operator" | "supervisor" | "admin") => void;
  logout: () => void;
}

const DEFAULT_OPERATOR: OperatorUser = {
  id: "OP-4091",
  name: "Rajesh Kumar",
  email: "rajesh.k@command.smartcity.gov",
  role: "Operator",
  department: "Central Surveillance Division",
  badgeId: "CSD-8842",
  clearanceLevel: "Level 2 (Tactical Dispatch)",
  zone: "Sector 12 & Central Commercial",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
};

const DEMO_PRESETS: Record<string, OperatorUser> = {
  operator: {
    id: "OP-4091",
    name: "Rajesh Kumar",
    email: "rajesh.k@command.smartcity.gov",
    role: "Operator",
    department: "Urban CCTV Command Unit",
    badgeId: "CSD-8842",
    clearanceLevel: "Level 2 (Tactical Dispatch)",
    zone: "Zone A - North District",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
  },
  supervisor: {
    id: "SUP-1022",
    name: "Sneha Reddy",
    email: "sneha.reddy@command.smartcity.gov",
    role: "Supervisor",
    department: "Emergency Response Bureau",
    badgeId: "ERB-3091",
    clearanceLevel: "Level 3 (Supervisor)",
    zone: "All City Sectors",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop",
  },
  admin: {
    id: "ADM-001",
    name: "Commander Vikram Rathore",
    email: "rathore.v@intel.smartcity.gov",
    role: "System Admin",
    department: "Civil Protection & Cyber Intel",
    badgeId: "INT-0001",
    clearanceLevel: "Top Secret (Commander)",
    zone: "Metropolitan Command Core",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OperatorUser | null>(() => {
    try {
      const stored = localStorage.getItem("civic-ai-user");
      return stored ? JSON.parse(stored) : DEFAULT_OPERATOR;
    } catch {
      return DEFAULT_OPERATOR;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("civic-ai-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("civic-ai-user");
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    const newUser: OperatorUser = {
      ...DEFAULT_OPERATOR,
      email,
      name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    };
    setUser(newUser);
    return true;
  };

  const signup = async (userData: Partial<OperatorUser>): Promise<boolean> => {
    const newUser: OperatorUser = {
      id: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: userData.name || "Authorized Officer",
      email: userData.email || "officer@smartcity.gov",
      role: (userData.role as any) || "Operator",
      department: userData.department || "Municipal Police & Traffic",
      badgeId: userData.badgeId || `SEC-${Math.floor(1000 + Math.random() * 9000)}`,
      clearanceLevel: userData.clearanceLevel || "Level 2 (Tactical Dispatch)",
      zone: userData.zone || "Sector 1 (Metropolitan)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    };
    setUser(newUser);
    return true;
  };

  const demoLogin = (roleType: "operator" | "supervisor" | "admin") => {
    setUser(DEMO_PRESETS[roleType] || DEFAULT_OPERATOR);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        demoLogin,
        logout,
      }}
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
