
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
}

interface SidebarItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  allowedRoles: UserRole[];
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

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      allowedRoles: [UserRole.ADMIN, UserRole.PML, UserRole.PPL, UserRole.VIEWER],
    },
    {
      title: "Progres Ubinan",
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
      title: "Input Data Ubinan",
      icon: ClipboardList,
      href: "/input-data",
      allowedRoles: [UserRole.ADMIN, UserRole.PPL],
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

  // Filter sidebar items based on user role
  const filteredItems = sidebarItems.filter(item => {
    if (!user) return item.href === "/"; // Only show dashboard for non-authenticated users
    return item.allowedRoles.includes(user.role);
  });

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
            >
              <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-simonita-green" : "text-gray-400")} />
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
