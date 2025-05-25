import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  
  const [status, setStatus] = useState<PendataanStatus>(initialData?.status || "belum");
  const [catatanKhusus, setCatatanKhusus] = useState<string>(initialData?.catatan_khusus || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const [tanggalMulai, setTanggalMulai] = useState<Date | undefined>(
    initialData?.tanggal_mulai ? new Date(initialData.tanggal_mulai) : undefined
  );
  
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | undefined>(
    initialData?.tanggal_selesai ? new Date(initialData?.tanggal_selesai) : undefined
  );

  useEffect(() => {
    if (initialData) {
      setStatus(initialData.status || "belum");
      setCatatanKhusus(initialData.catatan_khusus || "");
      if (initialData.tanggal_mulai) {
        setTanggalMulai(new Date(initialData.tanggal_mulai));
      }
      if (initialData.tanggal_selesai) {
        setTanggalSelesai(new Date(initialData.tanggal_selesai));
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.desa_id || !user?.id) {
      toast.error("Data desa tidak ditemukan");
      return;
    }

    // Validasi
    if (status === "selesai") {
      if (!tanggalMulai) {
        toast.error("Tanggal mulai harus diisi untuk status Selesai");
        return;
      }
      if (!tanggalSelesai) {
        toast.error("Tanggal selesai harus diisi untuk status Selesai");
        return;
      }
      if (tanggalSelesai < tanggalMulai) {
        toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
        return;
      }
      if (uploadedFiles.length === 0) {
        if (selectedFiles.length > 0) {
          toast.error("Silakan upload file terlebih dahulu dengan menekan tombol 'Upload ke Google Drive'");
        } else {
          toast.error("Upload dokumentasi/foto wajib untuk status Selesai");
        }
        return;
      }
    } else if (status === "proses" && !tanggalMulai) {
      toast.error("Tanggal mulai harus diisi untuk status Sedang Dikerjakan");
      return;
    }

    setIsLoading(true);
    try {
      const pendataanData: Partial<PendataanDataItem> = {
        desa_id: initialData.desa_id,
        ppl_id: user.id,
        status,
        catatan_khusus: catatanKhusus || null,
        tanggal_mulai: tanggalMulai ? tanggalMulai.toISOString() : null,
        tanggal_selesai: tanggalSelesai ? tanggalSelesai.toISOString() : null,
        persentase_selesai: status === 'selesai' ? 100 : status === 'proses' ? 50 : 0,
      };

      if (initialData.verification_status === 'ditolak') {
        pendataanData.verification_status = 'belum_verifikasi';
        pendataanData.rejection_reason = null;
      }

      const result = await submitOrUpdatePendataanData(pendataanData, false);
      
      // Simpan referensi file nanti ke database (placeholder)
      if (uploadedFiles.length > 0) {
        console.log('Uploaded files:', uploadedFiles);
      }

      toast.success("Data berhasil disimpan");
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Container utama dengan batas tinggi dan scroll jika overflow
    <div className="max-h-screen overflow-y-auto p-4">
      <Card className="border-0 shadow-none">
        <CardContent className="pt-2 pb-2">
          {/* Alert data ditolak */}
          {initialData?.verification_status === 'ditolak' && initialData.rejection_reason && (
            <Alert variant="destructive" className="mb-3 text-sm">
              <AlertCircle className="h-3 w-3" />
              <AlertTitle className="ml-2 text-sm">Data Ditolak</AlertTitle>
              <AlertDescription className="ml-2 text-xs">{initialData.rejection_reason}</AlertDescription>
            </Alert>
          )}
          {/* Alert disetujui */}
          {initialData?.verification_status === 'approved' && (
            <Alert className="mb-3 bg-green-50 border-green-200 text-green-800 text-sm">
              <CheckCircle className="h-3 w-3" />
              <AlertTitle className="ml-2">Data Disetujui</AlertTitle>
              <AlertDescription className="ml-2 text-xs">
                Data ini telah diverifikasi dan disetujui oleh PML.
              </AlertDescription>
            </Alert>
          )}

          {/* Form utama */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Status */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="status" className="w-20 text-sm">Status</Label>
              <Select
                value={status}
                onValueChange={(value: PendataanStatus) => {
                  setStatus(value);
                  if (value === "proses" && !tanggalMulai) {
                    setTanggalMulai(new Date());
                    setTanggalSelesai(undefined);
                  } else if (value === "selesai") {
                    if (!tanggalMulai) setTanggalMulai(new Date());
                    if (!tanggalSelesai) setTanggalSelesai(new Date());
                  }
                }}
                disabled={isLoading || initialData?.verification_status === 'approved'}
                className="flex-1"
              >
                <SelectTrigger className="w-full text-sm border rounded px-2 py-1">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="belum">Belum Dikerjakan</SelectItem>
                  <SelectItem value="proses">Sedang Dikerjakan</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal Mulai */}
            {(status === "proses" || status === "selesai") && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="tanggal-mulai" className="w-20 text-sm">Mulai</Label>
                <DatePicker
                  date={tanggalMulai}
                  onSelect={setTanggalMulai}
                  disabled={isLoading || initialData?.verification_status === 'approved'}
                />
              </div>
            )}

            {/* Tanggal Selesai */}
            {status === "selesai" && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="tanggal-selesai" className="w-20 text-sm">Selesai</Label>
                <DatePicker
                  date={tanggalSelesai}
                  onSelect={setTanggalSelesai}
                  disabled={
                    isLoading || 
                    initialData?.verification_status === 'approved' || 
                    !tanggalMulai
                  }
                />
              </div>
            )}

            {/* Upload File */}
            {status === "selesai" && (
              <div className="mt-2">
                <FileUpload
                  onFileSelect={setSelectedFiles}
                  onUploadComplete={setUploadedFiles}
                  disabled={isLoading || initialData?.verification_status === 'approved'}
                  maxFiles={5}
                  pplName={initialData?.ppl?.name || user?.name || ''}
                  kecamatanName={initialData?.desa?.kecamatan?.name || ''}
                  desaName={initialData?.desa?.name || ''}
                />
                {uploadedFiles.length === 0 && selectedFiles.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">Upload dokumentasi wajib</p>
                )}
                {selectedFiles.length > 0 && uploadedFiles.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Tekan "Upload" untuk menyimpan file
                  </p>
                )}
              </div>
            )}

            {/* Catatan */}
            <div>
              <Label htmlFor="catatanKhusus" className="text-sm">Catatan</Label>
              <Input
                id="catatanKhusus"
                value={catatanKhusus}
                onChange={(e) => setCatatanKhusus(e.target.value)}
                placeholder="Catatan tambahan"
                disabled={isLoading || initialData?.verification_status === 'approved'}
                className="text-sm"
              />
            </div>
          </form>
        </CardContent>

        {/* Buttons */}
        <CardFooter className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} size="sm">
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || initialData?.verification_status === 'approved'}
            size="sm"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.verification_status === 'ditolak' ? "Kirim Ulang" : "Simpan"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}