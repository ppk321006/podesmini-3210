
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowUpDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputUbinanForm } from "./input-form";
import { getUbinanDataByPPL, getPPLTargets } from "@/services/progress-service";
import { ProgressTable, createProgressDataFromUbinan } from "@/components/progress/progress-table";
import { ProgressChart, convertProgressDataToChartData } from "@/components/progress/progress-chart";
import { toast } from "@/hooks/use-toast";
import { UbinanData } from "@/types/database-schema";
import { supabase } from "@/integrations/supabase/client";

export default function InputUbinanPage() {
  const { user } = useAuth();
  const [ubinanData, setUbinanData] = useState<UbinanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState({ padi: 0, palawija: 0 });
  const [tabValue, setTabValue] = useState("form");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingUbinan, setEditingUbinan] = useState<UbinanData | null>(null);

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

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort data based on current sort settings
  const sortedUbinanData = [...ubinanData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valueA, valueB;
    
    switch (sortColumn) {
      case 'tanggal':
        valueA = new Date(a.tanggal_ubinan).getTime();
        valueB = new Date(b.tanggal_ubinan).getTime();
        break;
      case 'komoditas':
        valueA = a.komoditas.toLowerCase();
        valueB = b.komoditas.toLowerCase();
        break;
      case 'responden':
        valueA = a.responden_name.toLowerCase();
        valueB = b.responden_name.toLowerCase();
        break;
      case 'berat':
        valueA = a.berat_hasil;
        valueB = b.berat_hasil;
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'alokasi':
        valueA = (a.nks?.code || a.segmen?.code || '').toLowerCase();
        valueB = (b.nks?.code || b.segmen?.code || '').toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

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
      
      // Calculate targets for this month (assuming even distribution across 12 months)
      const monthlyPadiTarget = Math.ceil(targets.padi / 12);
      const monthlyPalawijaTarget = Math.ceil(targets.palawija / 12);
      
      const padiPercentage = monthlyPadiTarget > 0 ? (padi / monthlyPadiTarget) * 100 : 0;
      const palawijaPercentage = monthlyPalawijaTarget > 0 ? (palawija / monthlyPalawijaTarget) * 100 : 0;
      
      monthData.push({
        month: i,
        padi_count: padi,
        palawija_count: palawija,
        padi_target: monthlyPadiTarget,
        palawija_target: monthlyPalawijaTarget,
        padi_percentage: padiPercentage,
        palawija_percentage: palawijaPercentage
      });
    }
    return monthData;
  };
  
  const chartData = convertProgressDataToChartData(getMonthData());

  // Setup counts for progress summary
  const verifiedPadi = ubinanData.filter(item => item.komoditas === 'padi' && item.status === 'dikonfirmasi').length;
  const verifiedPalawija = ubinanData.filter(item => item.komoditas !== 'padi' && item.status === 'dikonfirmasi').length;
  const pendingPadi = ubinanData.filter(item => item.komoditas === 'padi' && item.status === 'sudah_diisi').length;
  const pendingPalawija = ubinanData.filter(item => item.komoditas !== 'padi' && item.status === 'sudah_diisi').length;
  const pendingVerification = ubinanData.filter(item => item.status === 'sudah_diisi').length;

  const handleEditUbinan = async (ubinan: UbinanData) => {
    setEditingUbinan(ubinan);
    setTabValue("form");
  };

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
          <InputUbinanForm onSubmitSuccess={fetchData} initialData={editingUbinan} />
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
              ) : sortedUbinanData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data ubinan yang tersimpan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead onClick={() => handleSort('tanggal')} className="cursor-pointer">
                          Tanggal {sortColumn === 'tanggal' && (
                            <ArrowUpDown className="inline h-4 w-4 ml-1" />
                          )}
                        </TableHead>
                        <TableHead onClick={() => handleSort('komoditas')} className="cursor-pointer">
                          Komoditas {sortColumn === 'komoditas' && (
                            <ArrowUpDown className="inline h-4 w-4 ml-1" />
                          )}
                        </TableHead>
                        <TableHead onClick={() => handleSort('responden')} className="cursor-pointer">
                          Responden {sortColumn === 'responden' && (
                            <ArrowUpDown className="inline h-4 w-4 ml-1" />
                          )}
                        </TableHead>
                        <TableHead onClick={() => handleSort('alokasi')} className="cursor-pointer">
                          Alokasi {sortColumn === 'alokasi' && (
                            <ArrowUpDown className="inline h-4 w-4 ml-1" />
                          )}
                        </TableHead>
                        <TableHead onClick={() => handleSort('berat')} className="cursor-pointer">
                          Berat Hasil {sortColumn === 'berat' && (
                            <ArrowUpDown className="inline h-4 w-4 ml-1" />
                          )}
                        </TableHead>
                        <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                          Status {sortColumn === 'status' && (
                            <ArrowUpDown className="inline h-4 w-4 ml-1" />
                          )}
                        </TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedUbinanData.map((item) => (
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
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditUbinan(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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
                        {verifiedPadi} terverifikasi
                      </div>
                      <div className="font-medium">
                        {pendingPadi} menunggu verifikasi
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-slate-500">Target Palawija</h3>
                    <p className="text-2xl font-bold">{targets.palawija}</p>
                    <div className="mt-2">
                      <div className="text-xs text-slate-500">Pencapaian</div>
                      <div className="font-medium">
                        {verifiedPalawija} terverifikasi
                      </div>
                      <div className="font-medium">
                        {pendingPalawija} menunggu verifikasi
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-700">Belum Diverifikasi</h3>
                  <p className="text-2xl font-bold text-yellow-800">{pendingVerification}</p>
                  <p className="text-sm text-yellow-600 mt-1">Data menunggu verifikasi dari PML</p>
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
