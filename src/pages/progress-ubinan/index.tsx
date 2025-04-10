
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { getProgressReports, getPPLList, getUbinanProgressBySubround, getUbinanProgressByYear } from "@/services/wilayah-api";
import { monthsIndonesia } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Helper function to get month name
const getMonthName = (monthNumber: number): string => {
  return monthsIndonesia[monthNumber - 1] || '';
};

export default function ProgressUbinanPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [subround, setSubround] = useState(1);
  const [activeTab, setActiveTab] = useState("ppl-performance");

  // Get progress reports
  const { data: progressReports = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: ["progress_reports"],
    queryFn: getProgressReports,
  });

  // Get PPL list
  const { data: pplList = [] } = useQuery({
    queryKey: ["petugas", "ppl"],
    queryFn: () => getPPLList(),
  });

  // Get ubinan progress by subround
  const { data: ubinanProgressBySubround = [] } = useQuery({
    queryKey: ["ubinan_progress", "subround", subround],
    queryFn: () => getUbinanProgressBySubround(subround),
  });

  // Get ubinan progress by year
  const { data: ubinanProgressByYear = [] } = useQuery({
    queryKey: ["ubinan_progress", "year", year],
    queryFn: () => getUbinanProgressByYear(year),
  });

  // Calculate PPL performance metrics
  const pplPerformance = pplList.map(ppl => {
    const pplReports = progressReports.filter(report => report.ppl_id === ppl.id);
    const totalPadiTarget = pplReports.reduce((sum, report) => sum + (report.target_padi || 0), 0);
    const totalPalawijaTarget = pplReports.reduce((sum, report) => sum + (report.target_palawija || 0), 0);
    const totalTarget = pplReports.reduce((sum, report) => sum + report.target_count, 0);
    const totalCompleted = pplReports.reduce((sum, report) => sum + report.completed_count, 0);
    const totalVerified = pplReports.reduce((sum, report) => sum + report.verified_count, 0);
    const totalRejected = pplReports.reduce((sum, report) => sum + report.rejected_count, 0);
    
    const completionRate = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;
    const verificationRate = totalCompleted > 0 ? (totalVerified / totalCompleted) * 100 : 0;
    const rejectionRate = totalCompleted > 0 ? (totalRejected / totalCompleted) * 100 : 0;
    
    return {
      id: ppl.id,
      name: ppl.name,
      totalPadiTarget,
      totalPalawijaTarget,
      totalTarget,
      totalCompleted,
      totalVerified,
      totalRejected,
      completionRate: completionRate.toFixed(1),
      verificationRate: verificationRate.toFixed(1),
      rejectionRate: rejectionRate.toFixed(1),
    };
  });

  // Prepare data for komoditas bar chart
  const komoditasData = ubinanProgressByYear.reduce((acc: any[], item) => {
    const komoditas = item.komoditas;
    const status = item.status;
    const count = Number(item.count);
    
    const existingKomoditas = acc.find(k => k.name === komoditas);
    
    if (existingKomoditas) {
      existingKomoditas[status] = count;
      existingKomoditas.total += count;
    } else {
      acc.push({
        name: komoditas,
        [status]: count,
        total: count
      });
    }
    
    return acc;
  }, []);

  // Prepare data for status pie chart
  const statusData = ubinanProgressByYear.reduce((acc: any[], item) => {
    const status = item.status;
    const count = Number(item.count);
    
    const existingStatus = acc.find(s => s.name === status);
    
    if (existingStatus) {
      existingStatus.value += count;
    } else {
      acc.push({
        name: status,
        value: count
      });
    }
    
    return acc;
  }, []);

  // Calculate monthly progress
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthlyProgress = months.map(month => {
    const monthReports = progressReports.filter(report => report.month === month && report.year === year);
    const totalTarget = monthReports.reduce((sum, report) => sum + report.target_count, 0);
    const totalCompleted = monthReports.reduce((sum, report) => sum + report.completed_count, 0);
    
    return {
      month: getMonthName(month),
      target: totalTarget,
      completed: totalCompleted,
      completion: totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0
    };
  });

  // Calculate progress metrics for summary cards
  const totalPadiTarget = progressReports.reduce((sum, report) => sum + (report.target_padi || 0), 0);
  const totalPalawijaTarget = progressReports.reduce((sum, report) => sum + (report.target_palawija || 0), 0);
  
  const completedPadi = ubinanProgressByYear.reduce((sum, item) => {
    if (item.komoditas === 'padi') {
      return sum + Number(item.count);
    }
    return sum;
  }, 0);
  
  const completedPalawija = ubinanProgressByYear.reduce((sum, item) => {
    if (item.komoditas !== 'padi') {
      return sum + Number(item.count);
    }
    return sum;
  }, 0);
  
  const verifiedCount = ubinanProgressByYear.reduce((sum, item) => {
    if (item.status === 'dikonfirmasi') {
      return sum + Number(item.count);
    }
    return sum;
  }, 0);
  
  const rejectedCount = ubinanProgressByYear.reduce((sum, item) => {
    if (item.status === 'ditolak') {
      return sum + Number(item.count);
    }
    return sum;
  }, 0);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Progress Ubinan</h1>
      
      <div className="grid gap-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div>
            <label className="text-sm font-medium mb-1 block">Tahun</label>
            <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {[2022, 2023, 2024, 2025].map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Subround</label>
            <Select value={subround.toString()} onValueChange={(v) => setSubround(Number(v))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Subround" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Subround 1</SelectItem>
                <SelectItem value="2">Subround 2</SelectItem>
                <SelectItem value="3">Subround 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Target Ubinan Padi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{totalPadiTarget}</p>
                <Progress 
                  value={totalPadiTarget > 0 ? (completedPadi / totalPadiTarget) * 100 : 0} 
                  className="h-2" 
                />
                <p className="text-sm text-muted-foreground">
                  Selesai: {completedPadi} ({totalPadiTarget > 0 ? ((completedPadi / totalPadiTarget) * 100).toFixed(1) : 0}%)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Target Ubinan Palawija</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{totalPalawijaTarget}</p>
                <Progress 
                  value={totalPalawijaTarget > 0 ? (completedPalawija / totalPalawijaTarget) * 100 : 0} 
                  className="h-2" 
                />
                <p className="text-sm text-muted-foreground">
                  Selesai: {completedPalawija} ({totalPalawijaTarget > 0 ? ((completedPalawija / totalPalawijaTarget) * 100).toFixed(1) : 0}%)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 bg-green-50">
              <CardTitle className="text-lg text-green-700">Ubinan Terverifikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{verifiedCount}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {(completedPadi + completedPalawija) > 0 ? 
                  ((verifiedCount / (completedPadi + completedPalawija)) * 100).toFixed(1) : 0}% dari total ubinan
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4 bg-red-50">
              <CardTitle className="text-lg text-red-700">Ubinan Ditolak</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {(completedPadi + completedPalawija) > 0 ? 
                  ((rejectedCount / (completedPadi + completedPalawija)) * 100).toFixed(1) : 0}% dari total ubinan
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="ppl-performance">Performa PPL</TabsTrigger>
          <TabsTrigger value="monthly-progress">Progress Bulanan</TabsTrigger>
          <TabsTrigger value="komoditas-progress">Progress Komoditas</TabsTrigger>
        </TabsList>

        <TabsContent value="ppl-performance">
          <Card>
            <CardHeader>
              <CardTitle>Performa Petugas PPL</CardTitle>
              <CardDescription>
                Capaian target dan tingkat penyelesaian per petugas PPL
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProgress ? (
                <p>Memuat data...</p>
              ) : pplPerformance.length === 0 ? (
                <p className="text-muted-foreground">Belum ada data performa</p>
              ) : (
                <>
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={pplPerformance}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 0,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completionRate" name="Tingkat Penyelesaian (%)" fill="#8884d8" />
                        <Bar dataKey="verificationRate" name="Tingkat Verifikasi (%)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama PPL</TableHead>
                        <TableHead className="text-right">Target Padi</TableHead>
                        <TableHead className="text-right">Target Palawija</TableHead>
                        <TableHead className="text-right">Total Target</TableHead>
                        <TableHead className="text-right">Selesai</TableHead>
                        <TableHead className="text-right">Terverifikasi</TableHead>
                        <TableHead className="text-right">Ditolak</TableHead>
                        <TableHead className="text-right">Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pplPerformance.map((ppl) => (
                        <TableRow key={ppl.id}>
                          <TableCell className="font-medium">{ppl.name}</TableCell>
                          <TableCell className="text-right">{ppl.totalPadiTarget}</TableCell>
                          <TableCell className="text-right">{ppl.totalPalawijaTarget}</TableCell>
                          <TableCell className="text-right">{ppl.totalTarget}</TableCell>
                          <TableCell className="text-right">{ppl.totalCompleted}</TableCell>
                          <TableCell className="text-right">{ppl.totalVerified}</TableCell>
                          <TableCell className="text-right">{ppl.totalRejected}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={`${Number(ppl.completionRate) >= 80 ? 'bg-green-100 text-green-800' : Number(ppl.completionRate) >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {ppl.completionRate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly-progress">
          <Card>
            <CardHeader>
              <CardTitle>Progress Bulanan</CardTitle>
              <CardDescription>
                Capaian ubinan per bulan dalam tahun {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={monthlyProgress}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="target" name="Target" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="completed" name="Selesai" fill="#82ca9d" />
                    <Bar yAxisId="right" dataKey="completion" name="Persentase (%)" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bulan</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead className="text-right">Selesai</TableHead>
                    <TableHead className="text-right">Persentase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyProgress.map((item) => (
                    <TableRow key={item.month}>
                      <TableCell className="font-medium">{item.month}</TableCell>
                      <TableCell className="text-right">{item.target}</TableCell>
                      <TableCell className="text-right">{item.completed}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={`${item.completion >= 80 ? 'bg-green-100 text-green-800' : item.completion >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {item.completion.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="komoditas-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress per Komoditas</CardTitle>
                <CardDescription>
                  Jumlah ubinan per komoditas dan status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={komoditasData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      barSize={20}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="belum_diisi" name="Belum Diisi" stackId="a" fill="#ffc658" />
                      <Bar dataKey="sudah_diisi" name="Sudah Diisi" stackId="a" fill="#8884d8" />
                      <Bar dataKey="dikonfirmasi" name="Dikonfirmasi" stackId="a" fill="#82ca9d" />
                      <Bar dataKey="ditolak" name="Ditolak" stackId="a" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Status</CardTitle>
                <CardDescription>
                  Sebaran status ubinan dalam persentase
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full max-w-xs">
                  <ResponsiveContainer width="100%" height={300}>
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
                      <Tooltip formatter={(value) => [`${value} ubinan`, 'Jumlah']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
