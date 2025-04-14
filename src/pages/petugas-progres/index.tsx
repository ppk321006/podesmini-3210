import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, FileDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { downloadToExcel } from "@/services/export-service";

function getCurrentYear() {
  return new Date().getFullYear();
}

function getCurrentMonthNumber() {
  return new Date().getMonth() + 1; // JavaScript months are 0-indexed
}

function getSubroundFromMonth(month: number): number {
  if (month >= 1 && month <= 4) return 1;
  if (month >= 5 && month <= 8) return 2;
  return 3;
}

export default function PetugasProgresPage() {
  const [year, setYear] = useState<number>(getCurrentYear());
  const [month, setMonth] = useState<number>(getCurrentMonthNumber());
  const [subround, setSubround] = useState<number>(getSubroundFromMonth(getCurrentMonthNumber()));
  const [status, setStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    setSubround(getSubroundFromMonth(month));
  }, [month]);

  useEffect(() => {
    if (date) {
      setMonth(date.getMonth() + 1);
      setYear(date.getFullYear());
    }
  }, [date]);

  const { data: petugasProgres = [], isLoading } = useQuery({
    queryKey: ['petugas_progres', year, month, subround, status],
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

      query = query.filter('tanggal_ubinan', 'gte', `${year}-01-01`);
      query = query.filter('tanggal_ubinan', 'lte', `${year}-12-31`);

      if (month > 0) {
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDay = new Date(year, month, 0).getDate(); // Get last day of month
        const endDate = `${year}-${month.toString().padStart(2, '0')}-${endDay}`;
        
        query = query.filter('tanggal_ubinan', 'gte', startDate);
        query = query.filter('tanggal_ubinan', 'lte', endDate);
      } 
      else if (subround > 0) {
        const startMonth = (subround - 1) * 4 + 1;
        const endMonth = subround * 4;
        
        const startDate = `${year}-${startMonth.toString().padStart(2, '0')}-01`;
        const endDay = new Date(year, endMonth + 1, 0).getDate(); // Get last day of end month
        const endDate = `${year}-${endMonth.toString().padStart(2, '0')}-${endDay}`;
        
        query = query.filter('tanggal_ubinan', 'gte', startDate);
        query = query.filter('tanggal_ubinan', 'lte', endDate);
      }

      if (status !== "all") {
        query = query.eq('status', status);
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
    refetchOnWindowFocus: false,
  });

  const filteredPetugas = petugasProgres.filter((petugas: any) => {
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
      return petugas.dataUbinan.map((data: any) => ({
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
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Rekap Progres Petugas</CardTitle>
          <CardDescription>
            Rekap data hasil input petugas ubinan berdasarkan periode dan status
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
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="month-select">Bulan</Label>
              <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
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
              <Select value={subround.toString()} onValueChange={(value) => setSubround(parseInt(value))}>
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
              <Select value={status} onValueChange={setStatus}>
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

          {isLoading ? (
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
                    <Tabs defaultValue="summary" className="w-full">
                      <div className="border-b px-4">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="summary">Ringkasan</TabsTrigger>
                          <TabsTrigger value="details">Detail Data</TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <TabsContent value="summary" className="p-4">
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
                      </TabsContent>
                      
                      <TabsContent value="details" className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Komoditas</TableHead>
                                <TableHead>Responden</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead>Berat Hasil</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {petugas.dataUbinan.map((item: any) => (
                                <TableRow key={item.id}>
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
                                      <Badge className="bg-green-500 hover:bg-green-600">Terverifikasi</Badge>
                                    ) : (
                                      <Badge variant="destructive">Ditolak</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    </Tabs>
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
