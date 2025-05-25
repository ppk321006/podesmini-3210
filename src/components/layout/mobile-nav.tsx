
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  Map,
  Home,
  User,
  Workflow,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/user";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  allowedRoles: UserRole[];
}

export function MobileNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  
  // Close sheet when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      allowedRoles: [UserRole.ADMIN, UserRole.VIEWER],
    },
    {
      title: "Progres",
      icon: BarChart3,
      href: "/progres",
      allowedRoles: [UserRole.ADMIN, UserRole.PML, UserRole.PPL, UserRole.VIEWER],
    },
    {
      title: "Manajemen Petugas",
      icon: Users,
      href: "/petugas",
      allowedRoles: [UserRole.ADMIN],
    },
    {
      title: "Input Data",
      icon: ClipboardList,
      href: "/input-data",
      allowedRoles: [UserRole.PPL],
    },
    {
      title: "Alokasi Wilayah",
      icon: Map,
      href: "/wilayah",
      allowedRoles: [UserRole.ADMIN],
    },
    {
      title: "Alokasi Petugas",
      icon: Workflow,
      href: "/alokasi-petugas",
      allowedRoles: [UserRole.ADMIN],
    },
    {
      title: "Verifikasi Data",
      icon: FileSpreadsheet,
      href: "/verifikasi",
      allowedRoles: [UserRole.ADMIN, UserRole.PML],
    },
    {
      title: "Profil",
      icon: User,
      href: "/profil",
      allowedRoles: [UserRole.ADMIN, UserRole.PML, UserRole.PPL, UserRole.VIEWER],
    },
    {
      title: "Pengaturan",
      icon: Settings,
      href: "/pengaturan",
      allowedRoles: [UserRole.ADMIN],
    },
  ];

  // Filter navbar items based on user role
  const filteredItems = navItems.filter(item => {
    if (!user) return false;
    return item.allowedRoles.includes(user.role);
  });

  // Get the most frequently used items for quick access (max 4 items)
  const quickAccessItems = filteredItems.slice(0, 4);

  return (
    <>
      {/* Sheet for full menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[250px] sm:w-[300px]">
          <div className="py-4">
            <div className="flex items-center mb-6">
              <img 
                src="/lovable-uploads/6faa01a9-cc07-4092-89f3-a6c83a2690d0.png" 
                alt="Podes Mini 3210 Logo" 
                className="h-10 w-10 mr-3"
              />
              <h1 className="text-xl font-semibold text-simonita-brown">
                Podes Mini 3210
              </h1>
            </div>
            <nav className="space-y-1">
              {filteredItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-simonita-cream text-simonita-brown"
                        : "text-gray-700 hover:bg-simonita-cream/50 hover:text-simonita-brown"
                    )
                  }
                >
                  <item.icon className={cn("h-5 w-5 mr-3", pathname === item.href ? "text-simonita-green" : "text-gray-400")} />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="absolute bottom-4 w-full pr-6">
            <div className="text-xs text-center text-muted-foreground">
              &copy; {new Date().getFullYear()} BPS Kab. Majalengka
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom nav bar for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16">
        {quickAccessItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center p-2 flex-1 h-full",
                isActive
                  ? "text-simonita-green"
                  : "text-gray-500"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1 truncate w-full text-center">{item.title}</span>
          </NavLink>
        ))}
        
        {/* Menu button for showing all options */}
        <SheetTrigger asChild>
          <Button variant="ghost" className="flex flex-col items-center justify-center p-2 flex-1 h-full rounded-none">
            <Menu className="h-5 w-5" />
            <span className="text-xs mt-1">Menu</span>
          </Button>
        </SheetTrigger>
      </div>
    </>
  );
}
