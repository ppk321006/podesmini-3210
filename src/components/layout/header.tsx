
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/context/auth-context";
import { UserRound, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/user";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Administrator";
      case UserRole.PML:
        return "Petugas Pemeriksa Lapangan";
      case UserRole.PPL:
        return "Petugas Pendataan Lapangan";
      case UserRole.VIEWER:
        return "Peninjau";
      default:
        return "User";
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 md:px-6">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4 md:mr-6">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/6faa01a9-cc07-4092-89f3-a6c83a2690d0.png" 
          alt="Si Monita Logo" 
          className="h-10 w-10 mr-3"
        />
        <h1 className={cn(
          "text-xl font-semibold text-simonita-brown transition-all duration-300", 
          isSidebarOpen ? "md:hidden" : "hidden md:block"
        )}>
          Si Monita
        </h1>
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="font-medium text-sm">{user?.name}</span>
              <span className="text-xs text-muted-foreground">{user?.role && getRoleName(user.role)}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserRound className="h-5 w-5 text-simonita-green" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {user?.role && getRoleName(user.role)}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <LoginForm />
        )}
      </div>
    </header>
  );
}
