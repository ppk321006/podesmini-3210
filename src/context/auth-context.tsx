
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { UserRole, User } from "@/types/user";
import { toast } from "sonner";

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
      // This is just a mock implementation until we connect to Supabase
      // In reality, this would be an API call to validate credentials
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user - replace with actual authentication
      if (username === "admin" && password === "admin") {
        const mockUser: User = {
          id: "1",
          username: "admin",
          role: UserRole.ADMIN,
          name: "Administrator",
        };
        
        setUser(mockUser);
        localStorage.setItem("simonita_user", JSON.stringify(mockUser));
        toast.success("Login berhasil!");
        return;
      }
      
      if (username === "pml" && password === "pml") {
        const mockUser: User = {
          id: "2",
          username: "pml",
          role: UserRole.PML,
          name: "Petugas PML",
        };
        
        setUser(mockUser);
        localStorage.setItem("simonita_user", JSON.stringify(mockUser));
        toast.success("Login berhasil!");
        return;
      }
      
      if (username === "ppl" && password === "ppl") {
        const mockUser: User = {
          id: "3",
          username: "ppl",
          role: UserRole.PPL,
          name: "Petugas PPL",
          pmlId: "2",
        };
        
        setUser(mockUser);
        localStorage.setItem("simonita_user", JSON.stringify(mockUser));
        toast.success("Login berhasil!");
        return;
      }
      
      if (username === "viewer" && password === "viewer") {
        const mockUser: User = {
          id: "4",
          username: "viewer",
          role: UserRole.VIEWER,
          name: "Peninjau",
        };
        
        setUser(mockUser);
        localStorage.setItem("simonita_user", JSON.stringify(mockUser));
        toast.success("Login berhasil!");
        return;
      }
      
      // If none of the above conditions are met, throw an error
      throw new Error("Username atau password salah");
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
