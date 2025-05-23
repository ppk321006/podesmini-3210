
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      
      root.classList.add(systemTheme);
      
      // Apply custom color scheme
      if (systemTheme === "dark") {
        root.style.setProperty('--primary', '30 95% 55%'); // Orange
        root.style.setProperty('--secondary', '215 14% 34%'); // Dark gray
      } else {
        root.style.setProperty('--primary', '30 95% 55%'); // Orange
        root.style.setProperty('--secondary', '215 14% 34%'); // Dark gray
      }
      
      return;
    }
    
    root.classList.add(theme);
    
    // Apply custom color scheme based on theme
    if (theme === "dark") {
      root.style.setProperty('--primary', '30 95% 55%'); // Orange
      root.style.setProperty('--secondary', '215 14% 34%'); // Dark gray
    } else {
      root.style.setProperty('--primary', '30 95% 55%'); // Orange
      root.style.setProperty('--secondary', '215 14% 34%'); // Dark gray
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
};
