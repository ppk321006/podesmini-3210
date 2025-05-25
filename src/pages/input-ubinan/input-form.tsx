import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { PendataanDataItem, PendataanStatus } from "@/types/pendataan-types";
import { submitOrUpdatePendataanData } from "@/services/pendataan-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface InputDataFormProps {
  initialData: PendataanDataItem | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface UploadedFile {
  name: string;
  url: string;
  fileId: string;
  mimeType: string;
}

export function InputDataForm({ initialData, onCancel, onSuccess }: InputDataFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Form state
  const [status, setStatus] = useState<PendataanStatus>(initialData?.status || "belum");
  const [catatanKhusus, setCatatanKhusus] = useState<string>(initialData?.catatan_khusus || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [tanggalMulai, setTanggalMulai] = useState<Date | undefined>(
    initialData?.tanggal_mulai ? new Date(initialData.tanggal_mulai) : undefined
  );
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | undefined>(
    initialData?.tanggal_selesai ? new Date(initialData.tanggal_selesai) : undefined
  );

  useEffect(() => {
    if (initialData) {
      setStatus(initialData.status || "belum");
      setCatatanKhusus(initialData.catatan_khusus || "");
      if (initialData.tanggal_mulai) setTanggalMulai(new Date(initialData.tanggal_mulai));
      if (initialData.tanggal_selesai) setTanggalSelesai(new Date(initialData.tanggal_selesai));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!initialData?.desa_id || !user?.id) {
      toast.error("Data desa tidak ditemukan");
      return;
    }
    
    // Validation
    if (status === "selesai") {
      if (!tanggalMulai || !tanggalSelesai) {
        toast.error("Tanggal mulai dan selesai wajib diisi");
        return;
      }
      if (tanggalSelesai < tanggalMulai) {
        toast.error("Tanggal selesai tidak valid");
        return;
      }
      if (uploadedFiles.length === 0) {
        toast.error("Dokumentasi wajib diupload");
        return;
      }
    } else if (status === "proses" && !tanggalMulai) {
      toast.error("Tanggal mulai wajib diisi");
      return;
    }

    setIsLoading(true);

    try {
      const pendataanData: Partial<PendataanDataItem> = {
        desa_id: initialData.desa_id,
        ppl_id: user.id,
        status,
        catatan_khusus: catatanKhusus || null,
        tanggal_mulai: tanggalMulai?.toISOString() || null,
        tanggal_selesai: tanggalSelesai?.toISOString() || null,
        persentase_selesai: status === 'selesai' ? 100 : status === 'proses' ? 50 : 0,
      };
      
      if (initialData.verification_status === 'ditolak') {
        pendataanData.verification_status = 'belum_verifikasi';
        pendataanData.rejection_reason = null;
      }
      
      await submitOrUpdatePendataanData(pendataanData, false);
      toast.success("Data berhasil disimpan");
      onSuccess();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {initialData?.verification_status === 'ditolak' && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Ditolak</AlertTitle>
          <AlertDescription>{initialData.rejection_reason}</AlertDescription>
        </Alert>
      )}
      
      {initialData?.verification_status === 'approved' && (
        <Alert className="mb-2 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Data Disetujui</AlertTitle>
          <AlertDescription>Data ini telah diverifikasi</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Status Pendataan</Label>
          <Select
            value={status}
            onValueChange={(value: PendataanStatus) => {
              setStatus(value);
              if (value === "proses" && !tanggalMulai) setTanggalMulai(new Date());
              if (value === "selesai" && !tanggalSelesai) setTanggalSelesai(new Date());
            }}
            disabled={isLoading || initialData?.verification_status === 'approved'}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="belum">Belum Dikerjakan</SelectItem>
              <SelectItem value="proses">Sedang Dikerjakan</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between text-sm">
            <span>Detail Pendataan</span>
            {isDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-2">
            {(status === "proses" || status === "selesai") && (
              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <DatePicker
                  date={tanggalMulai}
                  onSelect={setTanggalMulai}
                  disabled={isLoading || initialData?.verification_status === 'approved'}
                />
              </div>
            )}
            
            {status === "selesai" && (
              <>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <DatePicker
                    date={tanggalSelesai}
                    onSelect={setTanggalSelesai}
                    disabled={isLoading || initialData?.verification_status === 'approved' || !tanggalMulai}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Dokumentasi</Label>
                  <FileUpload
                    onFileSelect={setSelectedFiles}
                    onUploadComplete={setUploadedFiles}
                    disabled={isLoading || initialData?.verification_status === 'approved'}
                    maxFiles={5}
                    pplName={initialData?.ppl?.name || user?.name || ''}
                    kecamatanName={initialData?.desa?.kecamatan?.name || ''}
                    desaName={initialData?.desa?.name || ''}
                  />
                  {uploadedFiles.length === 0 && (
                    <p className="text-xs text-red-600">Wajib upload dokumentasi</p>
                  )}
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label>Catatan Khusus</Label>
              <Input
                value={catatanKhusus}
                onChange={(e) => setCatatanKhusus(e.target.value)}
                placeholder="Tambahkan catatan jika perlu"
                disabled={isLoading || initialData?.verification_status === 'approved'}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button 
            type="submit"
            disabled={isLoading || initialData?.verification_status === 'approved'}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.verification_status === 'ditolak' ? "Kirim Ulang" : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}