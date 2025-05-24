
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ProgressChart, convertProgressDataToChartData } from "@/components/progress/progress-chart"; 
import { ProgressTable } from "@/components/progress/progress-table";
import { getProgressDetailBySubround, getUbinanTotalsBySubround } from "@/services/progress-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedSubround, setSelectedSubround] = useState<number>(1);
  const { toast } = useToast();
  
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  
  const { 
    data: progressData = [], 
    isLoading: isLoadingProgress,
    error: progressError
  } = useQuery({
    queryKey: ['progress_detail', selectedYear, selectedSubround],
    queryFn: () => getProgressDetailBySubround(selectedSubround, selectedYear),
    staleTime: 60000, // Add stale time of 1 minute
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
  
  const { 
    data: totals, 
    isLoading: isLoadingTotals,
    error: totalsError
  } = useQuery({
    queryKey: ['ubinan_totals', selectedYear, selectedSubround],
    queryFn: () => getUbinanTotalsBySubround(selectedSubround, selectedYear),
    staleTime: 60000, // Add stale time of 1 minute
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (progressError) {
      console.error("Error fetching progress data:", progressError);
      toast({
        title: "Error",
        description: "Gagal memuat data progres bulanan. Silakan coba lagi nanti.",
        variant: "destructive",
      });
    }
    
    if (totalsError) {
      console.error("Error fetching totals data:", totalsError);
      toast({
        title: "Error",
        description: "Gagal memuat data total ubinan. Silakan coba lagi nanti.",
        variant: "destructive",
      });
    }
  }, [progressError, totalsError, toast]);
  
  // Convert data for chart display with fallback for empty data
  const chartData = progressData && progressData.length > 0 
    ? convertProgressDataToChartData(progressData)
    : [];
  
  const handleChangeYear = (value: string) => {
    setSelectedYear(parseInt(value));
  };
  
  const handleChangeSubround = (value: string) => {
    setSelectedSubround(parseInt(value));
  };

  // Calculate percentages with fallbacks for safe rendering
  const padiPercentage = totals && totals.padi_target > 0 
    ? Math.round((totals.total_padi / totals.padi_target) * 100) 
    : 0;
    
  const palawijaPercentage = totals && totals.palawija_target > 0 
    ? Math.round((totals.total_palawija / totals.palawija_target) * 100) 
    : 0;
    
  const totalProgress = totals && (totals.padi_target + totals.palawija_target) > 0
    ? Math.round((totals.total_padi + totals.total_palawija) / (totals.padi_target + totals.palawija_target) * 100)
    : 0;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Progres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProgress}%
            </div>
            <div className="text-xs text-muted-foreground">
              {totals ? `${totals.total_padi + totals.total_palawija}/${totals.padi_target + totals.palawija_target}` : '0/0'}
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-2">
              <div 
                className="h-2 bg-green-500 rounded-full" 
                style={{ 
                  width: `${Math.min(100, totalProgress)}%`
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Progres Padi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {padiPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">
              {totals ? `${totals.total_padi}/${totals.padi_target}` : '0/0'}
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-2">
              <div 
                className="h-2 bg-green-500 rounded-full" 
                style={{ 
                  width: `${Math.min(100, padiPercentage)}%` 
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Progres Palawija</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {palawijaPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">
              {totals ? `${totals.total_palawija}/${totals.palawija_target}` : '0/0'}
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-2">
              <div 
                className="h-2 bg-green-500 rounded-full" 
                style={{ 
                  width: `${Math.min(100, palawijaPercentage)}%`
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Progres Bulanan</CardTitle>
              <p className="text-sm text-muted-foreground">Persentase pencapaian target bulanan</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedYear.toString()} onValueChange={handleChangeYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSubround.toString()} onValueChange={handleChangeSubround}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Subround" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Subround 1</SelectItem>
                  <SelectItem value="2">Subround 2</SelectItem>
                  <SelectItem value="3">Subround 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ProgressChart 
              title="" 
              data={chartData}
              loading={isLoadingProgress} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Detail Progres Ubinan</CardTitle>
            <p className="text-sm text-muted-foreground">Pencapaian target entri data ubinan berdasarkan subround</p>
          </CardHeader>
          <CardContent className="pt-2">
            <ProgressTable
              title=""
              description=""
              data={progressData}
              loading={isLoadingProgress}
              selectedYear={selectedYear}
              selectedSubround={selectedSubround}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
