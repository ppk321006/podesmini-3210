
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UbinanData } from "@/types/database-schema";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";
import { formatDateToLocale } from "@/lib/utils";
import { updateUbinanVerification } from "@/services/wilayah-api";

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: UbinanData;
  onComplete: (updatedData: UbinanData) => void;
}

export function VerificationDialog({ open, onOpenChange, data, onComplete }: VerificationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dokumenDiterima, setDokumenDiterima] = useState(data.dokumen_diterima);
  const [komentar, setKomentar] = useState(data.komentar || "");
  
  const handleVerify = async (status: 'dikonfirmasi' | 'ditolak') => {
    try {
      setLoading(true);
      
      const updatedData = await updateUbinanVerification(
        data.id,
        status,
        dokumenDiterima,
        komentar
      );
      
      onComplete(updatedData);
    } catch (error) {
      console.error("Error updating verification status:", error);
    } finally {
      setLoading(false);
    }
  };

  const allocationType = data.nks_id ? "NKS" : "Segmen";
  const allocationCode = data.nks_id ? data.nks?.code : data.segmen?.code;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Verifikasi Data Ubinan</DialogTitle>
          <DialogDescription>
            Periksa data ubinan dan konfirmasi atau tolak data tersebut.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium">Nama Responden</div>
            <div className="col-span-2">{data.responden_name}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium">Status Sampel</div>
            <div className="col-span-2">{data.sample_status || "Tidak ada"}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium">Alokasi</div>
            <div className="col-span-2">{allocationType}: {allocationCode || "-"}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium">Komoditas</div>
            <div className="col-span-2 capitalize">{data.komoditas.replace('_', ' ')}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium">Tanggal Ubinan</div>
            <div className="col-span-2">{formatDateToLocale(data.tanggal_ubinan)}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium">Berat Hasil</div>
            <div className="col-span-2">{data.berat_hasil} kg</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium">Status</div>
            <div className="col-span-2">
              {data.status === "sudah_diisi" && <Badge className="bg-yellow-500">Menunggu Verifikasi</Badge>}
              {data.status === "dikonfirmasi" && <Badge className="bg-green-500">Dikonfirmasi</Badge>}
              {data.status === "ditolak" && <Badge className="bg-red-500">Ditolak</Badge>}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="font-medium">Dokumen Diterima</div>
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dokumen" 
                  checked={dokumenDiterima} 
                  onCheckedChange={(checked) => setDokumenDiterima(!!checked)}
                />
                <Label htmlFor="dokumen">Ya, dokumen telah diterima</Label>
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="komentar">Komentar</Label>
            <Textarea 
              id="komentar" 
              placeholder="Tambahkan komentar atau catatan" 
              value={komentar} 
              onChange={(e) => setKomentar(e.target.value)} 
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="submit" 
            variant="destructive" 
            onClick={() => handleVerify('ditolak')}
            disabled={loading}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Tolak Data
          </Button>
          <Button 
            type="submit" 
            onClick={() => handleVerify('dikonfirmasi')}
            disabled={loading || !dokumenDiterima}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Konfirmasi Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
