
import { LoginForm } from "@/components/auth/login-form";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // If user is already authenticated via our context
        if (isAuthenticated) {
          navigate('/');
          return;
        }
        
        // Check Supabase session as a backup
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          // User is already logged in, redirect to dashboard
          navigate('/');
        }
      } catch (error) {
        console.error("Error checking session:", error);
        toast.error("Terjadi kesalahan saat memeriksa sesi");
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate, isAuthenticated]);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-white">
      <LoginForm />
    </div>
  );
}
