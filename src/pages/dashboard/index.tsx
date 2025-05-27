
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Clock, CalendarClock, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPPLDashboardData, getPMLDashboardData, getPendataanDesaStats } from "@/services/allocation-service";
import { UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PendataanStats {
  total: number;
  selesai: number;
  proses: number;
  belum: number;
}

interface VerificationStats {
  menunggu_verifikasi: number;
  approved: number;
  ditolak: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // Set initial tab based on user role
    if (user?.role === UserRole.ADMIN) {
      return "overview";
    } else {
      return "progress";
    }
  });
  
  // Calculate the days remaining until deadline (June 30, 2025)
  const today = new Date();
  const deadline = new Date(2025, 5, 30); // Month is 0-based in JS
  const daysRemaining = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Ambil data dashboard berdasarkan role
  const { 
    data: dashboardData = [],
    isLoading: isLoadingDashboard,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['dashboard_data', user?.id, user?.role],
    queryFn: async () => {
      if (!user) return [];
      
      // Jika role PPL, ambil data PPL
      if (user.role === UserRole.PPL) {
        return await getPPLDashboardData(user.id);
      } 
      // Jika role PML, ambil data PML
      else if (user.role === UserRole.PML) {
        return await getPMLDashboardData(user.id);
      }
      
      // Default: ambil semua data (untuk admin)
      return await getPMLDashboardData(user.id);
    },
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  // Ambil statistik pendataan
  const {
    data: pendataanStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['pendataan_stats'],
    queryFn: getPendataanDesaStats,
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  // Ambil statistik verifikasi berdasarkan role
  const {
    data: verificationStats,
    isLoading: isLoadingVerification
  } = useQuery({
    queryKey: ['verification_stats', user?.id, user?.role],
    queryFn: async (): Promise<VerificationStats> => {
      if (!user?.id) return { menunggu_verifikasi: 0, approved: 0, ditolak: 0 };

      let query = supabase
        .from('data_pendataan_desa')
        .select('verification_status, ppl_id');

      // Filter berdasarkan role
      if (user.role === UserRole.PPL) {
        query = query.eq('ppl_id', user.id);
      } else if (user.role === UserRole.PML) {
        // Ambil data dari PPL yang di bawah PML ini
        const { data: pplData } = await supabase
          .from('users')
          .select('id')
          .eq('pml_id', user.id)
          .eq('role', 'ppl');
        
        if (pplData && pplData.length > 0) {
          const pplIds = pplData.map(ppl => ppl.id);
          query = query.in('ppl_id', pplIds);
        }
      }
      // Untuk ADMIN, ambil semua data (tidak ada filter tambahan)

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching verification stats:', error);
        return { menunggu_verifikasi: 0, approved: 0, ditolak: 0 };
      }

      const stats = {
        menunggu_verifikasi: 0,
        approved: 0,
        ditolak: 0
      };

      data?.forEach(item => {
        if (item.verification_status === 'belum_verifikasi') {
          stats.menunggu_verifikasi++;
        } else if (item.verification_status === 'approved') {
          stats.approved++;
        } else if (item.verification_status === 'ditolak') {
          stats.ditolak++;
        }
      });

      return stats;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  // Calculate kecamatan stats
  const kecamatanData = dashboardData.reduce((acc: any[], item: any) => {
    const kecamatan = acc.find((k) => k.id === item.kecamatan_id);
    
    if (kecamatan) {
      kecamatan.target = (kecamatan.target || 0) + 1;
      if (item.status === 'selesai') {
        kecamatan.realisasi = (kecamatan.realisasi || 0) + 1;
      }
    } else if (item.kecamatan_id && item.kecamatan_name) {
      acc.push({
        id: item.kecamatan_id,
        name: item.kecamatan_name,
        target: 1,
        realisasi: item.status === 'selesai' ? 1 : 0
      });
    }
    
    return acc;
  }, []);
  
  // Generate pie chart data
  const pieData = pendataanStats ? [
    { name: "Selesai", value: (pendataanStats as PendataanStats).selesai, color: "#22c55e" },
    { name: "Proses", value: (pendataanStats as PendataanStats).proses, color: "#f97316" },
    { name: "Belum", value: (pendataanStats as PendataanStats).belum, color: "#64748b" }
  ] : [];

  const COLORS = ["#22c55e", "#f97316", "#64748b"];

  const getRoleBasedTitle = () => {
    if (user?.role === UserRole.PPL) {
      return "Dashboard PPL";
    } else if (user?.role === UserRole.PML) {
      return "Dashboard PML";
    } else {
      return "Dashboard";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getRoleBasedTitle()}</h1>
          <p className="text-gray-500">Selamat datang, {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="mt-4 md:mt-0 flex items-center bg-orange-100 text-orange-800 rounded-lg p-2">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium mr-2">Deadline:</span>
            <span>{deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="ml-2 bg-orange-200 px-2 py-0.5 rounded-full text-sm font-medium">
              {daysRemaining} hari lagi
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchDashboard()}
            disabled={isLoadingDashboard}
          >
            {isLoadingDashboard ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : "Refresh"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {user?.role === UserRole.ADMIN && (
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          )}
          {(user?.role === UserRole.PML || user?.role === UserRole.PPL) && (
            <TabsTrigger value="progress">Progress</TabsTrigger>
          )}
        </TabsList>

        {user?.role === UserRole.ADMIN && (
          <TabsContent value="overview" className="space-y-4">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Desa</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {(pendataanStats as PendataanStats)?.total || 0}
                      </div>
                      <p className="text-xs text-gray-500">100%</p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {(pendataanStats as PendataanStats)?.selesai || 0}
                      </div>
                      <p className="text-xs text-gray-500">
                        {pendataanStats && (pendataanStats as PendataanStats).total > 0
                          ? `${Math.round(((pendataanStats as PendataanStats).selesai / (pendataanStats as PendataanStats).total) * 100)}% dari total`
                          : '0%'
                        }
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
                  <CalendarClock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {(pendataanStats as PendataanStats)?.proses || 0}
                      </div>
                      <p className="text-xs text-gray-500">
                        {pendataanStats && (pendataanStats as PendataanStats).total > 0
                          ? `${Math.round(((pendataanStats as PendataanStats).proses / (pendataanStats as PendataanStats).total) * 100)}% dari total`
                          : '0%'
                        }
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Belum Dimulai</CardTitle>
                  <XCircle className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {(pendataanStats as PendataanStats)?.belum || 0}
                      </div>
                      <p className="text-xs text-gray-500">
                        {pendataanStats && (pendataanStats as PendataanStats).total > 0
                          ? `${Math.round(((pendataanStats as PendataanStats).belum / (pendataanStats as PendataanStats).total) * 100)}% dari total`
                          : '0%'
                        }
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Verification Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingVerification ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-yellow-600">
                        {verificationStats?.menunggu_verifikasi || 0}
                      </div>
                      <p className="text-xs text-gray-500">data menunggu verifikasi</p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingVerification ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-600">
                        {verificationStats?.approved || 0}
                      </div>
                      <p className="text-xs text-gray-500">data disetujui</p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingVerification ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-red-600">
                        {verificationStats?.ditolak || 0}
                      </div>
                      <p className="text-xs text-gray-500">data ditolak</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pie Chart and Deadline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Status Pendataan</CardTitle>
                  <CardDescription>Distribusi status pendataan desa</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {isLoadingStats ? (
                    <div className="flex justify-center items-center h-[300px]">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : pieData.length > 0 ? (
                    <div className="w-full h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} desa`, 'Jumlah']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-[300px]">
                      <p className="text-lg text-gray-500">Tidak ada data</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deadline</CardTitle>
                  <CardDescription>Batas waktu pendataan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Progress Keseluruhan</span>
                      <span className="text-sm font-medium">
                        {pendataanStats && (pendataanStats as PendataanStats).total > 0
                          ? `${Math.round(((pendataanStats as PendataanStats).selesai / (pendataanStats as PendataanStats).total) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                    <Progress 
                      value={pendataanStats && (pendataanStats as PendataanStats).total > 0
                        ? ((pendataanStats as PendataanStats).selesai / (pendataanStats as PendataanStats).total) * 100
                        : 0
                      } 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CalendarClock className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted-foreground">Tanggal Deadline</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Sisa Waktu</p>
                        <p className="text-sm text-orange-700">
                          {daysRemaining} hari ({Math.ceil(daysRemaining/7)} minggu)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {(user?.role === UserRole.PML || user?.role === UserRole.PPL) && (
          <TabsContent value="progress" className="space-y-4">
            {/* Verification Status Cards for PPL and PML */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingVerification ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-yellow-600">
                        {verificationStats?.menunggu_verifikasi || 0}
                      </div>
                      <p className="text-xs text-gray-500">data menunggu verifikasi</p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingVerification ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-600">
                        {verificationStats?.approved || 0}
                      </div>
                      <p className="text-xs text-gray-500">data disetujui</p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingVerification ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-red-600">
                        {verificationStats?.ditolak || 0}
                      </div>
                      <p className="text-xs text-gray-500">data ditolak</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Progress Per Kecamatan</CardTitle>
                <CardDescription>Perbandingan target dan realisasi per kecamatan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingDashboard ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : kecamatanData.length > 0 ? (
                  kecamatanData.map((kecamatan, index) => (
                    <div key={kecamatan.id || index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{kecamatan.name}</span>
                        <span className="text-sm font-medium">{kecamatan.realisasi}/{kecamatan.target} desa</span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={kecamatan.target > 0 ? (kecamatan.realisasi / kecamatan.target) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {kecamatan.target > 0 ? ((kecamatan.realisasi / kecamatan.target) * 100).toFixed(0) : 0}% selesai
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-lg text-gray-500">Tidak ada data kecamatan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
