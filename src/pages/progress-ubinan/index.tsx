
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types/user";
import { ProgressChart, convertProgressDataToChartData } from "@/components/progress/progress-chart";
import { ProgressTable } from "@/components/progress/progress-table";
import { 
  getUbinanTotalsBySubround, 
  getProgressDetailBySubround,
  getPMLProgressByMonth,
  getPPLProgressByMonth
} from "@/services/progress-service";

export default function ProgressUbinanPage() {
  const { user } = useAuth();
  const [selectedSubround, setSelectedSubround] = useState<number>(0); // 0 = all, 1 = Jan-Apr, 2 = May-Aug, 3 = Sep-Dec
  const currentYear = new Date().getFullYear();

  // Get totals for the selected subround
  const { data: totals, isLoading: isLoadingTotals } = useQuery({
    queryKey: ['ubinan_totals', selectedSubround],
    queryFn: () => getUbinanTotalsBySubround(selectedSubround),
    enabled: !!user,
  });

  // Get progress detail by subround
  const { data: progressDetail = [], isLoading: isLoadingDetail } = useQuery({
    queryKey: ['ubinan_progress_detail', selectedSubround],
    queryFn: () => getProgressDetailBySubround(selectedSubround),
    enabled: !!user,
  });

  // For PPL - get their own progress
  const { data: pplProgress = [], isLoading: isLoadingPPLProgress } = useQuery({
    queryKey: ['ppl_progress', user?.id, currentYear],
    queryFn: () => getPPLProgressByMonth(user?.id || '', currentYear),
    enabled: !!user && user.role === UserRole.PPL,
  });

  // For PML - get progress for their PPLs
  const { data: pmlProgress = [], isLoading: isLoadingPMLProgress } = useQuery({
    queryKey: ['pml_progress', user?.id, currentYear],
    queryFn: () => getPMLProgressByMonth(user?.id || '', currentYear),
    enabled: !!user && user.role === UserRole.PML,
  });

  // Calculate percentages for the summary cards
  const padiPercentage = totals?.padi_target ? (totals.total_padi / totals.padi_target) * 100 : 0;
  const palawijaPercentage = totals?.palawija_target ? (totals.total_palawija / totals.palawija_target) * 100 : 0;
  const totalProgress = totals?.padi_target && totals?.palawija_target 
    ? ((totals.total_padi + totals.total_palawija) / (totals.padi_target + totals.palawija_target)) * 100 
    : 0;

  // Convert data for charts
  const chartData = convertProgressDataToChartData(
    user?.role === UserRole.PPL ? pplProgress : 
    user?.role === UserRole.PML ? pmlProgress : 
    progressDetail
  );

  const handleChangeSubround = (value: string) => {
    setSelectedSubround(parseInt(value));
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Progres Ubinan</h1>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Ringkasan Progres</h2>

        <Tabs 
          value={selectedSubround.toString()} 
          onValueChange={handleChangeSubround}
          className="w-[400px]"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="0">Semua</TabsTrigger>
            <TabsTrigger value="1">Jan-Apr</TabsTrigger>
            <TabsTrigger value="2">Mei-Ags</TabsTrigger>
            <TabsTrigger value="3">Sep-Des</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoadingTotals ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Progres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-lg font-bold">{totalProgress.toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground">
                  {(totals?.total_padi || 0) + (totals?.total_palawija || 0)}/{(totals?.padi_target || 0) + (totals?.palawija_target || 0)}
                </span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Progres Padi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-lg font-bold">{padiPercentage.toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground">
                  {totals?.total_padi || 0}/{totals?.padi_target || 0}
                </span>
              </div>
              <Progress value={padiPercentage} className="h-2 bg-green-100">
                <div className="h-full bg-green-600" style={{ width: `${padiPercentage}%` }} />
              </Progress>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Progres Palawija</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-lg font-bold">{palawijaPercentage.toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground">
                  {totals?.total_palawija || 0}/{totals?.palawija_target || 0}
                </span>
              </div>
              <Progress value={palawijaPercentage} className="h-2 bg-amber-100">
                <div className="h-full bg-amber-600" style={{ width: `${palawijaPercentage}%` }} />
              </Progress>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProgressChart
          title="Progres Bulanan"
          description="Persentase pencapaian target bulanan"
          data={chartData}
          loading={
            user?.role === UserRole.PPL ? isLoadingPPLProgress :
            user?.role === UserRole.PML ? isLoadingPMLProgress :
            isLoadingDetail
          }
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Status Verifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTotals ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Menunggu Verifikasi</span>
                    <span>{totals?.pending_verification || 0} entri</span>
                  </div>
                  <Progress
                    value={
                      totals && (totals.padi_target + totals.palawija_target) > 0
                        ? (totals.pending_verification / (totals.padi_target + totals.palawija_target)) * 100
                        : 0
                    }
                    className="h-2 bg-yellow-100"
                  >
                    <div className="h-full bg-yellow-500" />
                  </Progress>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Terverifikasi</span>
                    <span>{(totals?.total_padi || 0) + (totals?.total_palawija || 0)} entri</span>
                  </div>
                  <Progress
                    value={totalProgress}
                    className="h-2 bg-green-100"
                  >
                    <div className="h-full bg-green-500" />
                  </Progress>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Target</span>
                    <span>{(totals?.padi_target || 0) + (totals?.palawija_target || 0)} entri</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded"></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detail Progres Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressTable
            title="Detail Progres Bulanan"
            description="Pencapaian target bulanan entri data ubinan"
            data={
              user?.role === UserRole.PPL ? pplProgress :
              user?.role === UserRole.PML ? pmlProgress :
              progressDetail
            }
            loading={
              user?.role === UserRole.PPL ? isLoadingPPLProgress :
              user?.role === UserRole.PML ? isLoadingPMLProgress :
              isLoadingDetail
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
