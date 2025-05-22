
import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateDesaStatus } from "@/services/allocation-service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DesaData {
  id: string;
  name: string;
  kecamatan_name: string;
  status: "belum" | "proses" | "selesai" | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  target: number | null;
}

interface InputDataFormProps {
  initialData: DesaData | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function InputDataForm({ initialData, onCancel, onSuccess }: InputDataFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [status, setStatus] = useState<"belum" | "proses" | "selesai">(initialData?.status || "belum");
  const [target, setTarget] = useState<string>(initialData?.target?.toString() || "");
  
  // For dates, we'll use the existing ones or null
  const [tanggalMulai, setTanggalMulai] = useState<Date | undefined>(
    initialData?.tanggal_mulai ? new Date(initialData.tanggal_mulai) : undefined
  );
  
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | undefined>(
    initialData?.tanggal_selesai ? new Date(initialData.tanggal_selesai) : undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!initialData?.id) {
      toast.error("Data desa tidak ditemukan");
      return;
    }
    
    // Validate target if provided
    if (target && isNaN(parseInt(target))) {
      toast.error("Target harus berupa angka");
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
    } else if (status === "proses" && !tanggalMulai) {
      toast.error("Tanggal mulai harus diisi untuk status Sedang Dikerjakan");
      return;
    }

    setIsLoading(true);

    try {
      const targetValue = target ? parseInt(target) : null;
      
      const success = await updateDesaStatus(initialData.id, status, targetValue);
      
      if (success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("Gagal memperbarui data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="status">Status Pendataan</Label>
              <Select
                value={status}
                onValueChange={(value: "belum" | "proses" | "selesai") => {
                  setStatus(value);
                  
                  // Set default dates based on status
                  if (value === "proses" && !tanggalMulai) {
                    setTanggalMulai(new Date());
                    setTanggalSelesai(undefined);
                  } else if (value === "selesai" && !tanggalSelesai) {
                    if (!tanggalMulai) setTanggalMulai(new Date());
                    setTanggalSelesai(new Date());
                  }
                }}
                disabled={isLoading}
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
            
            <div>
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                type="number"
                placeholder="Masukkan target"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="tanggal-mulai">Tanggal Mulai</Label>
              <div className="mt-1">
                <DatePicker
                  date={tanggalMulai}
                  onSelect={setTanggalMulai}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {status === "proses" || status === "selesai" 
                  ? "Wajib diisi untuk status Sedang Dikerjakan dan Selesai" 
                  : "Opsional untuk status Belum Dikerjakan"}
              </p>
            </div>
            
            {(status === "selesai") && (
              <div>
                <Label htmlFor="tanggal-selesai">Tanggal Selesai</Label>
                <div className="mt-1">
                  <DatePicker
                    date={tanggalSelesai}
                    onSelect={setTanggalSelesai}
                    disabled={isLoading || !tanggalMulai}
                    // Remove the fromDate prop as it's not part of the DatePicker component
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Wajib diisi untuk status Selesai
                </p>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </Button>
      </CardFooter>
    </Card>
  );
}

export const InputForm = InputDataForm;
