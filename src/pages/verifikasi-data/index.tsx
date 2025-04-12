
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { supabase } from '@/integrations/supabase/client';
import { VerificationDialog } from '@/components/verification/verification-dialog';
import { UbinanData } from '@/types/database-schema';
import { ArrowUpDown, Filter, X } from 'lucide-react';

export default function VerifikasiDataPage() {
  const [selectedUbinan, setSelectedUbinan] = useState<UbinanData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [komoditasFilter, setKomoditasFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data: ubinanData = [], isLoading, refetch } = useQuery({
    queryKey: ['admin_verification'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ubinan_data')
        .select(`
          *,
          nks:nks_id(
            id, code,
            desa:desa_id(
              id, name,
              kecamatan:kecamatan_id(id, name)
            )
          ),
          segmen:segmen_id(
            id, code,
            desa:desa_id(
              id, name,
              kecamatan:kecamatan_id(id, name)
            )
          ),
          ppl:ppl_id(id, name, username),
          pml:pml_id(id, name, username)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching all ubinan data:", error);
        throw error;
      }

      return data.map(item => {
        const desa = item.nks?.desa || item.segmen?.desa;
        const pplName = item.ppl?.name || "Unknown";
        const pmlName = item.pml?.name || "Unknown";

        return {
          ...item,
          desa_name: desa?.name || '-',
          kecamatan_name: desa?.kecamatan?.name || '-',
          ppl_name: pplName,
          pml_name: pmlName
        };
      }) as UbinanData[];
    },
  });

  const { data: progressData = {
    totalData: 0,
    pendingVerification: 0,
    verified: 0,
    rejected: 0
  }, isLoading: isLoadingStats } = useQuery({
    queryKey: ['verification_status'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_verification_status_counts');
      
      if (error) throw error;
      
      // Transform the data into a stats object
      const stats = {
        totalData: 0,
        pendingVerification: 0, 
        verified: 0,
        rejected: 0
      };
      
      data.forEach((item: any) => {
        stats.totalData += parseInt(item.count);
        if (item.status === 'Terverifikasi') stats.verified = parseInt(item.count);
        if (item.status === 'Menunggu Verifikasi') stats.pendingVerification = parseInt(item.count);
        if (item.status === 'Ditolak') stats.rejected = parseInt(item.count);
      });
      
      return stats;
    }
  });

  const filteredData = ubinanData.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesKomoditas = komoditasFilter === 'all' || item.komoditas === komoditasFilter;
    return matchesStatus && matchesKomoditas;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valueA, valueB;
    
    switch (sortColumn) {
      case 'kode':
        valueA = (a.nks?.code || a.segmen?.code || '').toLowerCase();
        valueB = (b.nks?.code || b.segmen?.code || '').toLowerCase();
        break;
      case 'responden':
        valueA = a.responden_name?.toLowerCase() || '';
        valueB = b.responden_name?.toLowerCase() || '';
        break;
      case 'komoditas':
        valueA = a.komoditas?.toLowerCase() || '';
        valueB = b.komoditas?.toLowerCase() || '';
        break;
      case 'tanggal':
        valueA = new Date(a.tanggal_ubinan || '').getTime();
        valueB = new Date(b.tanggal_ubinan || '').getTime();
        break;
      case 'berat':
        valueA = a.berat_hasil || 0;
        valueB = b.berat_hasil || 0;
        break;
      case 'ppl':
        valueA = (a.ppl_name || '').toLowerCase();
        valueB = (b.ppl_name || '').toLowerCase();
        break;
      case 'pml':
        valueA = (a.pml_name || '').toLowerCase();
        valueB = (b.pml_name || '').toLowerCase();
        break;
      case 'lokasi':
        valueA = `${a.kecamatan_name || ''} ${a.desa_name || ''}`.toLowerCase();
        valueB = `${b.kecamatan_name || ''} ${b.desa_name || ''}`.toLowerCase();
        break;
      case 'status':
        valueA = a.status || '';
        valueB = b.status || '';
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleVerify = (ubinan: UbinanData) => {
    setSelectedUbinan(ubinan);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedUbinan(null);
    refetch();
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Verifikasi Data Ubinan</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{progressData.totalData}</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-yellow-700">Menunggu Verifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-700">{progressData.pendingVerification}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-700">Terverifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">{progressData.verified}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-700">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">{progressData.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Data Ubinan</h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm whitespace-nowrap">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-[180px]">
                <SelectTrigger>
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="sudah_diisi">Menunggu Verifikasi</SelectItem>
                  <SelectItem value="dikonfirmasi">Terverifikasi</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                  <SelectItem value="belum_diisi">Belum Diisi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm whitespace-nowrap">Komoditas:</span>
              <Select value={komoditasFilter} onValueChange={setKomoditasFilter} className="w-full sm:w-[180px]">
                <SelectTrigger>
                  <SelectValue placeholder="Filter Komoditas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Komoditas</SelectItem>
                  <SelectItem value="padi">Padi</SelectItem>
                  <SelectItem value="jagung">Jagung</SelectItem>
                  <SelectItem value="kedelai">Kedelai</SelectItem>
                  <SelectItem value="kacang_tanah">Kacang Tanah</SelectItem>
                  <SelectItem value="ubi_kayu">Ubi Kayu</SelectItem>
                  <SelectItem value="ubi_jalar">Ubi Jalar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(statusFilter !== 'all' || komoditasFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setStatusFilter('all');
                  setKomoditasFilter('all');
                }}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" /> Reset
              </Button>
            )}
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
                  <TableRow>
                    <TableHead onClick={() => handleSort('kode')} className="cursor-pointer whitespace-nowrap">
                      Kode {sortColumn === 'kode' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('responden')} className="cursor-pointer whitespace-nowrap">
                      Responden {sortColumn === 'responden' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('komoditas')} className="cursor-pointer whitespace-nowrap">
                      Komoditas {sortColumn === 'komoditas' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('lokasi')} className="cursor-pointer whitespace-nowrap">
                      Kecamatan/Desa {sortColumn === 'lokasi' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('tanggal')} className="cursor-pointer whitespace-nowrap">
                      Tanggal {sortColumn === 'tanggal' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('berat')} className="cursor-pointer whitespace-nowrap">
                      Hasil {sortColumn === 'berat' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('ppl')} className="cursor-pointer whitespace-nowrap">
                      PPL {sortColumn === 'ppl' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('pml')} className="cursor-pointer whitespace-nowrap">
                      PML {sortColumn === 'pml' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer whitespace-nowrap">
                      Status {sortColumn === 'status' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((ubinan) => (
                    <TableRow key={ubinan.id}>
                      <TableCell className="font-medium">
                        {ubinan.nks?.code || ubinan.segmen?.code || '-'}
                      </TableCell>
                      <TableCell>{ubinan.responden_name}</TableCell>
                      <TableCell className="capitalize">{ubinan.komoditas?.replace('_', ' ')}</TableCell>
                      <TableCell>
                        {ubinan.kecamatan_name || '-'} / {ubinan.desa_name || '-'}
                      </TableCell>
                      <TableCell>{ubinan.tanggal_ubinan ? new Date(ubinan.tanggal_ubinan).toLocaleDateString('id-ID') : '-'}</TableCell>
                      <TableCell>{ubinan.berat_hasil} kg</TableCell>
                      <TableCell>{ubinan.ppl_name}</TableCell>
                      <TableCell>{ubinan.pml_name}</TableCell>
                      <TableCell>
                        {ubinan.status === 'dikonfirmasi' && (
                          <Badge className="bg-green-100 text-green-800">Terverifikasi</Badge>
                        )}
                        {ubinan.status === 'ditolak' && (
                          <Badge className="bg-red-100 text-red-800">Ditolak</Badge>
                        )}
                        {ubinan.status === 'sudah_diisi' && (
                          <Badge className="bg-yellow-100 text-yellow-800">Menunggu Verifikasi</Badge>
                        )}
                        {ubinan.status === 'belum_diisi' && (
                          <Badge className="bg-gray-100 text-gray-800">Belum Diisi</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleVerify(ubinan)}
                        >
                          Lihat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedUbinan && (
        <VerificationDialog 
          data={selectedUbinan}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onComplete={handleDialogClose}
          mode="verify"
        />
      )}
    </div>
  );
}
