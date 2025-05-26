
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PendataanDataItem, VerificationStatus } from '@/types/pendataan-types';
import { UserRole } from '@/types/user';
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { verifyPendataanData } from '@/services/verification-service';
import { Loader2, ArrowUpDown, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function VerifikasiPage() {
  const { user } = useAuth();
  const [pendataanData, setPendataanData] = useState<PendataanDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering and sorting states
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Verification dialog states
  const [selectedData, setSelectedData] = useState<PendataanDataItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('belum_verifikasi');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id && user.role === UserRole.PML) {
      fetchData();
    } else {
      setIsLoading(false);
      if (user?.role !== UserRole.PML) {
        setError("Anda tidak memiliki akses ke halaman ini. Silakan login sebagai PML.");
      } else {
        setError("User ID tidak ditemukan. Silakan login kembali.");
      }
    }
  }, [user?.id, user?.role]);

  const fetchData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      setError("User ID tidak ditemukan");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Get desa IDs that are allocated to PPLs under this PML
      const { data: alokasiData, error: alokasiError } = await supabase
        .from('alokasi_petugas')
        .select(`
          desa_id,
          ppl:ppl_id(
            id,
            pml_id
          )
        `)
        .eq('ppl.pml_id', user.id);

      if (alokasiError) {
        console.error('Error fetching alokasi data:', alokasiError);
        setError("Gagal mengambil data alokasi");
        return;
      }

      if (!alokasiData || alokasiData.length === 0) {
        setPendataanData([]);
        setIsLoading(false);
        return;
      }

      // Extract desa IDs that belong to this PML's area
      const desaIds = alokasiData.map(item => item.desa_id);

      // Get pendataan data only for desa in this PML's area - only completed data that needs verification
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .select(`
          *,
          desa:desa_id (
            id,
            name,
            kecamatan:kecamatan_id (
              id,
              name
            )
          ),
          ppl:ppl_id (
            id,
            name,
            username
          )
        `)
        .in('desa_id', desaIds)
        .eq('status', 'selesai')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching progress data:', error);
        toast.error('Gagal memuat data progress');
        return;
      }
      
      setPendataanData(data || []);
      
    } catch (error: any) {
      console.error('Error in fetchData:', error);
      setError(error.message || "Gagal memuat data");
      toast.error(error.message || "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const handleVerifyClick = (data: PendataanDataItem) => {
    setSelectedData(data);
    setVerificationStatus('belum_verifikasi');
    setRejectionReason('');
    setIsDialogOpen(true);
  };
  
  const handleVerifySubmit = async () => {
    if (!selectedData) return;
    
    setIsSubmitting(true);
    
    try {
      await verifyPendataanData(
        selectedData.id,
        verificationStatus,
        verificationStatus === 'ditolak' ? rejectionReason : undefined
      );
      
      toast.success(
        verificationStatus === 'approved' 
          ? "Data berhasil diverifikasi dan disetujui" 
          : "Data ditolak dan dikembalikan untuk perbaikan"
      );
      
      setIsDialogOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error verifying data:", error);
      toast.error("Gagal memverifikasi data");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter data based on search term and status filter
  const filteredData = pendataanData.filter(item => {
    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'belum_verifikasi' && item.verification_status !== 'belum_verifikasi') {
        return false;
      } else if (filterStatus === 'approved' && item.verification_status !== 'approved') {
        return false;
      } else if (filterStatus === 'ditolak' && item.verification_status !== 'ditolak') {
        return false;
      }
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const desaName = item.desa?.name || '';
      const kecamatanName = item.desa?.kecamatan?.name || '';
      const pplName = item.ppl?.name || '';
      
      return (
        desaName.toLowerCase().includes(searchLower) ||
        kecamatanName.toLowerCase().includes(searchLower) ||
        pplName.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Sort the filtered data based on sort column and direction
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valueA, valueB;
    
    switch (sortColumn) {
      case 'desa':
        valueA = a.desa?.name || '';
        valueB = b.desa?.name || '';
        break;
      case 'status':
        valueA = a.verification_status;
        valueB = b.verification_status;
        break;
      case 'tanggal_mulai':
        valueA = a.tanggal_mulai ? new Date(a.tanggal_mulai).getTime() : 0;
        valueB = b.tanggal_mulai ? new Date(b.tanggal_mulai).getTime() : 0;
        break;
      case 'tanggal_selesai':
        valueA = a.tanggal_selesai ? new Date(a.tanggal_selesai).getTime() : 0;
        valueB = b.tanggal_selesai ? new Date(b.tanggal_selesai).getTime() : 0;
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  const renderVerificationStatus = (status: VerificationStatus) => {
    switch (status) {
      case 'belum_verifikasi':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Menunggu Verifikasi</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui</Badge>;
      case 'ditolak':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return null;
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
  
  if (user.role !== UserRole.PML) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Akses Ditolak</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-red-500 mb-4 text-center">
              Anda tidak memiliki akses ke halaman ini. Halaman ini hanya dapat diakses oleh petugas dengan peran PML.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-2 text-gray-500">Memuat data pendataan...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchData()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Verifikasi Data Pendataan</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div className="w-full md:w-64">
          <Label htmlFor="filter-status">Filter Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="filter-status">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="belum_verifikasi">Menunggu Verifikasi</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto flex-1">
          <Label htmlFor="search">Cari</Label>
          <Input
            id="search"
            placeholder="Cari berdasarkan nama desa"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline" onClick={fetchData}>
          Refresh Data
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Pendataan Desa</CardTitle>
          <CardDescription>
            Verifikasi data pendataan yang telah diselesaikan oleh PPL
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {pendataanData.length === 0 
                  ? "Tidak ada data pendataan yang perlu diverifikasi" 
                  : "Tidak ada data yang sesuai filter"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('desa')} className="cursor-pointer">
                      Nama Desa {sortColumn === 'desa' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                      Status {sortColumn === 'status' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead onClick={() => handleSort('tanggal_mulai')} className="cursor-pointer">
                      Tanggal Mulai {sortColumn === 'tanggal_mulai' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('tanggal_selesai')} className="cursor-pointer">
                      Tanggal Selesai {sortColumn === 'tanggal_selesai' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.desa?.name || '-'}</TableCell>
                      <TableCell>{renderVerificationStatus(item.verification_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${item.persentase_selesai || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{item.persentase_selesai || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.tanggal_mulai 
                          ? format(new Date(item.tanggal_mulai), 'dd MMM yyyy', { locale: id })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {item.tanggal_selesai 
                          ? format(new Date(item.tanggal_selesai), 'dd MMM yyyy', { locale: id })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={item.verification_status === 'belum_verifikasi' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleVerifyClick(item)}
                          disabled={false}
                        >
                          {item.verification_status === 'belum_verifikasi' 
                            ? 'Verifikasi' 
                            : 'Lihat Detail'}
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
      
      {selectedData && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Verifikasi Data Pendataan</DialogTitle>
              <DialogDescription>
                {selectedData.verification_status === 'belum_verifikasi'
                  ? "Verifikasi data pendataan desa yang telah diselesaikan oleh PPL"
                  : "Detail data pendataan desa"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">Desa</Label>
                  <p className="font-medium">{selectedData.desa?.name || '-'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">Kecamatan</Label>
                  <p className="font-medium">{selectedData.desa?.kecamatan?.name || '-'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">PPL</Label>
                  <p className="font-medium">{selectedData.ppl?.name || '-'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">Tanggal Selesai</Label>
                  <p className="font-medium">
                    {selectedData.tanggal_selesai 
                      ? format(new Date(selectedData.tanggal_selesai), 'dd MMM yyyy', { locale: id })
                      : '-'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Catatan Khusus</Label>
                <p className="font-medium">{selectedData.catatan_khusus || '-'}</p>
              </div>
              
              {selectedData.verification_status === 'belum_verifikasi' && (
                <div className="space-y-2">
                  <Label>Status Verifikasi</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant={verificationStatus === 'approved' ? 'default' : 'outline'}
                        className={verificationStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => setVerificationStatus('approved')}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Setujui
                      </Button>
                    </div>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant={verificationStatus === 'ditolak' ? 'destructive' : 'outline'}
                        onClick={() => setVerificationStatus('ditolak')}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Tolak
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {verificationStatus === 'ditolak' && selectedData.verification_status === 'belum_verifikasi' && (
                <div className="space-y-2">
                  <Label>Alasan Penolakan</Label>
                  <Textarea
                    placeholder="Masukkan alasan penolakan data ini"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
              
              {selectedData.verification_status === 'ditolak' && selectedData.rejection_reason && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Alasan Penolakan</Label>
                  <p className="font-medium text-red-600">{selectedData.rejection_reason}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {selectedData.verification_status === 'belum_verifikasi' ? 'Batal' : 'Tutup'}
              </Button>
              {selectedData.verification_status === 'belum_verifikasi' && (
                <Button 
                  onClick={handleVerifySubmit} 
                  disabled={isSubmitting || (verificationStatus === 'ditolak' && !rejectionReason)}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {verificationStatus === 'approved' ? 'Setujui Data' : 'Tolak Data'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
