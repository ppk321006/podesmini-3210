
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateUbinanVerification } from '@/services/wilayah-api';
import { UbinanData } from '@/types/database-schema';

interface VerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: UbinanData | null;
  // Add the new props that are being used in verifikasi/index.tsx
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: (updatedData?: UbinanData) => void;
}

export function VerificationDialog({ isOpen, onClose, data, open, onOpenChange, onComplete }: VerificationDialogProps) {
  const [status, setStatus] = useState<'dikonfirmasi' | 'ditolak'>('dikonfirmasi');
  const [komentar, setKomentar] = useState('');
  const queryClient = useQueryClient();

  const verificationMutation = useMutation({
    mutationFn: ({ id, status, komentar }: { id: string; status: string; komentar: string }) =>
      updateUbinanVerification(id, status, komentar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-data'] });
      toast.success('Data berhasil diverifikasi');
      handleClose();
      // Call the onComplete callback if it exists
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      console.error('Error verifying data:', error);
      toast.error('Gagal memverifikasi data');
    },
  });

  const handleSubmit = () => {
    if (!data?.id) return;
    
    verificationMutation.mutate({
      id: data.id,
      status,
      komentar,
    });
  };

  const handleClose = () => {
    setStatus('dikonfirmasi');
    setKomentar('');
    onClose();
    // Call onOpenChange if it exists
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Use either isOpen or open based on which is provided
  const dialogOpen = open !== undefined ? open : isOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange || handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verifikasi Data Ubinan</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="status">Status Verifikasi</Label>
            <RadioGroup value={status} onValueChange={(value: 'dikonfirmasi' | 'ditolak') => setStatus(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dikonfirmasi" id="dikonfirmasi" />
                <Label htmlFor="dikonfirmasi">Terima</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ditolak" id="ditolak" />
                <Label htmlFor="ditolak">Tolak</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="komentar">Komentar</Label>
            <Textarea
              id="komentar"
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              placeholder="Tambahkan komentar tentang verifikasi data ini..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={verificationMutation.isPending}
          >
            {verificationMutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
