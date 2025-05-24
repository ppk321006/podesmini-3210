
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressChart } from "@/components/progress/progress-chart";
import { ProgressTable } from "@/components/progress/progress-table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { DetailProgressData } from "@/types/database-schema";

const Index = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<DetailProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        
        // Fetch from ubinan_progress_monthly view
        const { data, error } = await supabase
          .from('ubinan_progress_monthly')
          .select('*')
          .order('month');

        if (error) {
          console.error("Error fetching progress data:", error);
          return;
        }

        // Transform the data to match DetailProgressData interface
        const transformedData: DetailProgressData[] = (data || []).map((item: any) => ({
          month: item.month || 0,
          padi_count: item.padi_count || 0,
          palawija_count: item.palawija_count || 0,
          pending_verification: item.pending_verification || 0,
          verified: item.verified || 0,
          rejected: item.rejected || 0,
          padi_target: 100, // Default target - should be fetched from database
          palawija_target: 100, // Default target - should be fetched from database
          padi_percentage: item.padi_count ? Math.round((item.padi_count / 100) * 100) : 0,
          palawija_percentage: item.palawija_count ? Math.round((item.palawija_count / 100) * 100) : 0,
          // Legacy properties for backward compatibility
          totalPadi: item.padi_count || 0,
          totalPalawija: item.palawija_count || 0,
          pendingVerification: item.pending_verification || 0,
          padiTarget: 100,
          palawijaTarget: 100
        }));

        setProgressData(transformedData);
      } catch (error) {
        console.error("Error in fetchProgressData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const renderUserRoleBadge = (role: string) => {
    const roleColors = {
      [UserRole.ADMIN]: "bg-red-100 text-red-800",
      [UserRole.PML]: "bg-blue-100 text-blue-800", 
      [UserRole.PPL]: "bg-green-100 text-green-800",
      [UserRole.VIEWER]: "bg-gray-100 text-gray-800"
    };

    const roleLabels = {
      [UserRole.ADMIN]: "Administrator",
      [UserRole.PML]: "Pengawas Mitra Lapangan",
      [UserRole.PPL]: "Petugas Pencacah Lapangan", 
      [UserRole.VIEWER]: "Viewer"
    };

    return (
      <Badge className={roleColors[role as UserRole] || "bg-gray-100 text-gray-800"}>
        {roleLabels[role as UserRole] || role}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Ubinan</h1>
          <p className="text-muted-foreground">
            Selamat datang, {user?.name} {renderUserRoleBadge(user?.role || '')}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Padi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressData.reduce((sum, item) => sum + item.padi_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                sampel ubinan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Palawija</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressData.reduce((sum, item) => sum + item.palawija_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                sampel ubinan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressData.reduce((sum, item) => sum + item.pending_verification, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                sampel pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terverifikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressData.reduce((sum, item) => sum + item.verified, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                sampel verified
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="chart" className="w-full">
          <TabsList>
            <TabsTrigger value="chart">Grafik Progress</TabsTrigger>
            <TabsTrigger value="table">Tabel Detail</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Ubinan per Bulan</CardTitle>
                <CardDescription>
                  Grafik progress pengumpulan data ubinan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressChart data={progressData} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="table" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detail Progress</CardTitle>
                <CardDescription>
                  Tabel detail progress per bulan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressTable data={progressData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
