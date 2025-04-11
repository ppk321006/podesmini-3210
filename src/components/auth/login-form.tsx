
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { UserRound, KeyRound } from "lucide-react";

export function LoginForm() {
  const [username, setUsername] = useState("admin"); // Pre-fill with admin username
  const [password, setPassword] = useState("admin123"); // Pre-fill with admin password
  const [isOpen, setIsOpen] = useState(false);
  const { login, isLoading, isAuthenticated, logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting login form with:", username, password);
    await login(username, password);
    if (!isLoading) {
      setIsOpen(false);
    }
  };

  return isAuthenticated ? (
    <Button variant="outline" onClick={logout} className="gap-2">
      <UserRound size={16} />
      Logout
    </Button>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-simonita-green hover:bg-simonita-green/90">
          <UserRound size={16} />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="items-center">
          <img 
            src="/lovable-uploads/6faa01a9-cc07-4092-89f3-a6c83a2690d0.png" 
            alt="Si Monita Logo" 
            className="h-24 w-24 mb-4" // Increased size from default
          />
          <DialogTitle className="text-center text-2xl font-bold text-simonita-brown">Login Si Monita</DialogTitle>
          <DialogDescription className="text-center">
            Silakan masukkan username dan password Anda untuk login
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-simonita-green hover:bg-simonita-green/90"
            >
              {isLoading ? "Loading..." : "Login"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
