import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileSpreadsheet, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthsIndonesia, getMonthName } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  getUbinanProgressByYear, 
  getUbinanProgressDetailBySubround, 
  getVerificationStatusCounts, 
  getPalawijaTypeCounts, 
  getUbinanTotalsBySubround
} from "@/services/wilayah-api";
import { DetailProgressData, VerificationStatusCount, PalawijaTypeCount, UbinanTotals } from "@/types/database-schema";

interface ProgressData {
  month: number;
  target_count: number;
  completed_count: number;
  verified_count: number;
  rejected_count: number;
  completion_percentage: number;
}

interface YearOption {
  value: number;
  label: string;
}

interface SubroundOption {
  value: number;
  label: string;
}

export default function ProgressUbinanPage() {
  const currentYear = new Date().getFullYear();
  const yearOptions: YearOption[] = [
    { value: currentYear, label: currentYear.toString() },
    { value: currentYear - 1, label: (currentYear - 1).toString() },
    { value: currentYear - 2, label: (currentYear - 2).toString() }
  ];
  
  const subroundOptions: SubroundOption[] = [
    { value: 1, label: "Subround 1 (Jan-Apr)" },
    { value: 2, label: "Subround 2 (Mei-Agt)" },
    { value: 3, label: "Subround 3 (Sept-Des)" },
    { value: 0, label: "Tahunan" }
  ];

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedSubround, setSelectedSubround] = useState<number>(1);
  const [activeTab, setActiveTab] = useState("summary");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [detailProgressData, setDetailProgressData] = useState<DetailProgressData[]>([]);
  const [verificationStatusCounts, setVerificationStatusCounts] = useState<VerificationStatusCount[]>([]);
  const [palawijaTypeCounts, setPalawijaTypeCounts] = useState<PalawijaTypeCount[]>([]);
  const [ubinanTotals, setUbinanTotals] = useState<UbinanTotals | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, [selectedYear, selectedSubround]);

  const fetchProgressData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch basic progress data
      const progressData = await getUbinanProgressByYear(selectedYear);

      // Fetch detailed progress data
      const detailData = await getUbinanProgressDetailBySubround(selectedSubround);

      // Fetch verification status counts
      const statusData = await getVerificationStatusCounts();

      // Fetch palawija by type
      const palawijaData = await getPalawijaTypeCounts();

      // Fetch totals for current subround
      const totalsData = await getUbinanTotalsBySubround(selectedSubround);

      // Format and set the data
      const formattedProgressData = formatProgressData(progressData || []);
      setProgressData(formattedProgressData);
      setDetailProgressData(detailData || []);
      setVerificationStatusCounts(statusData || []);
      setPalawijaTypeCounts(palawijaData || []);
      setUbinanTotals(totalsData && totalsData.length > 0 ? totalsData[0] : null);
    } catch (error) {
      console.error('Error in progress data fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatProgressData = (data: ProgressData[]) => {
    // Create data for all 12 months even if some months have no data
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const monthNumber = i + 1;
      const existingData = data.find(item => item.month === monthNumber);
      
      return existingData || {
        month: monthNumber,
        target_count: 0,
        completed_count: 0,
        verified_count: 0,
        rejected_count: 0,
        completion_percentage: 0,
      };
    });

    return allMonths;
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(Number(value));
  };

  const handleSubroundChange = (value: string) => {
    setSelectedSubround(Number(value));
  };

  const chartData = progressData.map(item => ({
    ...item,
    name: getMonthName(item.month),
    completion: Number(item.completion_percentage.toFixed(1))
  }));

  const detailChartData = detailProgressData.map(item => ({
    name: getMonthName(item.month),
    padi: item.padi_count,
    palawija: item.palawija_count,
    padi_target: item.padi_target,
    palawija_target: item.palawija_target,
    padi_percentage: Number(item.padi_percentage.toFixed(1)),
    palawija_percentage: Number(item.palawija_percentage.toFixed(1))
  }));

  // Filter chart data for the selected subround
  const filteredChartData = selectedSubround === 0 ? 
    chartData : 
    chartData.filter(item => {
      if (selectedSubround === 1) return item.month >= 1 && item.month <= 4;
      if (selectedSubround === 2) return item.month >= 5 && item.month <= 8;
      if (selectedSubround === 3) return item.month >= 9 && item.month <= 12;
      return true;
    });

  // Get total percentages for the cards
  const getPadiPercentage = () => {
    if (!ubinanTotals) return 0;
    return ubinanTotals.padi_target > 0 ? 
      Math.round((ubinanTotals.total_padi / ubinanTotals.padi_target) * 100) : 0;
  };

  const getPalawijaPercentage = () => {
    if (!ubinanTotals) return 0;
    return ubinanTotals.palawija_target > 0 ? 
      Math.round((ubinanTotals.total_palawija / ubinanTotals.palawija_target) * 100) : 0;
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Progress Ubinan</h1>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Periode:</span>
          <Select value={selectedSubround.toString()} onValueChange={handleSubroundChange}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Pilih Subround" />
            </SelectTrigger>
            <SelectContent>
              {subroundOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-sm font-medium">Tahun:</span>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ubinan Padi</CardTitle>
                <FileSpreadsheet className="h-4 w-4 text-simonita-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ubinanTotals?.total_padi || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Target: {ubinanTotals?.padi_target || 0} sampel
                </p>
                <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-simonita-green" 
                    style={{ width: `${getPadiPercentage()}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-right">{getPadiPercentage()}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ubinan Palawija</CardTitle>
                <BarChart3 className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ubinanTotals?.total_palawija || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Target: {ubinanTotals?.palawija_target || 0} sampel
                </p>
                <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500" 
                    style={{ width: `${getPalawijaPercentage()}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-right">{getPalawijaPercentage()}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Belum Diverifikasi</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ubinanTotals?.pending_verification || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Menunggu pemeriksaan PML
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subround Aktif</CardTitle>
                <TrendingUp className="h-4 w-4 text-simonita-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedSubround === 0 ? "Tahunan" : selectedSubround}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedSubround === 1 && "Januari - April"}
                  {selectedSubround === 2 && "Mei - Agustus"}
                  {selectedSubround === 3 && "September - Desember"}
                  {selectedSubround === 0 && "Data Tahunan"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="detail">Detail</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Grafik Progress Ubinan {selectedYear}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ChartContainer className="h-full" config={{}}>
                        <BarChart data={filteredChartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="completion" name="Persentase Selesai (%)" fill="#4299E1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="target_count" name="Target" fill="#48BB78" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="completed_count" name="Terisi" fill="#ECC94B" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="verified_count" name="Diverifikasi" fill="#38B2AC" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Data Progress Ubinan {selectedYear}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bulan</TableHead>
                          <TableHead className="text-right">Target</TableHead>
                          <TableHead className="text-right">Terisi</TableHead>
                          <TableHead className="text-right">Diverifikasi</TableHead>
                          <TableHead className="text-right">Ditolak</TableHead>
                          <TableHead className="text-right">Persentase Selesai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredChartData.map((item) => (
                          <TableRow key={item.month}>
                            <TableCell className="font-medium">{getMonthName(item.month)}</TableCell>
                            <TableCell className="text-right">{item.target_count}</TableCell>
                            <TableCell className="text-right">{item.completed_count}</TableCell>
                            <TableCell className="text-right">{item.verified_count}</TableCell>
                            <TableCell className="text-right">{item.rejected_count}</TableCell>
                            <TableCell className="text-right">{item.completion_percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="detail">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Ubinan: Jumlah</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Perkembangan ubinan padi dan palawija periode {
                        selectedSubround === 1 ? "Januari - April" :
                        selectedSubround === 2 ? "Mei - Agustus" :
                        selectedSubround === 3 ? "September - Desember" : "Tahunan"
                      }
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ChartContainer className="h-full" config={{}}>
                        <BarChart data={detailChartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="padi" name="Padi" fill="#4a6741" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="palawija" name="Palawija" fill="#eab308" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Progress Ubinan: Persentase</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Persentase perkembangan terhadap target periode {
                        selectedSubround === 1 ? "Januari - April" :
                        selectedSubround === 2 ? "Mei - Agustus" :
                        selectedSubround === 3 ? "September - Desember" : "Tahunan"
                      }
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ChartContainer className="h-full" config={{}}>
                        <BarChart data={detailChartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis unit="%" domain={[0, 100]} />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="padi_percentage" name="Padi %" fill="#4a6741" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="palawija_percentage" name="Palawija %" fill="#eab308" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Realisasi Palawija</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Pencapaian per jenis komoditas
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ChartContainer className="h-full" config={{}}>
                        <BarChart 
                          data={palawijaTypeCounts} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="komoditas" type="category" width={100} />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" name="Jumlah" fill="#4a6741" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status Verifikasi</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Jumlah data berdasarkan status
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {verificationStatusCounts.map((status) => (
                        <div key={status.status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              status.status === "Terverifikasi" ? "bg-green-100 text-green-800" :
                              status.status === "Menunggu Verifikasi" ? "bg-amber-100 text-amber-800" :
                              status.status === "Ditolak" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {status.status}
                            </Badge>
                          </div>
                          <div className="font-bold">{status.count}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
