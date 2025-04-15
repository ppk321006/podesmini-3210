import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, FileDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadToExcel } from "@/services/export-service";
import { UserRole } from "@/types/user";
import { 
  getUbinanTotalsBySubround, 
  getProgressDetailBySubround,
  getPMLProgressByMonth,
  getPPLProgressByMonth,
  getSubroundFromMonth
} from "@/services/progress-service";
import { PeriodSelector } from "@/pages/dashboard/components/period-selector";
import { ProgressSummaryCards } from "./components/progress-summary-card";
import { ProgressChart, convertProgressDataToChartData } from "@/components/progress/progress-chart";
import { ProgressTable } from "@/components/progress/progress-table";
import { supabase } from "@/integrations/supabase/client";

export default function ProgressUbinanPage() {
  const { user } = useAuth();
  const [selectedSubround, setSelectedSubround] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedPPL, setSelectedPPL] = useState<string>("all");
  const [selectedPML, setSelectedPML] = useState<string>("all");

  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  const handleChangeSubround = (value: string) => {
    setSelectedSubround(parseInt(value));
  };

  const handleChangeYear = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  const handleChangeMonth = (value: string) => {
    setSelectedMonth(parseInt(value));
  };

  const handleChangeStatus = (value: string) => {
    setSelectedStatus(value);
  };

  const handleChangePPL = (value: string) => {
    setSelectedPPL(value);
  };

  const handleChangePML = (value: string) => {
    setSelectedPML(value);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setSelectedMonth(date.getMonth() + 1);
      setSelectedYear(date.getFullYear());
    }
  };

  const { data: pplUsers = [], isLoading: isLoadingPPL } = useQuery({
    queryKey: ['ppl_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'ppl')
        .order('name');
        
      if (error) throw error;
      return data || [];
    },
    enabled: user?.role === UserRole.ADMIN || user?.role === UserRole.VIEWER,
    staleTime: 300000,
  });

  const { data: pmlUsers = [], isLoading: isLoadingPML } = useQuery({
    queryKey: ['pml_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'pml')
        .order('name');
        
      if (error) throw error;
      return data || [];
    },
    enabled: user?.role === UserRole.ADMIN || user?.role === UserRole.VIEWER,
    staleTime: 300000,
  });

  if (user?.role === UserRole.PPL || user?.role === UserRole.PML) {
    const { data: totals, isLoading: isLoadingTotals } = useQuery({
      queryKey: ['ubinan_totals', selectedSubround, selectedYear],
      queryFn: () => getUbinanTotalsBySubround(selectedSubround, selectedYear),
      enabled: !!user,
      staleTime: 60000,
      refetchOnWindowFocus: true,
    });

    const { data: progressDetail = [], isLoading: isLoadingDetail } = useQuery({
      queryKey: ['ubinan_progress_detail', selectedSubround, selectedYear],
      queryFn: () => getProgressDetailBySubround(selectedSubround, selectedYear),
      enabled: !!user,
      staleTime: 60000,
      refetchOnWindowFocus: true,
    });

    const { data: pplProgress = [], isLoading: isLoadingPPLProgress } = useQuery({
      queryKey: ['ppl_progress', user?.id, selectedYear],
      queryFn: () => getPPLProgressByMonth(user?.id || '', selectedYear),
      enabled: !!user && user.role === UserRole.PPL,
      staleTime: 60000,
      refetchOnWindowFocus: true,
    });

    const { data: pmlProgress = [], isLoading: isLoadingPMLProgress } = useQuery({
      queryKey: ['pml_progress', user?.id, selectedYear],
      queryFn: () => getPMLProgressByMonth(user?.id || '', selectedYear),
      enabled: !!user && user.role === UserRole.PML,
      staleTime: 60000,
      refetchOnWindowFocus: true,
    });

    const chartData = convertProgressDataToChartData(
      user?.role === UserRole.PPL ? pplProgress : 
      user?.role === UserRole.PML ? pmlProgress : 
      progressDetail
    );

    const isLoadingProgress = 
      user?.role === UserRole.PPL ? isLoadingPPLProgress :
      user?.role === UserRole.PML ? isLoadingPMLProgress :
      isLoadingDetail;

    const progressData = 
      user?.role === UserRole.PPL ? pplProgress :
      user?.role === UserRole.PML ? pmlProgress :
      progressDetail;

    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Progres Ubinan</h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-medium">Ringkasan Progres</h2>

          <PeriodSelector
            selectedYear={selectedYear}
            selectedSubround={selectedSubround}
            years={years}
            onYearChange={handleChangeYear}
            onSubroundChange={handleChangeSubround}
          />
        </div>
        
        <ProgressSummaryCards totals={totals} isLoading={isLoadingTotals} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ProgressChart
            title="Progres Bulanan"
            description="Persentase pencapaian target bulanan"
            data={chartData}
            loading={isLoadingProgress}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Status Verifikasi</CardTitle>
              <CardDescription>Jumlah data berdasarkan status verifikasi</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTotals ? (
                <div className="flex justify-center items-center h-60">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-xl font-medium mb-2">
                        {totals?.pending_verification || 0} Data
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Menunggu verifikasi
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <ProgressTable
          title="Detail Progres Ubinan"
          description="Pencapaian target entri data ubinan berdasarkan subround"
          data={progressData}
          loading={isLoadingProgress}
          selectedYear={selectedYear}
          selectedSubround={selectedSubround}
        />
      </div>
    );
  }

  const { data: pplActivitySummary = [], isLoading: isLoadingPplActivity } = useQuery({
    queryKey: ['ppl_activity_summary', selectedYear, selectedMonth, selectedSubround, selectedStatus, selectedPPL, selectedPML],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_ppl_activity_summary', {
          year_param: selectedYear,
          month_param: selectedMonth,
          subround_param: selectedSubround,
          status_param: selectedStatus === 'all' ? null : selectedStatus,
          ppl_id_param: selectedPPL === 'all' ? null : selectedPPL,
          pml_id_param: selectedPML === 'all' ? null : selectedPML
        });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error("Error fetching PPL activity summary:", error);
        return [];
      }
    },
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  const { data: petugasData = [], isLoading: isLoadingPetugas } = useQuery({
    queryKey: ['petugas_progress', selectedYear, selectedMonth, selectedSubround, selectedStatus, searchTerm, selectedPPL, selectedPML],
    queryFn: async () => {
      let query = supabase
        .from('ubinan_data')
        .select(`
          id,
          komoditas,
          status,
          tanggal_ubinan,
          responden_name,
          berat_hasil,
          ppl:ppl_id(id, name),
          pml:pml_id(id, name),
          nks:nks_id(
            id, 
            code,
            desa:desa_id(
              id, 
              name,
              kecamatan:kecamatan_id(
                id, 
                name
              )
            )
          ),
          segmen:segmen_id(
            id, 
            code,
            desa:desa_id(
              id, 
              name,
              kecamatan:kecamatan_id(
                id, 
                name
              )
            )
          )
        `);

      query = query.filter('tanggal_ubinan', 'gte', `${selectedYear}-01-01`);
      query = query.filter('tanggal_ubinan', 'lte', `${selectedYear}-12-31`);

      if (selectedMonth > 0) {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth, 0); // Last day of the month
        
        query = query.filter('tanggal_ubinan', 'gte', startDate.toISOString().split('T')[0]);
        query = query.filter('tanggal_ubinan', 'lte', endDate.toISOString().split('T')[0]);
      } 
      else if (selectedSubround > 0) {
        let startMonth, endMonth;
        
        if (selectedSubround === 1) {
          startMonth = 1; // January
          endMonth = 4;  // April
        } else if (selectedSubround === 2) {
          startMonth = 5; // May
          endMonth = 8;  // August
        } else {
          startMonth = 9; // September
          endMonth = 12; // December
        }
        
        const startDate = new Date(selectedYear, startMonth - 1, 1);
        const endDate = new Date(selectedYear, endMonth, 0); // Last day of the month
        
        query = query.filter('tanggal_ubinan', 'gte', startDate.toISOString().split('T')[0]);
        query = query.filter('tanggal_ubinan', 'lte', endDate.toISOString().split('T')[0]);
      }

      if (selectedStatus !== "all") {
        query = query.eq('status', selectedStatus);
      }
      
      if (selectedPPL !== "all") {
        query = query.eq('ppl_id', selectedPPL);
      }
      
      if (selectedPML !== "all") {
        query = query.eq('pml_id', selectedPML);
      }

      query = query.order('tanggal_ubinan', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching petugas progress:", error);
        throw error;
      }
      
      const petugasGroups = data.reduce((acc: any, item: any) => {
        const pplId = item.ppl?.id;
        const pplName = item.ppl?.name || "Unknown";
        
        if (!acc[pplId]) {
          acc[pplId] = {
            pplId,
            pplName,
            pmlName: item.pml?.name || "Unknown",
            total: 0,
            totalPadi: 0,
            totalPalawija: 0,
            belumDiisi: 0,
            sudahDiisi: 0,
            dikonfirmasi: 0,
            ditolak: 0,
            dataUbinan: [],
            desas: new Set(),
            kecamatans: new Set(),
            responden: new Set()
          };
        }
        
        acc[pplId].total++;
        if (item.komoditas === 'padi') {
          acc[pplId].totalPadi++;
        } else {
          acc[pplId].totalPalawija++;
        }
        
        if (item.status === 'belum_diisi') acc[pplId].belumDiisi++;
        else if (item.status === 'sudah_diisi') acc[pplId].sudahDiisi++;
        else if (item.status === 'dikonfirmasi') acc[pplId].dikonfirmasi++;
        else if (item.status === 'ditolak') acc[pplId].ditolak++;
        
        const desa = item.segmen?.desa?.name || item.nks?.desa?.name || "-";
        const kecamatan = item.segmen?.desa?.kecamatan?.name || item.nks?.desa?.kecamatan?.name || "-";
        
        acc[pplId].desas.add(desa);
        acc[pplId].kecamatans.add(kecamatan);
        acc[pplId].responden.add(item.responden_name);
        
        acc[pplId].dataUbinan.push({
          ...item,
          desa,
          kecamatan,
          code: item.segmen?.code || item.nks?.code || "-"
        });
        
        return acc;
      }, {});
      
      return Object.values(petugasGroups).map((petugas: any) => ({
        ...petugas,
        desas: Array.from(petugas.desas),
        kecamatans: Array.from(petugas.kecamatans),
        responden: Array.from(petugas.responden)
      })).sort((a: any, b: any) => a.pplName.localeCompare(b.pplName));
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const filteredPetugas = petugasData.filter((petugas: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      petugas.pplName.toLowerCase().includes(searchLower) ||
      petugas.pmlName.toLowerCase().includes(searchLower) ||
      petugas.desas.some((desa: string) => desa.toLowerCase().includes(searchLower)) ||
      petugas.kecamatans.some((kec: string) => kec.toLowerCase().includes(searchLower)) ||
      petugas.responden.some((resp: string) => resp.toLowerCase().includes(searchLower))
    );
  });

  const handleExportToExcel = () => {
    if (!filteredPetugas.length) return;

    const flatData = filteredPetugas.flatMap((petugas: any) => {
      return petugas.dataUbinan.map((data: any, index: number) => ({
        'No': index + 1,
        'Nama PPL': petugas.pplName,
        'Nama PML': petugas.pmlName,
        'Kecamatan': data.kecamatan,
        'Desa': data.desa,
        'Kode': data.code,
        'Komoditas': data.komoditas === 'padi' ? 'Padi' : data.komoditas.charAt(0).toUpperCase() + data.komoditas.slice(1).replace('_', ' '),
        'Nama Responden': data.responden_name,
        'Berat Hasil (kg)': data.berat_hasil,
        'Tanggal Ubinan': format(new Date(data.tanggal_ubinan), 'dd/MM/yyyy'),
        'Status': data.status === 'belum_diisi' ? 'Belum Diisi' : 
                data.status === 'sudah_diisi' ? 'Menunggu Verifikasi' : 
                data.status === 'dikonfirmasi' ? 'Terverifikasi' : 'Ditolak'
      }));
    });

    downloadToExcel(flatData, `rekap-progres-petugas-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  const handleExportActivityToExcel = () => {
    if (!Array.isArray(pplActivitySummary) || pplActivitySummary.length === 0) return;

    const flatData = pplActivitySummary.map((item: any, index: number) => ({
      'No': index + 1,
      'Nama PPL': item.ppl_name,
      'Nama PML': item.pml_name,
      'Bulan': format(new Date(2025, item.month-1, 1), 'MMMM', { locale: id }),
      'Tahun': selectedYear,
      'Jumlah Ubinan': item.total_count,
      'Padi': item.padi_count,
      'Palawija': item.palawija_count,
      'Status Terverifikasi': item.confirmed_count,
      'Status Menunggu Verifikasi': item.pending_count,
      'Status Ditolak': item.rejected_count,
    }));

    downloadToExcel(flatData, `rekap-aktivitas-ppl-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  function getStatusBadge(status: string, count: number) {
    if (count === 0) return null;
    
    let badgeClass = "bg-gray-100 text-gray-800";
    if (status === "dikonfirmasi") badgeClass = "bg-green-100 text-green-800";
    else if (status === "sudah_diisi") badgeClass = "bg-yellow-100 text-yellow-800";
    else if (status === "ditolak") badgeClass = "bg-red-100 text-red-800";
    else if (status === "belum_diisi") badgeClass = "bg-gray-100 text-gray-800";
    
    return (
      <Badge className={badgeClass}>
        {status === "dikonfirmasi" ? "Terverifikasi" : 
         status === "sudah_diisi" ? "Menunggu Verifikasi" : 
         status === "ditolak" ? "Ditolak" : "Belum Diisi"}: {count}
      </Badge>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Progres Ubinan</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Aktivitas PPL</CardTitle>
          <CardDescription>
            Daftar PPL melakukan ubinan berdasarkan bulan dan jumlahnya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end mb-6">
            <div className="grid gap-2">
              <Label htmlFor="date-picker">Pilih Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-picker"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMMM yyyy", { locale: id }) : <span>Pilih bulan</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="month-select">Bulan</Label>
              <Select value={selectedMonth.toString()} onValueChange={handleChangeMonth}>
                <SelectTrigger id="month-select" className="w-full md:w-[180px]">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Semua Bulan</SelectItem>
                  <SelectItem value="1">Januari</SelectItem>
                  <SelectItem value="2">Februari</SelectItem>
                  <SelectItem value="3">Maret</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">Mei</SelectItem>
                  <SelectItem value="6">Juni</SelectItem>
                  <SelectItem value="7">Juli</SelectItem>
                  <SelectItem value="8">Agustus</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">Oktober</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">Desember</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="subround-select">Subround</Label>
              <Select value={selectedSubround.toString()} onValueChange={handleChangeSubround}>
                <SelectTrigger id="subround-select" className="w-full md:w-[180px]">
                  <SelectValue placeholder="Pilih subround" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Semua Subround</SelectItem>
                  <SelectItem value="1">Subround 1 (Jan-Apr)</SelectItem>
                  <SelectItem value="2">Subround 2 (Mei-Ags)</SelectItem>
                  <SelectItem value="3">Subround 3 (Sep-Des)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status-select">Status</Label>
              <Select value={selectedStatus} onValueChange={handleChangeStatus}>
                <SelectTrigger id="status-select" className="w-full md:w-[180px]">
                  <SelectValue placeholder="Pilih status" />
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
            
            <div className="grid gap-2">
              <Label htmlFor="ppl-select">PPL</Label>
              <Select value={selectedPPL} onValueChange={handleChangePPL}>
                <SelectTrigger id="ppl-select" className="w-full md:w-[180px]">
                  <SelectValue placeholder="Pilih PPL" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua PPL</SelectItem>
                  {!isLoadingPPL && Array.isArray(pplUsers) && pplUsers.map((ppl) => (
                    <SelectItem key={ppl.id} value={ppl.id}>{ppl.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="pml-select">PML</Label>
              <Select value={selectedPML} onValueChange={handleChangePML}>
                <SelectTrigger id="pml-select" className="w-full md:w-[180px]">
                  <SelectValue placeholder="Pilih PML" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua PML</SelectItem>
                  {!isLoadingPML && Array.isArray(pmlUsers) && pmlUsers.map((pml) => (
                    <SelectItem key={pml.id} value={pml.id}>{pml.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              className="flex gap-2 items-center mt-6" 
              onClick={handleExportActivityToExcel}
              disabled={!Array.isArray(pplActivitySummary) || pplActivitySummary.length === 0}
            >
              <FileDown className="h-4 w-4" />
              <span>Export Excel</span>
            </Button>
          </div>

          {isLoadingPplActivity ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : !Array.isArray(pplActivitySummary) || pplActivitySummary.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">Tidak ada data aktivitas PPL yang tersedia</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>PPL</TableHead>
                    <TableHead>PML</TableHead>
                    <TableHead>Bulan</TableHead>
                    <TableHead>Jumlah Ubinan</TableHead>
                    <TableHead>Padi</TableHead>
                    <TableHead>Palawija</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(pplActivitySummary) && pplActivitySummary.map((activity, index) => (
                    <TableRow key={`${activity.ppl_id}-${activity.month}-${index}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{activity.ppl_name}</TableCell>
                      <TableCell>{activity.pml_name}</TableCell>
                      <TableCell>
                        {format(new Date(2025, activity.month-1, 1), 'MMMM', { locale: id })}
                      </TableCell>
                      <TableCell className="font-medium">{activity.total_count}</TableCell>
                      <TableCell>{activity.padi_count}</TableCell>
                      <TableCell>{activity.palawija_count}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {activity.confirmed_count > 0 && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Terverifikasi: {activity.confirmed_count}
                            </Badge>
                          )}
                          {activity.pending_count > 0 && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              Menunggu: {activity.pending_count}
                            </Badge>
                          )}
                          {activity.rejected_count > 0 && (
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              Ditolak: {activity.rejected_count}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Progres Petugas</CardTitle>
          <CardDescription>
            Rekap data hasil input petugas ubinan berdasarkan periode dan status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end mb-6">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="search">Cari</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari petugas, wilayah, responden..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="flex gap-2 items-center" 
              onClick={handleExportToExcel}
              disabled={!filteredPetugas.length}
            >
              <FileDown className="h-4 w-4" />
              <span>Export Excel</span>
            </Button>
          </div>

          {isLoadingPetugas ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : filteredPetugas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">Tidak ada data yang tersedia</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPetugas.map((petugas: any) => (
                <Card key={petugas.pplId} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle>{petugas.pplName}</CardTitle>
                        <CardDescription>
                          PML: {petugas.pmlName} | 
                          Wilayah: {petugas.kecamatans.join(', ')}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-primary text-white">
                          Total: {petugas.total}
                        </Badge>
                        {petugas.totalPadi > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            Padi: {petugas.totalPadi}
                          </Badge>
                        )}
                        {petugas.totalPalawija > 0 && (
                          <Badge className="bg-amber-100 text-amber-800">
                            Palawija: {petugas.totalPalawija}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="border-b px-4">
                      <div className="flex space-x-4 overflow-x-auto py-2">
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-sm">
                          Ringkasan
                        </Button>
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-sm">
                          Detail Data
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Status Pengisian</h4>
                          <div className="space-y-2">
                            {getStatusBadge("dikonfirmasi", petugas.dikonfirmasi)}
                            {getStatusBadge("sudah_diisi", petugas.sudahDiisi)}
                            {getStatusBadge("ditolak", petugas.ditolak)}
                            {getStatusBadge("belum_diisi", petugas.belumDiisi)}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Wilayah</h4>
                          <div>
                            <p><span className="font-medium">Kecamatan:</span> {petugas.kecamatans.join(', ')}</p>
                            <p><span className="font-medium">Desa:</span> {petugas.desas.join(', ')}</p>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <h4 className="font-medium mb-2">Responden</h4>
                          <div className="flex flex-wrap gap-2">
                            {petugas.responden.map((nama: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {nama}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t">
                      <h4 className="font-medium mb-2">Detail Data</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">No</TableHead>
                              <TableHead>Komoditas</TableHead>
                              <TableHead>Responden</TableHead>
                              <TableHead>Lokasi</TableHead>
                              <TableHead>Berat Hasil</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {petugas.dataUbinan.map((item: any, idx: number) => (
                              <TableRow key={item.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="capitalize">
                                  {item.komoditas === 'padi' ? 'Padi' : 
                                  item.komoditas.replace('_', ' ')}
                                </TableCell>
                                <TableCell>{item.responden_name}</TableCell>
                                <TableCell>
                                  <div>{item.desa}</div>
                                  <div className="text-sm text-muted-foreground">{item.kecamatan}</div>
                                  <div className="text-xs text-muted-foreground">{item.code}</div>
                                </TableCell>
                                <TableCell>{item.berat_hasil} kg</TableCell>
                                <TableCell>
                                  {format(new Date(item.tanggal_ubinan), 'dd MMM yyyy', { locale: id })}
                                </TableCell>
                                <TableCell>
                                  {item.status === "belum_diisi" ? (
                                    <Badge variant="outline">Belum Diisi</Badge>
                                  ) : item.status === "sudah_diisi" ? (
                                    <Badge variant="secondary">Menunggu Verifikasi</Badge>
                                  ) : item.status === "dikonfirmasi" ? (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white">Terverifikasi</Badge>
                                  ) : (
                                    <Badge variant="destructive">Ditolak</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
