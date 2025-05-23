
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  sessionTimeout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  sessionTimeout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Hard-coded users with valid UUIDs for the application
const DEFAULT_USERS = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    username: "admin",
    password: "admin123",
    name: "Administrator",
    role: "admin"
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    username: "pml",
    password: "pml123",
    name: "Petugas Memeriksa Lapangan",
    role: "pml"
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    username: "ppl",
    password: "ppl123",
    name: "Petugas Pendataan Lapangan",
    role: "ppl",
    pml_id: "00000000-0000-0000-0000-000000000002"
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeoutId, setSessionTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("potensidesa_user");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        startSessionTimeout();
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("potensidesa_user");
      }
    }
    
    setIsLoading(false);

    // Event listeners for resetting the session timeout
    const resetTimeout = () => {
      if (user) {
        startSessionTimeout();
      }
    };

    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keypress', resetTimeout);
    window.addEventListener('click', resetTimeout);

    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
      window.removeEventListener('click', resetTimeout);
      
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
      }
    };
  }, [user]);

  const startSessionTimeout = () => {
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }
    
    // 30 minutes session timeout
    const newTimeoutId = setTimeout(sessionTimeout, 30 * 60 * 1000);
    setSessionTimeoutId(newTimeoutId);
  };

  const sessionTimeout = () => {
    logout();
    toast.info("Sesi anda telah berakhir. Silahkan login kembali.");
    // Instead of using navigate directly, we'll let the App.tsx handle navigation
    // The useEffect in App.tsx that checks auth state will redirect to login
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting login with:", username, password);
      
      // First check hard-coded default users
      const defaultUser = DEFAULT_USERS.find(
        (u) => u.username === username && u.password === password
      );

      if (defaultUser) {
        console.log("Login successful with default user:", defaultUser);
        
        const appUser: User = {
          id: defaultUser.id,
          username: defaultUser.username,
          name: defaultUser.name,
          role: defaultUser.role as UserRole,
          pmlId: defaultUser.pml_id || undefined
        };
        
        setUser(appUser);
        localStorage.setItem("potensidesa_user", JSON.stringify(appUser));
        startSessionTimeout();
        toast.success("Login berhasil!");
        return;
      }

      // If not a default user, check database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
      
      if (error) {
        console.error("Login error:", error);
        throw new Error("Username atau password salah");
      }
      
      if (data) {
        const dbUser = data;
        console.log("Login successful from database, user data:", dbUser);
        
        const appUser: User = {
          id: dbUser.id,
          username: dbUser.username,
          name: dbUser.name,
          role: dbUser.role as UserRole,
          pmlId: dbUser.pml_id || undefined
        };
        
        setUser(appUser);
        localStorage.setItem("potensidesa_user", JSON.stringify(appUser));
        startSessionTimeout();
        toast.success("Login berhasil!");
        return;
      } else {
        throw new Error("Username atau password salah");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError("Terjadi kesalahan saat login");
        toast.error("Terjadi kesalahan saat login");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("potensidesa_user");
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
      setSessionTimeoutId(null);
    }
    toast.info("Berhasil logout");
  };

  // Update the isAuthenticated property
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated,
        sessionTimeout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
