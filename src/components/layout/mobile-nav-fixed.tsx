
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Clipboard, Users, Map, 
  BarChart2, ClipboardCheck, Settings 
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

  // Navigation items based on user role
  const navItems = React.useMemo(() => {
    const items = [
      { 
        title: "Dashboard", 
        icon: <Home className="h-5 w-5" />, 
        href: "/", 
        roles: [UserRole.ADMIN, UserRole.KCD, UserRole.PML, UserRole.PPL] 
      },
    ];

    // Add role-specific navigation items
    if (user?.role === UserRole.ADMIN) {
      items.push(
        { title: "Petugas", icon: <Users className="h-5 w-5" />, href: "/petugas" },
        { title: "Wilayah", icon: <Map className="h-5 w-5" />, href: "/wilayah" },
        { title: "Alokasi Petugas", icon: <Users className="h-5 w-5" />, href: "/alokasi-petugas" },
        { title: "Alokasi Wilayah", icon: <Map className="h-5 w-5" />, href: "/alokasi-wilayah" },
        { title: "Progress", icon: <BarChart2 className="h-5 w-5" />, href: "/progress-ubinan" },
        { title: "Verifikasi", icon: <ClipboardCheck className="h-5 w-5" />, href: "/verifikasi-data" }
      );
    }
    
    if (user?.role === UserRole.PML) {
      items.push(
        { title: "Verifikasi", icon: <ClipboardCheck className="h-5 w-5" />, href: "/verifikasi" }
      );
    }

    if (user?.role === UserRole.PPL) {
      items.push(
        { title: "Input Ubinan", icon: <Clipboard className="h-5 w-5" />, href: "/input-ubinan" }
      );
    }

    // Add common items for all roles
    items.push(
      { title: "Profil", icon: <Settings className="h-5 w-5" />, href: "/profil" }
    );

    return items;
  }, [user?.role]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 text-xs",
                location.pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <DialogTrigger asChild>
                <div>
                  {item.icon}
                  <span className="mt-1">{item.title}</span>
                </div>
              </DialogTrigger>
            </Link>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
