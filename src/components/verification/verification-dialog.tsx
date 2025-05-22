
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { UbinanData } from "@/types/database-schema";
import { formatDateToLocale } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { UserRole } from "@/types/user";
import { Loader2 } from "lucide-react";
import { CustomTables } from "@/types/supabase-custom";

interface VerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (updatedData?: UbinanData) => void;
  data: UbinanData;
  mode?: 'verify' | 'edit';
}

export function VerificationDialog({
  isOpen,
  onClose,
  onComplete,
  data,
  mode = 'verify'
}: VerificationDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isPPL = user?.role === UserRole.PPL;

  // Form state
  const [responden, setResponden] = useState(data.responden_name || "");
  const [tanggalUbinan, setTanggalUbinan] = useState<Date | undefined>(
    data.tanggal_ubinan ? new Date(data.tanggal_ubinan) : undefined
  );
  const [beratHasil, setBeratHasil] = useState(data.berat_hasil?.toString() || "0");
  const [komentar, setKomentar] = useState(data.komentar || "");
  const [status, setStatus] = useState(data.status || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationValue, setVerificationValue] = useState<string | null>(null);

  // Set default form values when dialog opens with new data
  useEffect(() => {
    if (isOpen && data) {
      setResponden(data.responden_name || "");
      setTanggalUbinan(data.tanggal_ubinan ? new Date(data.tanggal_ubinan) : undefined);
      setBeratHasil(data.berat_hasil?.toString() || "0");
      setKomentar(data.komentar || "");
      setStatus(data.status || "");
      setVerificationValue(null);
    }
  }, [isOpen, data]);

  const handleSubmit = async () => {
    if (!tanggalUbinan) {
      toast.error("Tanggal ubinan harus diisi");
      return;
    }

    if (!beratHasil || parseFloat(beratHasil) <= 0) {
      toast.error("Berat hasil harus lebih dari 0");
      return;
    }

    if (!responden.trim()) {
      toast.error("Nama responden harus diisi");
      return;
    }

    // For verification mode, ensure a verification decision was made
    if (!isPPL && mode === 'verify' && !verificationValue) {
      toast.error("Pilih hasil verifikasi (Konfirmasi atau Tolak)");
      return;
    }

    setIsSubmitting(true);

    try {
      let newStatus = status;
      
      // If PPL is editing, set status to sudah_diisi
      if (isPPL && mode === 'edit') {
        newStatus = 'sudah_diisi';
      } 
      // If PML is verifying, set status based on the selected radio button
      else if (!isPPL && mode === 'verify') {
        newStatus = verificationValue || status;
      }

      const updateData = {
        responden_name: responden,
        tanggal_ubinan: tanggalUbinan.toISOString().split('T')[0],
        berat_hasil: parseFloat(beratHasil),
        komentar: komentar,
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      const { data: updatedData, error } = await supabase
        .from('ubinan_data')
        .update(updateData as CustomTables['ubinan_data']['Update'])
        .eq('id', data.id)
        .select('*')
        .single();

      if (error) {
        console.error("Error updating data:", error);
        toast.error("Gagal menyimpan data");
        return;
      }

      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ['ubinan_data'] });
      
      if (isPPL) {
        queryClient.invalidateQueries({ queryKey: ['ppl_ubinan'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['ubinan_verification'] });
        queryClient.invalidateQueries({ queryKey: ['pml_progress'] });
      }

      // Also invalidate admin-related queries
      queryClient.invalidateQueries({ queryKey: ['admin_verification'] });
      queryClient.invalidateQueries({ queryKey: ['admin_progress'] });
      queryClient.invalidateQueries({ queryKey: ['verification_status'] });

      toast.success("Data berhasil disimpan");
      onComplete(updatedData as unknown as UbinanData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case "belum_diisi":
        return "Belum Diisi";
      case "sudah_diisi":
        return "Menunggu Verifikasi";
      case "dikonfirmasi":
        return "Terverifikasi";
      case "ditolak":
        return "Ditolak";
      default:
        return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isPPL && mode === 'edit' 
              ? "Edit Data Ubinan" 
              : "Verifikasi Data Ubinan"
            }
          </DialogTitle>
          <DialogDescription>
            {isPPL && mode === 'edit'
              ? "Edit data ubinan yang telah disimpan"
              : "Verifikasi data ubinan yang telah diinput oleh PPL"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 items-center gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Komoditas:</span>
              <p className="capitalize">{data.komoditas?.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <p>{renderStatus(status)}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="responden">Nama Responden</Label>
              <Input
                id="responden"
                value={responden}
                onChange={(e) => setResponden(e.target.value)}
                disabled={!isPPL || isSubmitting}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="tanggal">Tanggal Ubinan</Label>
              <DatePicker
                date={tanggalUbinan}
                onSelect={setTanggalUbinan}
                disabled={!isPPL || isSubmitting}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="berat">Berat Hasil (kg)</Label>
              <Input
                id="berat"
                type="number"
                step="0.01"
                value={beratHasil}
                onChange={(e) => setBeratHasil(e.target.value)}
                disabled={!isPPL || isSubmitting}
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="komentar">Komentar</Label>
              <Textarea
                id="komentar"
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                rows={3}
              />
            </div>

            {!isPPL && mode === 'verify' && (
              <div className="grid w-full gap-1.5">
                <Label>Hasil Verifikasi</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="konfirmasi"
                      name="verification"
                      value="dikonfirmasi"
                      onChange={(e) => setVerificationValue(e.target.value)}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="konfirmasi" className="text-sm font-normal">
                      Konfirmasi
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="tolak"
                      name="verification"
                      value="ditolak"
                      onChange={(e) => setVerificationValue(e.target.value)}
                      className="h-4 w-4 border-gray-300 text-destructive focus:ring-destructive"
                    />
                    <Label htmlFor="tolak" className="text-sm font-normal">
                      Tolak
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
