
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

export function InputDataForm({ initialData, onCancel, onSuccess }: InputDataFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  
  // Extract data from initialData if available
  const [status, setStatus] = useState<PendataanStatus>(initialData?.status || "belum");
  const [catatanKhusus, setCatatanKhusus] = useState<string>(initialData?.catatan_khusus || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // For dates, we'll use the existing ones or null
  const [tanggalMulai, setTanggalMulai] = useState<Date | undefined>(
    initialData?.tanggal_mulai ? new Date(initialData.tanggal_mulai) : undefined
  );
  
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | undefined>(
    initialData?.tanggal_selesai ? new Date(initialData.tanggal_selesai) : undefined
  );

  // Set default dates based on status when initialData changes
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

  const uploadFilesToGoogleDrive = async (files: File[]): Promise<string[]> => {
    // This is a placeholder function for Google Drive upload
    // For now, we'll simulate the upload and return mock URLs
    setIsUploadingFiles(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Upload files to Google Drive API
      // 2. Get the file IDs/URLs
      // 3. Return the URLs
      
      const mockUrls = files.map(file => 
        `https://drive.google.com/file/d/mock_file_id_${Date.now()}_${file.name}/view`
      );
      
      toast.success(`${files.length} file berhasil diupload ke Google Drive`);
      return mockUrls;
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Gagal mengupload file ke Google Drive');
      throw error;
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!initialData?.desa_id || !user?.id) {
      toast.error("Data desa tidak ditemukan");
      return;
    }
    
    // Validate dates based on status
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
      
      // Validate file upload for completed status
      if (selectedFiles.length === 0) {
        toast.error("Upload dokumentasi/foto wajib untuk status Selesai");
        return;
      }
    } else if (status === "proses" && !tanggalMulai) {
      toast.error("Tanggal mulai harus diisi untuk status Sedang Dikerjakan");
      return;
    }

    setIsLoading(true);

    try {
      let fileUrls: string[] = [];
      
      // Upload files if status is selesai and files are selected
      if (status === "selesai" && selectedFiles.length > 0) {
        fileUrls = await uploadFilesToGoogleDrive(selectedFiles);
      }

      const pendataanData: Partial<PendataanDataItem> = {
        desa_id: initialData.desa_id,
        ppl_id: user.id,
        status,
        catatan_khusus: catatanKhusus || null,
        tanggal_mulai: tanggalMulai ? tanggalMulai.toISOString() : null,
        tanggal_selesai: tanggalSelesai ? tanggalSelesai.toISOString() : null,
        persentase_selesai: status === 'selesai' ? 100 : status === 'proses' ? 50 : 0,
      };
      
      // If we're resubmitting after a rejection, reset verification status
      if (initialData.verification_status === 'ditolak') {
        pendataanData.verification_status = 'belum_verifikasi';
        pendataanData.rejection_reason = null;
      }
      
      await submitOrUpdatePendataanData(
        pendataanData, 
        !initialData.id // isNew if no id exists
      );
      
      // TODO: Save file URLs to dokumen_pendataan table
      // This would require updating the submitOrUpdatePendataanData function
      // or creating a separate function to save document references
      
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
    <Card className="border-0 shadow-none">
      <CardContent className="pt-0">
        {initialData?.verification_status === 'ditolak' && initialData.rejection_reason && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Data Ditolak</AlertTitle>
            <AlertDescription>
              {initialData.rejection_reason}
            </AlertDescription>
          </Alert>
        )}
        
        {initialData?.verification_status === 'approved' && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Data Disetujui</AlertTitle>
            <AlertDescription>
              Data ini telah diverifikasi dan disetujui oleh PML.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="status">Status Pendataan</Label>
              <Select
                value={status}
                onValueChange={(value: PendataanStatus) => {
                  setStatus(value);
                  
                  // Set default dates based on status
                  if (value === "proses" && !tanggalMulai) {
                    setTanggalMulai(new Date());
                    setTanggalSelesai(undefined);
                  } else if (value === "selesai") {
                    if (!tanggalMulai) setTanggalMulai(new Date());
                    if (!tanggalSelesai) setTanggalSelesai(new Date());
                  }
                }}
                disabled={isLoading || initialData?.verification_status === 'approved'}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="belum">Belum Dikerjakan</SelectItem>
                  <SelectItem value="proses">Sedang Dikerjakan</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(status === "proses" || status === "selesai") && (
              <div>
                <Label htmlFor="tanggal-mulai">Tanggal Mulai</Label>
                <div className="mt-1">
                  <DatePicker
                    date={tanggalMulai}
                    onSelect={setTanggalMulai}
                    disabled={isLoading || initialData?.verification_status === 'approved'}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Wajib diisi untuk status Sedang Dikerjakan dan Selesai
                </p>
              </div>
            )}
            
            {status === "selesai" && (
              <div>
                <Label htmlFor="tanggal-selesai">Tanggal Selesai</Label>
                <div className="mt-1">
                  <DatePicker
                    date={tanggalSelesai}
                    onSelect={setTanggalSelesai}
                    disabled={isLoading || initialData?.verification_status === 'approved' || !tanggalMulai}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Wajib diisi untuk status Selesai
                </p>
              </div>
            )}
            
            {status === "selesai" && (
              <FileUpload
                onFileSelect={setSelectedFiles}
                disabled={isLoading || isUploadingFiles || initialData?.verification_status === 'approved'}
                maxFiles={5}
              />
            )}
            
            <div>
              <Label htmlFor="catatanKhusus">Catatan Khusus</Label>
              <Input
                id="catatanKhusus"
                value={catatanKhusus}
                onChange={(e) => setCatatanKhusus(e.target.value)}
                placeholder="Catatan khusus/tambahan untuk desa ini"
                disabled={isLoading || initialData?.verification_status === 'approved'}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading || isUploadingFiles}>
          Batal
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || isUploadingFiles || initialData?.verification_status === 'approved'}
        >
          {(isLoading || isUploadingFiles) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploadingFiles ? "Mengupload File..." : 
           initialData?.verification_status === 'ditolak' ? "Kirim Ulang Data" : "Simpan Data"}
        </Button>
      </CardFooter>
    </Card>
  );
}
