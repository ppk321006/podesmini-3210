
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { ExportDataCard } from "./export-data";
import { UserRole } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllPPLPerformance } from "@/services/progress-service";
import { PeriodSelector } from "./components/period-selector";
import { PerformanceTable } from "./components/performance-table";

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("completion_percentage");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedSubround, setSelectedSubround] = useState<number>(0); // 0 = all, 1 = Jan-Apr, 2 = May-Aug, 3 = Sep-Dec
  
  // Generate years from 2025 to 2030
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  
  const { data: petugasPerformance = [], isLoading } = useQuery({
    queryKey: ['petugas_performance', selectedYear, selectedSubround],
    queryFn: () => getAllPPLPerformance(selectedYear, selectedSubround),
    enabled: !!user && user.role === UserRole.ADMIN,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });

  const handleChangeYear = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  const handleChangeSubround = (value: string) => {
    setSelectedSubround(parseInt(value));
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6">
        {user?.role === UserRole.ADMIN && (
          <>
            <ExportDataCard />
            
            <Card>
              <CardHeader className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                <CardTitle>Capaian Petugas</CardTitle>
                <PeriodSelector 
                  selectedYear={selectedYear}
                  selectedSubround={selectedSubround}
                  years={years}
                  onYearChange={handleChangeYear}
                  onSubroundChange={handleChangeSubround}
                />
              </CardHeader>
              <CardContent>
                <PerformanceTable
                  data={petugasPerformance}
                  isLoading={isLoading}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  sortColumn={sortColumn}
                  setSortColumn={setSortColumn}
                  sortDirection={sortDirection}
                  setSortDirection={setSortDirection}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
