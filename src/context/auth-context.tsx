
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/types/supabase-db";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for user session
    const storedUser = localStorage.getItem("simonita_user");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("simonita_user");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Query the users table for the given username and password
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
      
      if (error) {
        throw new Error("Username atau password salah");
      }
      
      if (data) {
        const dbUser = data as Database['public']['Tables']['users']['Row'];
        
        // Convert database user to our User type
        const appUser: User = {
          id: dbUser.id,
          username: dbUser.username,
          name: dbUser.name,
          role: dbUser.role as UserRole,
          pmlId: dbUser.pml_id || undefined
        };
        
        setUser(appUser);
        localStorage.setItem("simonita_user", JSON.stringify(appUser));
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("simonita_user");
    toast.info("Berhasil logout");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
