import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Loader2, AlertCircle, CheckCircle, XCircle, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PendataanDataItem } from '@/types/pendataan-types';

export default function VerifikasiDataPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedData, setSelectedData] = useState<PendataanDataItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [rejectionReason, setRejectionReason] = useState('');
  const [dialogMode, setDialogMode] = useState<'approve' | 'reject'>('approve');

  const { data: pendataanData = [], isLoading, refetch, error } = useQuery({
    queryKey: ['verifikasi_data', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch data pendataan for PML to verify
      const { data: alokasiData, error: alokasiError } = await supabase
        .from('alokasi_petugas')
        .select('ppl_id')
        .eq('pml_id', user.id);
      
      if (alokasiError) throw alokasiError;
      
      // Get PPLs supervised by this PML
      const { data: pplsData, error: pplsError } = await supabase
        .from('users')
        .select('id')
        .eq('pml_id', user.id);
        
      if (pplsError) throw pplsError;
      
      // Combine both sources of PPL IDs
      const alokasiPplIds = alokasiData.map(item => item.ppl_id);
      const directPplIds = pplsData.map(item => item.id);
      const allPplIds = [...new Set([...alokasiPplIds, ...directPplIds])];
      
      if (allPplIds.length === 0) return [];
      
      // Get all pendataan data from these PPLs
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .select(`
          id,
          desa_id,
          ppl_id,
          jumlah_keluarga,
          jumlah_lahan_pertanian,
          status_infrastruktur,
          potensi_ekonomi,
          catatan_khusus,
          status,
          tanggal_mulai,
          tanggal_selesai,
          verification_status,
          rejection_reason,
          desa:desa_id(
            id, 
            name,
            kecamatan:kecamatan_id(
              id,
              name
            )
          ),
          ppl:ppl_id(
            id,
            name,
            username
          )
        `)
        .in('ppl_id', allPplIds);
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Mutations for approve/reject
  const approveMutation = useMutation({
    mutationFn: async (dataId: string) => {
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .update({ verification_status: 'approved' })
        .eq('id', dataId)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Data berhasil disetujui");
      setIsDialogOpen(false);
      setSelectedData(null);
      queryClient.invalidateQueries({ queryKey: ['verifikasi_data'] });
    },
    onError: (error) => {
      console.error("Error approving data:", error);
      toast.error("Gagal menyetujui data");
    }
  });
  
  const rejectMutation = useMutation({
    mutationFn: async ({ dataId, reason }: { dataId: string, reason: string }) => {
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .update({ 
          verification_status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', dataId)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Data telah ditolak");
      setIsDialogOpen(false);
      setSelectedData(null);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['verifikasi_data'] });
    },
    onError: (error) => {
      console.error("Error rejecting data:", error);
      toast.error("Gagal menolak data");
    }
  });
  
  // Calculate statistics
  const progressData = {
    pendingVerification: pendataanData.filter(item => item.status === 'selesai' && item.verification_status === 'belum_verifikasi').length,
    verified: pendataanData.filter(item => item.verification_status === 'approved').length,
    rejected: pendataanData.filter(item => item.verification_status === 'rejected').length,
    total: pendataanData.length
  };

  // Format date function (only defined once)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  // Fix the affected sorting function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort data
  const getFilteredAndSortedData = () => {
    // Apply filter
    let filtered = pendataanData;
    
    if (filterStatus !== 'all') {
      if (filterStatus === 'belum_verifikasi') {
        filtered = filtered.filter(item => item.status === 'selesai' && item.verification_status === 'belum_verifikasi');
      } else {
        filtered = filtered.filter(item => item.verification_status === filterStatus);
      }
    }
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item: any) => {
        return (
          (item.desa?.name?.toLowerCase().includes(searchLower)) ||
          (item.desa?.kecamatan?.name?.toLowerCase().includes(searchLower)) ||
          (item.ppl?.name?.toLowerCase().includes(searchLower)) ||
          (item.status_infrastruktur && item.status_infrastruktur.toLowerCase().includes(searchLower)) ||
          (item.potensi_ekonomi && item.potensi_ekonomi.toLowerCase().includes(searchLower)) ||
          (item.catatan_khusus && item.catatan_khusus.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Sort data
    if (sortColumn) {
      filtered = [...filtered].sort((a: any, b: any) => {
        let valueA, valueB;
        
        switch (sortColumn) {
          case 'desa':
            valueA = a.desa?.name || '';
            valueB = b.desa?.name || '';
            break;
          case 'kecamatan':
            valueA = a.desa?.kecamatan?.name || '';
            valueB = b.desa?.kecamatan?.name || '';
            break;
          case 'ppl':
            valueA = a.ppl?.name || '';
            valueB = b.ppl?.name || '';
            break;
          case 'tanggal':
            valueA = a.tanggal_selesai ? new Date(a.tanggal_selesai).getTime() : 0;
            valueB = b.tanggal_selesai ? new Date(b.tanggal_selesai).getTime() : 0;
            break;
          case 'status':
            valueA = a.verification_status || '';
            valueB = b.verification_status || '';
            break;
          default:
            return 0;
        }
        
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  };
  
  const sortedData = getFilteredAndSortedData();
  
  // Handle approve/reject actions
  const handleApprove = () => {
    if (!selectedData) return;
    approveMutation.mutate(selectedData.id);
  };
  
  const handleReject = () => {
    if (!selectedData) return;
    
    if (!rejectionReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }
    
    rejectMutation.mutate({ 
      dataId: selectedData.id, 
      reason: rejectionReason 
    });
  };

  // Get status badge
  const getStatusBadge = (status: string, verificationStatus: string) => {
    if (verificationStatus === 'approved') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui</Badge>;
    } else if (verificationStatus === 'rejected') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Ditolak</Badge>;
    } else if (status === 'selesai') {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Menunggu Verifikasi</Badge>;
    } else if (status === 'proses') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Sedang Dikerjakan</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Belum Dikerjakan</Badge>;
    }
  };
  
  // Open verification dialog
  const openVerificationDialog = (data: PendataanDataItem, mode: 'approve' | 'reject') => {
    setSelectedData(data);
    setDialogMode(mode);
    setIsDialogOpen(true);
    
    if (mode === 'reject') {
      setRejectionReason(data.rejection_reason || '');
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
  
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-500 mb-4">Terjadi kesalahan saat memuat data verifikasi</p>
            <Button onClick={() => refetch()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Verifikasi Data Desa</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-orange-800">Menunggu Verifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-800">{progressData.pendingVerification}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-700">Terverifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">{progressData.verified}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-700">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">{progressData.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Data Desa</h2>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-[250px]"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="belum_verifikasi">Menunggu Verifikasi</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      ) : sortedData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-500">Tidak ada data yang tersedia</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary text-secondary-foreground">
                    <TableHead onClick={() => handleSort('desa')} className="cursor-pointer">
                      Desa {sortColumn === 'desa' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('kecamatan')} className="cursor-pointer">
                      Kecamatan {sortColumn === 'kecamatan' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('ppl')} className="cursor-pointer">
                      PPL {sortColumn === 'ppl' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('tanggal')} className="cursor-pointer">
                      Selesai {sortColumn === 'tanggal' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                      Status {sortColumn === 'status' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.desa?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {item.desa?.kecamatan?.name || '-'}
                      </TableCell>
                      <TableCell>{item.ppl?.name || '-'}</TableCell>
                      <TableCell>{formatDate(item.tanggal_selesai)}</TableCell>
                      <TableCell>
                        {getStatusBadge(item.status, item.verification_status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openVerificationDialog(item, 'approve')}
                          >
                            {item.verification_status === 'approved' ? 'Detail' : 'Setujui'}
                          </Button>
                          
                          {item.verification_status !== 'approved' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openVerificationDialog(item, 'reject')}
                              className={item.verification_status === 'rejected' ? '' : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'}
                            >
                              {item.verification_status === 'rejected' ? 'Lihat Alasan' : 'Tolak'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Dialog */}
      {selectedData && (
        <Dialog open={isDialogOpen && dialogMode === 'approve'} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setSelectedData(null);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedData.verification_status === 'approved' ? 'Detail Data' : 'Verifikasi Data'}
              </DialogTitle>
              <DialogDescription>
                Data desa {selectedData.desa?.name || ''}, kecamatan {selectedData.desa?.kecamatan?.name || ''}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="font-semibold mb-1">Detail Desa</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Desa:</span>
                    <span className="col-span-2">{selectedData.desa?.name || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Kecamatan:</span>
                    <span className="col-span-2">{selectedData.desa?.kecamatan?.name || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Petugas:</span>
                    <span className="col-span-2">{selectedData.ppl?.name || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Tanggal Selesai:</span>
                    <span className="col-span-2">{formatDate(selectedData.tanggal_selesai)}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="col-span-2">{getStatusBadge(selectedData.status, selectedData.verification_status)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Data Pendataan</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Jumlah Keluarga:</span>
                    <span className="col-span-2">{selectedData.jumlah_keluarga || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Lahan Pertanian:</span>
                    <span className="col-span-2">{selectedData.jumlah_lahan_pertanian || '-'} Ha</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <div>
                <h3 className="font-semibold">Status Infrastruktur</h3>
                <p className="text-sm">{selectedData.status_infrastruktur || '-'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Potensi Ekonomi</h3>
                <p className="text-sm">{selectedData.potensi_ekonomi || '-'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Catatan</h3>
                <p className="text-sm">{selectedData.catatan_khusus || '-'}</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {selectedData.verification_status === 'approved' ? 'Tutup' : 'Batal'}
              </Button>
              
              {selectedData.verification_status !== 'approved' && (
                <div className="flex gap-2">
                  <Button 
                    variant="default"
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Setujui
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      openVerificationDialog(selectedData, 'reject');
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Tolak
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Rejection Dialog */}
      {selectedData && (
        <Dialog open={isDialogOpen && dialogMode === 'reject'} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setSelectedData(null);
            setRejectionReason('');
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedData.verification_status === 'rejected' ? 'Detail Penolakan' : 'Tolak Data'}
              </DialogTitle>
              <DialogDescription>
                {selectedData.verification_status === 'rejected' 
                  ? `Alasan penolakan data desa ${selectedData?.desa?.name || ''}`
                  : `Berikan alasan penolakan untuk data desa ${selectedData?.desa?.name || ''}`
                }
              </DialogDescription>
            </DialogHeader>
            
            {selectedData.verification_status === 'rejected' ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="font-semibold text-red-800 mb-2">Alasan Penolakan:</h3>
                <p className="text-red-700">{selectedData.rejection_reason || 'Tidak ada alasan yang diberikan'}</p>
              </div>
            ) : (
              <Textarea 
                placeholder="Masukkan alasan penolakan..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[120px]"
                disabled={rejectMutation.isPending}
              />
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {selectedData.verification_status === 'rejected' ? 'Tutup' : 'Batal'}
              </Button>
              
              {selectedData.verification_status !== 'rejected' && (
                <Button 
                  variant="default"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <XCircle className="mr-1 h-4 w-4" />
                  Tolak Data
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
