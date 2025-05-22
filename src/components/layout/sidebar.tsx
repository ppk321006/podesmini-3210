
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  FileText,
  CheckCircle,
  Settings,
  Map,
  Home,
  User,
  Workflow,
  LayoutDashboard,
  ClipboardEdit,
  ClipboardCheck,
  FileSpreadsheet,
  MapPin,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const sidebarItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      allowedRoles: [UserRole.ADMIN, UserRole.PML, UserRole.PPL, UserRole.VIEWER],
    },
    {
      title: "Progress Ubinan",
      icon: BarChart3,
      href: "/progress-ubinan",
      allowedRoles: [UserRole.ADMIN, UserRole.PML, UserRole.PPL, UserRole.VIEWER],
    },
    {
      title: "Input Data Ubinan",
      icon: FileText,
      href: "/input-ubinan",
      allowedRoles: [UserRole.PPL],
    },
    {
      title: "Manajemen Petugas",
      icon: Users,
      href: "/petugas",
      allowedRoles: [UserRole.ADMIN],
    },
    {
      title: "Alokasi Wilayah",
      icon: Map,
      href: "/wilayah",
      allowedRoles: [UserRole.ADMIN],
    },
    {
      title: "Alokasi Petugas",
      icon: UserCog,
      href: "/alokasi-petugas",
      allowedRoles: [UserRole.ADMIN],
    },
    {
      title: "Rekap Progres Petugas",
      icon: FileSpreadsheet,
      href: "/petugas-progres",
      allowedRoles: [UserRole.ADMIN, UserRole.PML],
    },
    {
      title: "Verifikasi Data",
      icon: CheckCircle,
      href: "/verifikasi",
      allowedRoles: [UserRole.PML],
    },
    {
      title: "Export Data",
      icon: FileSpreadsheet, 
      href: "/export",
      allowedRoles: [UserRole.ADMIN],
    },
    {
      title: "Profil",
      icon: User,
      href: "/profil",
      allowedRoles: [UserRole.ADMIN, UserRole.PML, UserRole.PPL, UserRole.VIEWER],
    },
  ];

  // Filter sidebar items based on user role
  const filteredItems = sidebarItems.filter(item => {
    if (!user) return false; // Don't show any items if user isn't authenticated
    return item.allowedRoles.includes(user.role);
  });

  // Check if a path is active, handling nested paths
  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-white transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
      )}
    >
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="mt-16 flex-1 space-y-1 px-3">
          {filteredItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-simonita-cream text-simonita-brown"
                    : "text-gray-700 hover:bg-simonita-cream/50 hover:text-simonita-brown",
                  !isOpen && "justify-center md:px-2 md:py-2"
                )
              }
              end={item.href === '/dashboard'} // Only make exact match for dashboard
            >
              <item.icon className={cn("h-5 w-5", isActive(item.href) ? "text-simonita-green" : "text-gray-400")} />
              {(isOpen || isMobile) && <span className="ml-3">{item.title}</span>}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex flex-shrink-0 justify-center p-4">
        {(isOpen || isMobile) && (
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BPS Kab. Majalengka
          </span>
        )}
      </div>
    </aside>
  );
}
