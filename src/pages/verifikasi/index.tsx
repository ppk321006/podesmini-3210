
import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VerificationDialog } from '@/components/verification/verification-dialog';
import { getUbinanDataForVerification } from '@/services/wilayah-api';
import { UbinanData } from '@/types/database-schema';

export default function VerifikasiPage() {
  const { user } = useAuth();
  const [selectedUbinan, setSelectedUbinan] = useState<UbinanData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const { data: ubinanData = [], isLoading, refetch } = useQuery({
    queryKey: ['ubinan_verification', user?.id],
    queryFn: () => getUbinanDataForVerification(user?.id || ''),
    enabled: !!user?.id,
  });

  // Filter data based on status
  const filteredData = filter === 'all' 
    ? ubinanData 
    : ubinanData.filter(item => item.status === filter);

  // Group data by status for summary
  const summary = {
    total: ubinanData.length,
    sudah_diisi: ubinanData.filter(item => item.status === 'sudah_diisi').length,
    dikonfirmasi: ubinanData.filter(item => item.status === 'dikonfirmasi').length,
    ditolak: ubinanData.filter(item => item.status === 'ditolak').length,
    belum_diisi: ubinanData.filter(item => item.status === 'belum_diisi').length,
  };

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
            <p className="text-3xl font-bold">{summary.total}</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-yellow-700">Menunggu Verifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-700">{summary.sudah_diisi}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-700">Terverifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">{summary.dikonfirmasi}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-700">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">{summary.ditolak}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Data Ubinan</h2>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Filter Status:</label>
            <Select value={filter} onValueChange={setFilter}>
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
        <div className="text-center py-8">Loading...</div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-500">Tidak ada data yang tersedia</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Responden</TableHead>
                  <TableHead>Komoditas</TableHead>
                  <TableHead>Tanggal Ubinan</TableHead>
                  <TableHead>Berat Hasil</TableHead>
                  <TableHead>PPL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((ubinan) => (
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
                    <TableCell>{ubinan.komoditas.replace('_', ' ')}</TableCell>
                    <TableCell>{new Date(ubinan.tanggal_ubinan).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{ubinan.berat_hasil} kg</TableCell>
                    <TableCell>{ubinan.ppl?.name}</TableCell>
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
          </CardContent>
        </Card>
      )}

      {selectedUbinan && (
        <VerificationDialog 
          ubinanData={selectedUbinan}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}
