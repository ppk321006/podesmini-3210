
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, FileText, User, 
  CheckCircle, BarChart2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { 
  Dialog, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { UserRole } from "@/types/user";

interface MobileNavProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MobileNavFixed({ dialogOpen, setDialogOpen }: MobileNavProps) {
  const location = useLocation();
  const { user } = useAuth();

  // Check if a path is active, handling nested paths
  const isActive = (href: string) => {
    if (href === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === href || (href !== '/dashboard' && location.pathname.startsWith(href));
  };

  // Navigation items based on user role
  const navItems = React.useMemo(() => {
    // Default items
    const items = [];
    
    // Add role-specific navigation items
    if (user?.role === UserRole.ADMIN) {
      items.push(
        { title: "Dashboard", icon: <Home className="h-5 w-5" />, href: "/dashboard" },
        { title: "Petugas", icon: <User className="h-5 w-5" />, href: "/petugas" },
        { title: "Progress", icon: <BarChart2 className="h-5 w-5" />, href: "/progress-ubinan" },
        { title: "Profil", icon: <User className="h-5 w-5" />, href: "/profil" }
      );
    } else if (user?.role === UserRole.PML) {
      // For PML: Progress, Verification, Profile
      items.push(
        { title: "Progress", icon: <BarChart2 className="h-5 w-5" />, href: "/progress-ubinan" },
        { title: "Verifikasi", icon: <CheckCircle className="h-5 w-5" />, href: "/verifikasi" },
        { title: "Rekap", icon: <FileText className="h-5 w-5" />, href: "/petugas-progres" },
        { title: "Profil", icon: <User className="h-5 w-5" />, href: "/profil" }
      );
    } else if (user?.role === UserRole.PPL) {
      // For PPL: Progress, Input Data, Profile
      items.push(
        { title: "Progress", icon: <BarChart2 className="h-5 w-5" />, href: "/progress-ubinan" },
        { title: "Input Data", icon: <FileText className="h-5 w-5" />, href: "/input-ubinan" },
        { title: "Profil", icon: <User className="h-5 w-5" />, href: "/profil" }
      );
    } else {
      // Viewer or other roles
      items.push(
        { title: "Dashboard", icon: <Home className="h-5 w-5" />, href: "/dashboard" },
        { title: "Progress", icon: <BarChart2 className="h-5 w-5" />, href: "/progress-ubinan" },
        { title: "Profil", icon: <User className="h-5 w-5" />, href: "/profil" }
      );
    }

    return items;
  }, [user?.role]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 text-xs",
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
              onClick={() => setDialogOpen(false)}
            >
              <div>
                {item.icon}
                <span className="mt-1">{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
