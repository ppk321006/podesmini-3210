
import { useAuth } from "@/context/auth-context";
import { ExportDataCard } from "./export-data";
import { UserRole } from "@/types/user";

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6">
        {user?.role === UserRole.ADMIN && (
          <ExportDataCard />
        )}
        {/* Additional dashboard cards can be added here */}
      </div>
    </div>
  );
}
