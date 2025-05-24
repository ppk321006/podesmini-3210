
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Clock, CalendarClock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData, getStatisticsByDashboardData, getKecamatanProgress } from "@/services/dashboard-service";
import { UserRole } from "@/types/user";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate the days remaining until deadline (June 30, 2025)
  const today = new Date();
  const deadline = new Date(2025, 5, 30); // Month is 0-based in JS
  const daysRemaining = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Fetch dashboard data based on user role
  const { 
    data: dashboardData = [],
    isLoading: isLoadingDashboard,
    refetch: refetchDashboard,
    error: dashboardError
  } = useQuery({
    queryKey: ['dashboard_data', user?.id, user?.role],
    queryFn: async () => {
      if (!user?.id || !user?.role) return [];
      return await getDashboardData(user.id, user.role);
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    enabled: !!user?.id && !!user?.role
  });

  // Calculate statistics based on dashboard data
  const stats = getStatisticsByDashboardData(dashboardData);
  
  // Calculate kecamatan stats
  const kecamatanData = getKecamatanProgress(dashboardData);
  
  // Generate pie chart data
  const pieData = [
    { name: "Selesai", value: stats.selesai + stats.approved, color: "#22c55e" },
    { name: "Proses", value: stats.proses, color: "#f97316" },
    { name: "Belum", value: stats.belum, color: "#64748b" },
    { name: "Ditolak", value: stats.ditolak, color: "#ef4444" }
  ].filter(item => item.value > 0);

  const COLORS = ["#22c55e", "#f97316", "#64748b", "#ef4444"];

  const getRoleBasedTitle = () => {
    if (user?.role === UserRole.PPL) {
      return "Dashboard PPL";
    } else if (user?.role === UserRole.PML) {
      return "Dashboard PML";
    } else {
      return "Dashboard Admin";
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-500">Silakan login terlebih dahulu</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {dashboardError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-500">Terjadi kesalahan saat memuat data dashboard</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="progress">Progress Kecamatan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Desa</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingDashboard ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {stats.total}
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
                  {isLoadingDashboard ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {stats.selesai + stats.approved}
                      </div>
                      <p className="text-xs text-gray-500">
                        {stats.total > 0
                          ? `${Math.round(((stats.selesai + stats.approved) / stats.total) * 100)}% dari total`
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
                  {isLoadingDashboard ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {stats.proses}
                      </div>
                      <p className="text-xs text-gray-500">
                        {stats.total > 0
                          ? `${Math.round((stats.proses / stats.total) * 100)}% dari total`
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
                  {isLoadingDashboard ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {stats.belum}
                      </div>
                      <p className="text-xs text-gray-500">
                        {stats.total > 0
                          ? `${Math.round((stats.belum / stats.total) * 100)}% dari total`
                          : '0%'
                        }
                      </p>
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
                  {isLoadingDashboard ? (
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
                        {stats.persentase_selesai}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.persentase_selesai} 
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

          <TabsContent value="progress" className="space-y-4">
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
                  kecamatanData.map((kecamatan) => (
                    <div key={kecamatan.id} className="space-y-1">
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
                        {kecamatan.target > 0 ? 
                          Math.round((kecamatan.realisasi / kecamatan.target) * 100) : 0}% selesai
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
        </Tabs>
      )}
    </div>
  );
}
