
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
import { CalendarIcon, FileDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadToExcel } from "@/services/export-service";
import { UserRole } from "@/types/user";
import { 
  getAllStatusPendataanDesa,
  getPendataanDesaStats
} from "@/services/allocation-service";
import { supabase } from "@/integrations/supabase/client";

export default function ProgresPendataanDesaPage() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedPPL, setSelectedPPL] = useState<string>("all");
  const [selectedPML, setSelectedPML] = useState<string>("all");

  const years = [2025, 2026, 2027, 2028, 2029, 2030];

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

  // Fetch PPL users
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

  // Fetch PML users
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

  // Fetch status pendataan desa
  const { 
    data: pendataanStatus = [], 
    isLoading: isLoadingStatus,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['status_pendataan_desa', user?.id, selectedStatus, selectedPPL, selectedPML],
    queryFn: getAllStatusPendataanDesa,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch stats
  const { 
    data: pendataanStats, 
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ['pendataan_stats'],
    queryFn: getPendataanDesaStats,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Filter data based on status, PPL, and PML
  const filteredStatus = pendataanStatus.filter((item: any) => {
    // Filter by search term
    const searchLower = searchTerm.toLowerCase();
    const desaName = item.desa?.name?.toLowerCase() || '';
    const kecamatanName = item.desa?.kecamatan?.name?.toLowerCase() || '';
    const pplName = item.ppl?.name?.toLowerCase() || '';
    
    const matchesSearch = !searchTerm || 
      desaName.includes(searchLower) || 
      kecamatanName.includes(searchLower) ||
      pplName.includes(searchLower);
      
    // Filter by status
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    // Filter by PPL
    const matchesPPL = selectedPPL === 'all' || item.ppl_id === selectedPPL;
    
    // Filter by PML (if applicable)
    const matchesPML = selectedPML === 'all';  // In this simplified version, we don't filter by PML
    
    return matchesSearch && matchesStatus && matchesPPL && matchesPML;
  });

  // Handle export
  const handleExportToExcel = () => {
    if (!filteredStatus.length) return;

    const exportData = filteredStatus.map((item: any, index: number) => ({
      'No': index + 1,
      'Desa': item.desa?.name || '-',
      'Kecamatan': item.desa?.kecamatan?.name || '-',
      'PPL': item.ppl?.name || '-',
      'Status': item.status === 'belum' ? 'Belum Dimulai' : 
               item.status === 'proses' ? 'Dalam Proses' : 'Selesai',
      'Tanggal Mulai': item.tanggal_mulai ? format(new Date(item.tanggal_mulai), 'dd/MM/yyyy') : '-',
      'Tanggal Selesai': item.tanggal_selesai ? format(new Date(item.tanggal_selesai), 'dd/MM/yyyy') : '-',
      'Target': item.target || '-'
    }));

    downloadToExcel(exportData, `rekap-progres-pendataan-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  // Get status badge style
  function getStatusBadge(status: string) {
    if (status === 'belum') {
      return <Badge variant="outline" className="bg-gray-100">Belum Dimulai</Badge>;
    } else if (status === 'proses') {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Dalam Proses</Badge>;
    } else if (status === 'selesai') {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Selesai</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Progres Pendataan Desa</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Desa</CardTitle>
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
                  {pendataanStats?.total || 0}
                </div>
                <div className="h-2 bg-gray-200 rounded-full mt-2">
                  <div 
                    className="h-2 bg-primary rounded-full" 
                    style={{ 
                      width: '100%'
                    }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dalam Proses</CardTitle>
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
                  {pendataanStats?.proses || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {pendataanStats && pendataanStats.total > 0 
                    ? `${Math.round((pendataanStats.proses / pendataanStats.total) * 100)}% dari total` 
                    : '0%'
                  }
                </div>
                <div className="h-2 bg-gray-200 rounded-full mt-2">
                  <div 
                    className="h-2 bg-yellow-500 rounded-full" 
                    style={{ 
                      width: pendataanStats && pendataanStats.total > 0 
                        ? `${(pendataanStats.proses / pendataanStats.total) * 100}%` 
                        : '0%'
                    }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Selesai</CardTitle>
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
                  {pendataanStats?.selesai || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {pendataanStats && pendataanStats.total > 0 
                    ? `${Math.round((pendataanStats.selesai / pendataanStats.total) * 100)}% dari total` 
                    : '0%'
                  }
                </div>
                <div className="h-2 bg-gray-200 rounded-full mt-2">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ 
                      width: pendataanStats && pendataanStats.total > 0 
                        ? `${(pendataanStats.selesai / pendataanStats.total) * 100}%` 
                        : '0%'
                    }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Progres Pendataan</CardTitle>
            <CardDescription>
              Rekap data progres pendataan desa berdasarkan status
            </CardDescription>
          </div>
          <Button onClick={() => refetchStatus()} variant="outline">
            {isLoadingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end mb-6">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="search">Cari</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari desa, kecamatan, petugas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status-select">Status</Label>
              <Select value={selectedStatus} onValueChange={handleChangeStatus}>
                <SelectTrigger id="status-select" className="w-full md:w-[180px]">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="belum">Belum Dimulai</SelectItem>
                  <SelectItem value="proses">Dalam Proses</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(user?.role === UserRole.ADMIN || user?.role === UserRole.VIEWER) && (
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
            )}
            
            <Button 
              variant="outline" 
              className="flex gap-2 items-center" 
              onClick={handleExportToExcel}
              disabled={!filteredStatus.length}
            >
              <FileDown className="h-4 w-4" />
              <span>Export Excel</span>
            </Button>
          </div>

          {isLoadingStatus ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : filteredStatus.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">Tidak ada data progres pendataan yang tersedia</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Desa</TableHead>
                    <TableHead>Kecamatan</TableHead>
                    <TableHead>PPL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Tanggal Selesai</TableHead>
                    <TableHead>Target</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStatus.map((item: any, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.desa?.name || '-'}</TableCell>
                      <TableCell>{item.desa?.kecamatan?.name || '-'}</TableCell>
                      <TableCell>{item.ppl?.name || '-'}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.tanggal_mulai 
                          ? format(new Date(item.tanggal_mulai), 'dd MMM yyyy', { locale: id })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {item.tanggal_selesai 
                          ? format(new Date(item.tanggal_selesai), 'dd MMM yyyy', { locale: id })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{item.target || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
