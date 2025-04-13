
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { MobileNavFixed } from "./mobile-nav-fixed"; // Import the fixed component
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false); // Add state for dialog
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarOpen ? "md:ml-64" : "md:ml-20",
          isMobile ? "mb-16" : "" // Add bottom margin for mobile navigation
        )}
      >
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Navigation with fixed implementation */}
      {isMobile && isAuthenticated && (
        <MobileNavFixed dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
      )}
    </div>
  );
}
