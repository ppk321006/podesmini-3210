
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { PendataanDataItem } from '@/types/pendataan-types';
import { toast } from 'sonner';

interface VerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: PendataanDataItem | null;
  onVerificationComplete: () => void;
  onApprove: (dataId: string) => Promise<void>;
  onReject: (dataId: string, reason: string) => Promise<void>;
}

export function VerificationDialog({
  isOpen,
  onClose,
  data,
  onVerificationComplete,
  onApprove,
  onReject
}: VerificationDialogProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  if (!data) return null;

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await onApprove(data.id);
      toast.success('Data telah disetujui');
      onVerificationComplete();
      onClose();
    } catch (error) {
      console.error('Error approving data:', error);
      toast.error('Gagal menyetujui data');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }

    try {
      setIsRejecting(true);
      await onReject(data.id, rejectionReason);
      toast.success('Data telah ditolak');
      onVerificationComplete();
      onClose();
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting data:', error);
      toast.error('Gagal menolak data');
    } finally {
      setIsRejecting(false);
    }
  };

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

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'belum_verifikasi':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Menunggu Verifikasi
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Disetujui
          </Badge>
        );
      case 'ditolak':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verifikasi Data Pendataan Desa</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Desa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nama Desa</Label>
                  <p className="text-sm font-semibold">{data.desa?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Kecamatan</Label>
                  <p className="text-sm">{data.desa?.kecamatan?.name || '-'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Petugas PPL</Label>
                  <p className="text-sm">{data.ppl?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(data.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tanggal Mulai</Label>
                  <p className="text-sm">
                    {data.tanggal_mulai 
                      ? new Date(data.tanggal_mulai).toLocaleDateString('id-ID')
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tanggal Selesai</Label>
                  <p className="text-sm">
                    {data.tanggal_selesai 
                      ? new Date(data.tanggal_selesai).toLocaleDateString('id-ID')
                      : '-'
                    }
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Status Verifikasi</Label>
                <div className="mt-1">
                  {getVerificationStatusBadge(data.verification_status || 'belum_verifikasi')}
                </div>
              </div>

              {data.catatan_khusus && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Catatan Khusus</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">
                    {data.catatan_khusus}
                  </p>
                </div>
              )}

              {data.rejection_reason && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Alasan Penolakan Sebelumnya</Label>
                  <p className="text-sm bg-red-50 p-3 rounded-md mt-1 text-red-800">
                    {data.rejection_reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verifikasi Actions */}
          {data.verification_status === 'belum_verifikasi' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tindakan Verifikasi</CardTitle>
                <CardDescription>
                  Silakan review data di atas dan pilih tindakan yang sesuai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rejection-reason">Alasan Penolakan (opsional)</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Masukkan alasan jika data ditolak..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={onClose}>
                    Tutup
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isRejecting || isApproving}
                  >
                    {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Tolak
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Setujui
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
