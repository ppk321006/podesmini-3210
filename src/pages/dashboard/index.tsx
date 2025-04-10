
import { useAuth } from "@/context/auth-context";
import { ExportDataCard } from "./export-data";

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user?.role === "admin" && (
          <ExportDataCard />
        )}
        {/* Additional dashboard cards can be added here */}
      </div>
    </div>
  );
}
