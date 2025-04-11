
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { InputUbinanForm } from "./input-form";
import { getUbinanDataByPPL, getPPLTargets } from "@/services/progress-service";
import { ProgressTable, createProgressDataFromUbinan } from "@/components/progress/progress-table";
import { ProgressChart, convertProgressDataToChartData } from "@/components/progress/progress-chart";
import { toast } from "@/hooks/use-toast";

export default function InputUbinanPage() {
  const { user } = useAuth();
  const [ubinanData, setUbinanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState({ padi: 0, palawija: 0 });
  const [tabValue, setTabValue] = useState("form");

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch ubinan data
      const data = await getUbinanDataByPPL(user.id);
      setUbinanData(data);
      
      // Fetch targets
      const targetData = await getPPLTargets(user.id);
      setTargets(targetData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Kesalahan",
        description: "Gagal memuat data ubinan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Prepare data for progress table
  const progressData = createProgressDataFromUbinan(ubinanData, targets.padi, targets.palawija);
  
  // Group by month for chart
  const getMonthData = () => {
    const monthData = [];
    for (let i = 1; i <= 12; i++) {
      const monthItems = ubinanData.filter(item => {
        const itemDate = new Date(item.tanggal_ubinan);
        return itemDate.getMonth() + 1 === i;
      });
      
      const padi = monthItems.filter(item => item.komoditas === 'padi').length;
      const palawija = monthItems.filter(item => item.komoditas !== 'padi').length;
      
      const padiPercentage = targets.padi > 0 ? (padi / targets.padi) * 100 : 0;
      const palawijaPercentage = targets.palawija > 0 ? (palawija / targets.palawija) * 100 : 0;
      
      monthData.push({
        month: i,
        padi_count: padi,
        palawija_count: palawija,
        padi_target: targets.padi,
        palawija_target: targets.palawija,
        padi_percentage: padiPercentage,
        palawija_percentage: palawijaPercentage
      });
    }
    return monthData;
  };
  
  const chartData = convertProgressDataToChartData(getMonthData());

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Input Data Ubinan</h1>
      
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="form">Form Input</TabsTrigger>
          <TabsTrigger value="data">Data Tersimpan</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          <InputUbinanForm onSubmitSuccess={fetchData} />
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Ubinan Tersimpan</CardTitle>
              <CardDescription>
                Data ubinan yang telah Anda input
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : ubinanData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data ubinan yang tersimpan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Komoditas</TableHead>
                        <TableHead>Responden</TableHead>
                        <TableHead>Alokasi</TableHead>
                        <TableHead>Berat Hasil</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ubinanData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {format(new Date(item.tanggal_ubinan), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="capitalize">
                            {item.komoditas.replace('_', ' ')}
                          </TableCell>
                          <TableCell>{item.responden_name}</TableCell>
                          <TableCell>
                            {item.nks_id ? (
                              <Badge variant="outline">
                                NKS: {item.nks?.code || ""}
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                Segmen: {item.segmen?.code || ""}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{item.berat_hasil} kg</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "dikonfirmasi"
                                  ? "default"
                                  : item.status === "sudah_diisi"
                                  ? "secondary"
                                  : item.status === "ditolak"
                                  ? "destructive"
                                  : "outline"
                              }
                              className={
                                item.status === "dikonfirmasi" 
                                  ? "bg-green-500 hover:bg-green-600" 
                                  : ""
                              }
                            >
                              {item.status === "dikonfirmasi"
                                ? "Terverifikasi"
                                : item.status === "sudah_diisi"
                                ? "Menunggu Verifikasi"
                                : item.status === "ditolak"
                                ? "Ditolak"
                                : "Belum Diisi"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressChart
              title="Grafik Progress Ubinan 2025"
              description="Persentase pencapaian target ubinan per bulan"
              data={chartData}
              loading={loading}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Target</CardTitle>
                <CardDescription>Target dan pencapaian ubinan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-slate-500">Target Padi</h3>
                    <p className="text-2xl font-bold">{targets.padi}</p>
                    <div className="mt-2">
                      <div className="text-xs text-slate-500">Pencapaian</div>
                      <div className="font-medium">
                        {ubinanData.filter(item => item.komoditas === 'padi' && item.status === 'dikonfirmasi').length} terverifikasi
                      </div>
                      <div className="font-medium">
                        {ubinanData.filter(item => item.komoditas === 'padi' && item.status === 'sudah_diisi').length} menunggu verifikasi
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-slate-500">Target Palawija</h3>
                    <p className="text-2xl font-bold">{targets.palawija}</p>
                    <div className="mt-2">
                      <div className="text-xs text-slate-500">Pencapaian</div>
                      <div className="font-medium">
                        {ubinanData.filter(item => item.komoditas !== 'padi' && item.status === 'dikonfirmasi').length} terverifikasi
                      </div>
                      <div className="font-medium">
                        {ubinanData.filter(item => item.komoditas !== 'padi' && item.status === 'sudah_diisi').length} menunggu verifikasi
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <ProgressTable
              title="Data Progress Ubinan 2025"
              description="Pencapaian target ubinan per bulan"
              data={progressData}
              loading={loading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
