import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types/user";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string, name: string, role: UserRole, pml_id?: string | null) => Promise<void>;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();

        if (supabaseUser) {
          // Fetch the user's profile from the 'users' table
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          if (profileData) {
            setUser({
              id: profileData.id,
              name: profileData.name,
              username: profileData.username,
              role: profileData.role,
              pml_id: profileData.pml_id || null,
              created_at: profileData.created_at
            });
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error: any) {
        console.error("Authentication error:", error.message);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        throw error;
      }

      // Fetch the user's profile from the 'users' table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (profileData) {
        setUser({
          id: profileData.id,
          name: profileData.name,
          username: profileData.username,
          role: profileData.role,
          pml_id: profileData.pml_id || null,
          created_at: profileData.created_at
        });
        setIsAuthenticated(true);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        setIsAuthenticated(false);
        setUser(null);
        toast.error("Failed to retrieve user profile.");
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      setIsAuthenticated(false);
      setUser(null);
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const mockLogin = (username: string, password: string) => {
    setIsLoading(true);
    
    // Mock user data (replace with your actual data source)
    const mockUsers = [
      { id: '1', username: 'admin@example.com', password: 'password', name: 'Admin User', role: UserRole.ADMIN, pml_id: null, created_at: new Date().toISOString() },
      { id: '2', username: 'pml@example.com', password: 'password', name: 'PML User', role: UserRole.PML, pml_id: null, created_at: new Date().toISOString() },
      { id: '3', username: 'ppl@example.com', password: 'password', name: 'PPL User', role: UserRole.PPL, pml_id: null, created_at: new Date().toISOString() },
      { id: '4', username: 'viewer@example.com', password: 'password', name: 'Viewer User', role: UserRole.VIEWER, pml_id: null, created_at: new Date().toISOString() }
    ];
    
    const userData = mockUsers.find(u => u.username === username && u.password === password);
    
    if (userData) {
      const user = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        role: userData.role,
        pml_id: userData.pml_id,
        created_at: userData.created_at
      };
      setUser(user);
      setIsAuthenticated(true);
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      setIsAuthenticated(false);
      setUser(null);
      toast.error("Invalid credentials. Please try again.");
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Logout successful!");
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, name: string, role: UserRole, pml_id?: string | null) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: username,
        password: password,
      });

      if (error) {
        throw error;
      }

      // After successful signup, create a user profile in the 'users' table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          username: username,
          name: name,
          role: role,
          pml_id: pml_id || null,
        });

      if (profileError) {
        throw profileError;
      }

      setIsAuthenticated(false);
      setUser(null);
      toast.success("Registration successful! Please verify your email.");
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error.message);
      setIsAuthenticated(false);
      setUser(null);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const setMockUser = (userData: any) => {
    const user = {
      id: userData.id,
      name: userData.name,
      username: userData.username,
      role: userData.role,
      pml_id: userData.pml_id,
      created_at: userData.created_at
    };
    setUser(user);
    setIsAuthenticated(true);
  };

  const updateUser = (userData: any) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData,
    }));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
