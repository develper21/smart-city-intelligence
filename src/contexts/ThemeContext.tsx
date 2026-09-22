import { createContext, useContext, useEffect, ReactNode } from "react";

/**
 * Light-only theme.
 * Dark theme project se remove ho chuka hai — app hamesha white/light
 * theme me render hoti hai. Toggle ab support nahi hai.
 */
interface ThemeContextType {
  theme: "light";
  setTheme: (theme: "light") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
    localStorage.setItem("surveillance-theme", "light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light", setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
