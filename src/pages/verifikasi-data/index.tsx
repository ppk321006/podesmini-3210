import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { VerificationDialog } from '@/components/verification/verification-dialog';
import { getUbinanDataByPML, getProgressByPML } from '@/services/progress-service';
import { UbinanData } from '@/types/database-schema';
import { ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function VerifikasiPage() {
  const { user } = useAuth();
  const [selectedUbinan, setSelectedUbinan] = useState<UbinanData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data: ubinanData = [], isLoading, refetch } = useQuery({
    queryKey: ['ubinan_verification', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
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
          ppl:ppl_id(id, name, username)
        `)
        .eq('pml_id', user.id);
        
      if (error) {
        console.error("Error fetching ubinan data:", error);
        throw error;
      }
      
      const processedData = data.map(item => {
        const desa = item.nks?.desa || item.segmen?.desa;
        
        let pplName = "Unknown";
        if (item.ppl && typeof item.ppl === 'object' && item.ppl !== null) {
          if (typeof item.ppl === 'string') {
            pplName = item.ppl;
          } else {
            const pplObj = item.ppl as any;
            if (pplObj && pplObj.name) {
              pplName = pplObj.name;
            }
          }
        }
          
        return {
          ...item,
          desa_name: desa?.name || '-',
          kecamatan_name: desa?.kecamatan?.name || '-',
          ppl_name: pplName
        };
      });
      
      return processedData as unknown as UbinanData[];
    },
    enabled: !!user?.id,
  });

  const { data: progressData = { 
    totalPadi: 0, 
    totalPalawija: 0, 
    pendingVerification: 0, 
    verified: 0, 
    rejected: 0 
  }, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['pml_progress', user?.id],
    queryFn: () => getProgressByPML(user?.id || ''),
    enabled: !!user?.id,
  });

  const filteredData = filter === 'all' 
    ? ubinanData 
    : ubinanData.filter(item => item.status === filter);

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
        valueA = a.responden_name.toLowerCase();
        valueB = b.responden_name.toLowerCase();
        break;
      case 'komoditas':
        valueA = a.komoditas.toLowerCase();
        valueB = b.komoditas.toLowerCase();
        break;
      case 'tanggal':
        valueA = new Date(a.tanggal_ubinan).getTime();
        valueB = new Date(b.tanggal_ubinan).getTime();
        break;
      case 'berat':
        valueA = a.berat_hasil;
        valueB = b.berat_hasil;
        break;
      case 'ppl':
        valueA = (a.ppl_name || '').toLowerCase();
        valueB = (b.ppl_name || '').toLowerCase();
        break;
      case 'lokasi':
        valueA = `${a.kecamatan_name || ''} ${a.desa_name || ''}`.toLowerCase();
        valueB = `${b.kecamatan_name || ''} ${b.desa_name || ''}`.toLowerCase();
        break;
      case 'komentar':
        valueA = (a.komentar || '').toLowerCase();
        valueB = (b.komentar || '').toLowerCase();
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
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

  const handleDialogClose = (updatedData?: UbinanData) => {
    setIsDialogOpen(false);
    setSelectedUbinan(null);
    refetch();
  };

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterKomoditas, setFilterKomoditas] = useState('all');

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Verifikasi Data Ubinan</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ubinanData.length}</p>
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
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Data Ubinan</h2>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Filter Status:</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
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
                    <TableHead onClick={() => handleSort('kode')} className="cursor-pointer">
                      Kode {sortColumn === 'kode' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('responden')} className="cursor-pointer">
                      Responden {sortColumn === 'responden' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('komoditas')} className="cursor-pointer">
                      Komoditas {sortColumn === 'komoditas' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('lokasi')} className="cursor-pointer">
                      Kecamatan/Desa {sortColumn === 'lokasi' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('tanggal')} className="cursor-pointer">
                      Tanggal {sortColumn === 'tanggal' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('berat')} className="cursor-pointer">
                      Berat Hasil {sortColumn === 'berat' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('ppl')} className="cursor-pointer">
                      PPL {sortColumn === 'ppl' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('komentar')} className="cursor-pointer">
                      Komentar {sortColumn === 'komentar' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                      Status {sortColumn === 'status' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                    </TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((ubinan) => (
                    <TableRow key={ubinan.id}>
                      <TableCell className="font-medium">
                        {ubinan.nks?.code || ubinan.segmen?.code || '-'}
                      </TableCell>
                      <TableCell>
                        {ubinan.responden_name}
                        {ubinan.sample_status && (
                          <Badge variant="outline" className="ml-2">
                            {ubinan.sample_status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{ubinan.komoditas.replace('_', ' ')}</TableCell>
                      <TableCell>
                        {ubinan.kecamatan_name} / {ubinan.desa_name}
                      </TableCell>
                      <TableCell>{new Date(ubinan.tanggal_ubinan).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{ubinan.berat_hasil} kg</TableCell>
                      <TableCell>{ubinan.ppl_name}</TableCell>
                      <TableCell>
                        <span className="line-clamp-2">{ubinan.komentar || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ubinan.status === 'dikonfirmasi'
                              ? 'bg-green-100 text-green-800'
                              : ubinan.status === 'ditolak'
                              ? 'bg-red-100 text-red-800'
                              : ubinan.status === 'sudah_diisi'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {ubinan.status === 'dikonfirmasi'
                            ? 'Terverifikasi'
                            : ubinan.status === 'ditolak'
                            ? 'Ditolak'
                            : ubinan.status === 'sudah_diisi'
                            ? 'Menunggu Verifikasi'
                            : 'Belum Diisi'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant={ubinan.status === 'sudah_diisi' ? 'default' : 'outline'}
                          size="sm" 
                          disabled={ubinan.status !== 'sudah_diisi'}
                          onClick={() => handleVerify(ubinan)}
                        >
                          Verifikasi
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
        />
      )}
    </div>
  );
}
