
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { UserRole } from "@/types/user";
import { ProgressChart, convertProgressDataToChartData } from "@/components/progress/progress-chart";
import { ProgressTable } from "@/components/progress/progress-table";
import { 
  getUbinanTotalsBySubround, 
  getProgressDetailBySubround,
  getPMLProgressByMonth,
  getPPLProgressByMonth
} from "@/services/progress-service";
import { PeriodSelector } from "@/pages/dashboard/components/period-selector";
import { ProgressSummaryCards } from "./components/progress-summary-card";
import { VerificationStatusCard } from "./components/verification-status";

export default function ProgressUbinanPage() {
  const { user } = useAuth();
  const [selectedSubround, setSelectedSubround] = useState<number>(0); // 0 = all, 1 = Jan-Apr, 2 = May-Aug, 3 = Sep-Dec
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Generate years from 2025 to 2030
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  
  // Get totals for the selected subround
  const { data: totals, isLoading: isLoadingTotals } = useQuery({
    queryKey: ['ubinan_totals', selectedSubround, selectedYear],
    queryFn: () => getUbinanTotalsBySubround(selectedSubround, selectedYear),
    enabled: !!user,
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  // Get progress detail by subround
  const { data: progressDetail = [], isLoading: isLoadingDetail } = useQuery({
    queryKey: ['ubinan_progress_detail', selectedSubround, selectedYear],
    queryFn: () => getProgressDetailBySubround(selectedSubround, selectedYear),
    enabled: !!user,
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  // For PPL - get their own progress
  const { data: pplProgress = [], isLoading: isLoadingPPLProgress } = useQuery({
    queryKey: ['ppl_progress', user?.id, selectedYear],
    queryFn: () => getPPLProgressByMonth(user?.id || '', selectedYear),
    enabled: !!user && user.role === UserRole.PPL,
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  // For PML - get progress for their PPLs
  const { data: pmlProgress = [], isLoading: isLoadingPMLProgress } = useQuery({
    queryKey: ['pml_progress', user?.id, selectedYear],
    queryFn: () => getPMLProgressByMonth(user?.id || '', selectedYear),
    enabled: !!user && user.role === UserRole.PML,
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  // Convert data for charts
  const chartData = convertProgressDataToChartData(
    user?.role === UserRole.PPL ? pplProgress : 
    user?.role === UserRole.PML ? pmlProgress : 
    progressDetail
  );

  const handleChangeSubround = (value: string) => {
    setSelectedSubround(parseInt(value));
  };

  const handleChangeYear = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  const isLoadingProgress = 
    user?.role === UserRole.PPL ? isLoadingPPLProgress :
    user?.role === UserRole.PML ? isLoadingPMLProgress :
    isLoadingDetail;

  const progressData = 
    user?.role === UserRole.PPL ? pplProgress :
    user?.role === UserRole.PML ? pmlProgress :
    progressDetail;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Progres Ubinan</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-medium">Ringkasan Progres</h2>

        <PeriodSelector
          selectedYear={selectedYear}
          selectedSubround={selectedSubround}
          years={years}
          onYearChange={handleChangeYear}
          onSubroundChange={handleChangeSubround}
        />
      </div>
      
      <ProgressSummaryCards totals={totals} isLoading={isLoadingTotals} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProgressChart
          title="Progres Bulanan"
          description="Persentase pencapaian target bulanan"
          data={chartData}
          loading={isLoadingProgress}
        />
        
        <VerificationStatusCard totals={totals} isLoading={isLoadingTotals} />
      </div>

      <ProgressTable
        title="Detail Progres Ubinan"
        description="Pencapaian target entri data ubinan berdasarkan subround"
        data={progressData}
        loading={isLoadingProgress}
        selectedYear={selectedYear}
        selectedSubround={selectedSubround}
      />
    </div>
  );
}
