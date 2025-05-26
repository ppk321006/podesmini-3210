
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PendataanDataItem } from '@/types/pendataan-types';

interface ProgressTableSimplifiedProps {
  data: PendataanDataItem[];
  isLoading: boolean;
}

export function ProgressTableSimplified({ data, isLoading }: ProgressTableSimplifiedProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'belum':
        return <Badge variant="outline">Belum Dikerjakan</Badge>;
      case 'proses':
        return <Badge variant="secondary">Sedang Dikerjakan</Badge>;
      case 'selesai':
        return <Badge className="bg-green-500 text-white">Selesai</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Pendataan Desa</CardTitle>
          <CardDescription>Daftar progress pendataan per desa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Pendataan Desa</CardTitle>
        <CardDescription>Daftar progress pendataan per desa</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Desa</TableHead>
              <TableHead>Kecamatan</TableHead>
              <TableHead>PPL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Mulai</TableHead>
              <TableHead>Tanggal Selesai</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500">Tidak ada data pendataan desa</p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.desa?.name || '-'}</TableCell>
                  <TableCell>{item.desa?.kecamatan?.name || '-'}</TableCell>
                  <TableCell>{item.ppl?.name || '-'}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    {item.tanggal_mulai 
                      ? new Date(item.tanggal_mulai).toLocaleDateString('id-ID')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {item.tanggal_selesai 
                      ? new Date(item.tanggal_selesai).toLocaleDateString('id-ID')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{item.persentase_selesai || 0}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
