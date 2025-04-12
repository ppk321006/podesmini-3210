
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableTargetGroup } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUbinanDataByPML, getVerificationStatusCounts, getPPLsByPML } from "@/services/progress-service";
import { useAuth } from "@/context/auth-context";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { AlertCircle, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

export default function VerifikasiDataPage() {
  const { user } = useAuth();
  const [selectedPPL, setSelectedPPL] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Get PPL data for current PML
  const {
    data: pplData = [],
    isLoading: isLoadingPPL
  } = useQuery({
    queryKey: ["ppls_by_pml", user?.id],
    queryFn: () => getPPLsByPML(user?.id || ""),
    enabled: !!user && user.role === "pml"
  });
  
  // Get ubinan data for verification
  const {
    data: ubinanData = [],
    isLoading: isLoadingUbinan
  } = useQuery({
    queryKey: ["ubinan_data", user?.id, selectedPPL, statusFilter],
    queryFn: () => getUbinanDataByPML(user?.id || ""),
    enabled: !!user && user.role === "pml"
  });
  
  // Get verification status counts
  const {
    data: statusCounts = [],
    isLoading: isLoadingStatusCounts
  } = useQuery({
    queryKey: ["verification_status_counts"],
    queryFn: () => getVerificationStatusCounts(),
  });
  
  // Filter ubinan data based on selected filters
  const filteredUbinanData = ubinanData.filter((item: any) => {
    // Filter by PPL
    if (selectedPPL && item.ppl?.id !== selectedPPL) return false;
    
    // Filter by status
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    
    return true;
  });
  
  // Calculate total count by commodity
  const commodityCounts = filteredUbinanData.reduce((acc: any, item: any) => {
    const komoditas = item.komoditas || "Tidak diketahui";
    acc[komoditas] = (acc[komoditas] || 0) + 1;
    return acc;
  }, {});
  
  // Convert to pie chart data
  const pieData = Object.keys(commodityCounts).map(key => ({
    name: key === "padi" ? "Padi" : key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
    value: commodityCounts[key]
  }));
  
  // Monthly verification counts for bar chart
  const getMonthlyData = () => {
    const monthlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    ubinanData.forEach((item: any) => {
      if (item.tanggal_ubinan) {
        const date = new Date(item.tanggal_ubinan);
        const monthIndex = date.getMonth();
        monthlyData[monthIndex]++;
      }
    });
    
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    return months.map((month, index) => ({
      name: month,
      value: monthlyData[index]
    }));
  };
  
  // Status count for pie chart
  const statusData = statusCounts.map((status: any) => ({
    name: status.status,
    value: status.count
  }));
  
  // Colors for charts
  const COLORS = ['#4a6741', '#8AA17E', '#99B892', '#ADC9A6', '#C1DAB9'];
  
  // Calculate PPL performance
  const pplPerformance = pplData.map((ppl: any) => {
    const pplUbinanData = ubinanData.filter((item: any) => item.ppl?.id === ppl.id);
    const verifiedCount = pplUbinanData.filter((item: any) => item.status === 'dikonfirmasi').length;
    const pendingCount = pplUbinanData.filter((item: any) => item.status === 'sudah_diisi').length;
    const rejectedCount = pplUbinanData.filter((item: any) => item.status === 'ditolak').length;
    const totalCount = pplUbinanData.length;
    
    return {
      ...ppl,
      verified: verifiedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      total: totalCount,
      performance: totalCount > 0 ? (verifiedCount / totalCount * 100).toFixed(1) : 0
    };
  });
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Verifikasi Data Ubinan</h1>
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="verifikasi">Data Verifikasi</TabsTrigger>
          <TabsTrigger value="kinerja">Kinerja PPL</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusCounts.map((status: any) => {
              let icon;
              let color;
              
              switch(status.status) {
                case 'Terverifikasi':
                  icon = <CheckCircle2 className="h-8 w-8 text-green-500" />;
                  color = 'bg-green-50 border-green-200';
                  break;
                case 'Ditolak':
                  icon = <XCircle className="h-8 w-8 text-red-500" />;
                  color = 'bg-red-50 border-red-200';
                  break;
                case 'Menunggu Verifikasi':
                  icon = <Clock className="h-8 w-8 text-yellow-500" />;
                  color = 'bg-yellow-50 border-yellow-200';
                  break;
                default:
                  icon = <AlertCircle className="h-8 w-8 text-blue-500" />;
                  color = 'bg-blue-50 border-blue-200';
              }
              
              return (
                <Card key={status.status} className={`${color} border`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {status.status}
                    </CardTitle>
                    {icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{status.count}</div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Total data {status.status.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Status Data</CardTitle>
                <CardDescription>Persentase data berdasarkan status verifikasi</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingStatusCounts ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            {/* Commodity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Komoditas</CardTitle>
                <CardDescription>Persentase data berdasarkan jenis komoditas</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingUbinan ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Data Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Data Ubinan Per Bulan</CardTitle>
              <CardDescription>Jumlah data ubinan yang diinput setiap bulan</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingUbinan ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMonthlyData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Jumlah Data" fill="#4a6741" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Verifikasi Tab */}
        <TabsContent value="verifikasi">
          <Card>
            <CardHeader>
              <CardTitle>Data Ubinan untuk Diverifikasi</CardTitle>
              <CardDescription>
                Verifikasi data yang telah dimasukkan oleh petugas PPL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* PPL Filter */}
                  <div className="w-full md:w-1/3">
                    <Select
                      value={selectedPPL || ""}
                      onValueChange={(value) => setSelectedPPL(value === "" ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter PPL" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua PPL</SelectItem>
                        {pplData.map((ppl: any) => (
                          <SelectItem key={ppl.id} value={ppl.id}>
                            {ppl.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="w-full md:w-1/3">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="belum_diisi">Belum Diisi</SelectItem>
                        <SelectItem value="sudah_diisi">Menunggu Verifikasi</SelectItem>
                        <SelectItem value="dikonfirmasi">Terverifikasi</SelectItem>
                        <SelectItem value="ditolak">Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Komoditas</TableHead>
                        <TableHead>Desa/Kecamatan</TableHead>
                        <TableHead>Responden</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>PPL</TableHead>
                        <TableHead>Berat Hasil</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingUbinan ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                            <span className="block mt-2">Memuat data...</span>
                          </TableCell>
                        </TableRow>
                      ) : filteredUbinanData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Tidak ada data yang sesuai dengan filter
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUbinanData.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">
                                {item.komoditas === "padi" ? "Padi" : item.komoditas.charAt(0).toUpperCase() + item.komoditas.slice(1).replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.nks?.desa?.name || item.segmen?.desa?.name || "-"} / {item.nks?.desa?.kecamatan?.name || item.segmen?.desa?.kecamatan?.name || "-"}
                            </TableCell>
                            <TableCell>{item.responden_name}</TableCell>
                            <TableCell>{new Date(item.tanggal_ubinan).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>{item.ppl?.name || "-"}</TableCell>
                            <TableCell>{item.berat_hasil} kg</TableCell>
                            <TableCell>
                              {item.status === "dikonfirmasi" && (
                                <Badge className="bg-green-100 text-green-800">
                                  Terverifikasi
                                </Badge>
                              )}
                              {item.status === "sudah_diisi" && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Menunggu Verifikasi
                                </Badge>
                              )}
                              {item.status === "belum_diisi" && (
                                <Badge className="bg-gray-100 text-gray-800">
                                  Belum Diisi
                                </Badge>
                              )}
                              {item.status === "ditolak" && (
                                <Badge className="bg-red-100 text-red-800">
                                  Ditolak
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.status === "sudah_diisi" && (
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                                    Verifikasi
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    Tolak
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Kinerja PPL Tab */}
        <TabsContent value="kinerja">
          <Card>
            <CardHeader>
              <CardTitle>Kinerja Petugas PPL</CardTitle>
              <CardDescription>
                Performa petugas PPL dalam pengisian data ubinan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama PPL</TableHead>
                      <TableHead>Total Data</TableHead>
                      <TableHead>Terverifikasi</TableHead>
                      <TableHead>Menunggu</TableHead>
                      <TableHead>Ditolak</TableHead>
                      <TableHead>Performa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPPL || isLoadingUbinan ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                          <span className="block mt-2">Memuat data...</span>
                        </TableCell>
                      </TableRow>
                    ) : pplPerformance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Tidak ada data petugas PPL
                        </TableCell>
                      </TableRow>
                    ) : (
                      pplPerformance.map((ppl: any) => (
                        <TableRow key={ppl.id}>
                          <TableCell>{ppl.name}</TableCell>
                          <TableCell>{ppl.total}</TableCell>
                          <TableCell>{ppl.verified}</TableCell>
                          <TableCell>{ppl.pending}</TableCell>
                          <TableCell>{ppl.rejected}</TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${ppl.performance}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{ppl.performance}%</span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* PPL Performance Chart */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Perbandingan Kinerja PPL</CardTitle>
                  <CardDescription>Grafik performa verifikasi data oleh PPL</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoadingPPL || isLoadingUbinan ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pplPerformance.map((ppl: any) => ({
                          name: ppl.name,
                          verified: ppl.verified,
                          pending: ppl.pending,
                          rejected: ppl.rejected
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          tick={{ fontSize: 12 }}
                          height={70}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="verified" name="Terverifikasi" stackId="a" fill="#4a6741" />
                        <Bar dataKey="pending" name="Menunggu" stackId="a" fill="#fbbf24" />
                        <Bar dataKey="rejected" name="Ditolak" stackId="a" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
