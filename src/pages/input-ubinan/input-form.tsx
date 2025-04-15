import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { UbinanData } from "@/types/database-schema";

interface InputFormProps {
  initialData?: UbinanData | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function UbinanInputForm({ initialData, onCancel, onSuccess }: InputFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKomoditasType, setSelectedKomoditasType] = useState<string>(
    initialData?.komoditas === "padi" ? "padi" : "palawija"
  );
  const [isSegmen, setIsSegmen] = useState<boolean>(
    initialData?.segmen_id ? true : initialData ? false : true
  );

  const [komoditas, setKomoditas] = useState<string>(initialData?.komoditas || "padi");
  const [segmenId, setSegmenId] = useState<string>(initialData?.segmen_id || "");
  const [nksId, setNksId] = useState<string>(initialData?.nks_id || "");
  const [respondenName, setRespondenName] = useState<string>(initialData?.responden_name || "");
  const [tanggalUbinan, setTanggalUbinan] = useState<Date | undefined>(
    initialData?.tanggal_ubinan ? new Date(initialData.tanggal_ubinan) : new Date()
  );
  const [beratHasil, setBeratHasil] = useState<string>(
    initialData?.berat_hasil ? initialData.berat_hasil.toString() : "0"
  );
  const [komentar, setKomentar] = useState<string>(initialData?.komentar || "");

  const { data: segmenData = [], isLoading: isLoadingSegmen } = useQuery({
    queryKey: ['ppl_segmen', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('wilayah_tugas_segmen')
        .select(`
          segmen_id,
          segmen:segmen_id(
            id,
            code,
            desa:desa_id(
              id,
              name,
              kecamatan:kecamatan_id(
                id,
                name
              )
            )
          )
        `)
        .eq('ppl_id', user.id);
        
      if (error) throw error;
      
      return data.map(item => item.segmen);
    },
    enabled: !!user?.id,
  });

  const { data: nksData = [], isLoading: isLoadingNks } = useQuery({
    queryKey: ['ppl_nks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('wilayah_tugas')
        .select(`
          nks_id,
          nks:nks_id(
            id,
            code,
            desa:desa_id(
              id,
              name,
              kecamatan:kecamatan_id(
                id,
                name
              )
            )
          )
        `)
        .eq('ppl_id', user.id);
        
      if (error) throw error;
      
      return data.map(item => item.nks);
    },
    enabled: !!user?.id,
  });

  const { data: respondenData = [], isLoading: isLoadingResponden } = useQuery({
    queryKey: ['responden_list', nksId],
    queryFn: async () => {
      if (!nksId) return [];
      
      const { data, error } = await supabase
        .from('sampel_krt')
        .select('id, nama')
        .eq('nks_id', nksId);
        
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!nksId && !isSegmen,
  });

  useEffect(() => {
    if (selectedKomoditasType === "padi") {
      setIsSegmen(true);
      setNksId("");
      setKomoditas("padi");
    } else {
      setIsSegmen(false);
      setSegmenId("");
    }
  }, [selectedKomoditasType]);

  const handleDateChange = (date: Date | undefined) => {
    setTanggalUbinan(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tanggalUbinan) {
      toast.error("Tanggal ubinan harus diisi");
      return;
    }

    if (!beratHasil || parseFloat(beratHasil) <= 0) {
      toast.error("Berat hasil harus lebih dari 0");
      return;
    }

    if (!respondenName.trim()) {
      toast.error("Nama responden harus diisi");
      return;
    }

    if (isSegmen && !segmenId) {
      toast.error("Segmen harus dipilih");
      return;
    }

    if (!isSegmen && !nksId) {
      toast.error("NKS harus dipilih");
      return;
    }

    if (!isSegmen && !komoditas) {
      toast.error("Komoditas harus dipilih");
      return;
    }

    setIsLoading(true);

    try {
      const { data: pplData, error: pplError } = await supabase
        .from('users')
        .select('pml_id')
        .eq('id', user?.id)
        .single();
        
      if (pplError) throw pplError;

      if (initialData?.id) {
        const { error } = await supabase
          .from('ubinan_data')
          .update({
            segmen_id: isSegmen ? segmenId : null,
            nks_id: !isSegmen ? nksId : null,
            komoditas: komoditas,
            responden_name: respondenName,
            tanggal_ubinan: tanggalUbinan.toISOString().split('T')[0],
            berat_hasil: parseFloat(beratHasil),
            komentar: komentar,
            status: 'sudah_diisi',
            updated_at: new Date().toISOString()
          })
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success("Data berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from('ubinan_data')
          .insert({
            ppl_id: user?.id,
            pml_id: pplData?.pml_id,
            segmen_id: isSegmen ? segmenId : null,
            nks_id: !isSegmen ? nksId : null,
            komoditas: komoditas,
            responden_name: respondenName,
            tanggal_ubinan: tanggalUbinan.toISOString().split('T')[0],
            berat_hasil: parseFloat(beratHasil),
            komentar: komentar,
            status: 'sudah_diisi'
          });

        if (error) throw error;
        toast.success("Data berhasil disimpan");
      }

      onSuccess();
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="komoditas-type">Jenis Komoditas</Label>
              <Select
                value={selectedKomoditasType}
                onValueChange={setSelectedKomoditasType}
                disabled={isLoading}
              >
                <SelectTrigger id="komoditas-type">
                  <SelectValue placeholder="Pilih Jenis Komoditas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="padi">Padi</SelectItem>
                  <SelectItem value="palawija">Palawija</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isSegmen && (
              <div>
                <Label htmlFor="komoditas">Komoditas</Label>
                <Select
                  value={komoditas}
                  onValueChange={setKomoditas}
                  disabled={isLoading}
                >
                  <SelectTrigger id="komoditas">
                    <SelectValue placeholder="Pilih Komoditas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jagung">Jagung</SelectItem>
                    <SelectItem value="kedelai">Kedelai</SelectItem>
                    <SelectItem value="kacang_tanah">Kacang Tanah</SelectItem>
                    <SelectItem value="ubi_kayu">Ubi Kayu</SelectItem>
                    <SelectItem value="ubi_jalar">Ubi Jalar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isSegmen ? (
              <div>
                <Label htmlFor="segmen">Segmen</Label>
                {isLoadingSegmen ? (
                  <div className="flex items-center space-x-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <Select
                    key="segmen-select"
                    value={segmenId}
                    onValueChange={setSegmenId}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="segmen">
                      <SelectValue placeholder="Pilih Segmen" />
                    </SelectTrigger>
                    <SelectContent>
                      {segmenData && segmenData.length > 0 ? (
                        segmenData.map((segmen: any) => (
                          <SelectItem key={segmen.id} value={segmen.id}>
                            {segmen.code} - {segmen.desa?.name || ""}, {segmen.desa?.kecamatan?.name || ""}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_data" disabled>
                          Tidak ada segmen yang tersedia
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="nks">NKS</Label>
                {isLoadingNks ? (
                  <div className="flex items-center space-x-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <Select
                    key="nks-select"
                    value={nksId}
                    onValueChange={setNksId}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="nks">
                      <SelectValue placeholder="Pilih NKS" />
                    </SelectTrigger>
                    <SelectContent>
                      {nksData && nksData.length > 0 ? (
                        nksData.map((nks: any) => (
                          <SelectItem key={nks.id} value={nks.id}>
                            {nks.code} - {nks.desa?.name || ""}, {nks.desa?.kecamatan?.name || ""}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_data" disabled>
                          Tidak ada NKS yang tersedia
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="responden">Nama Responden</Label>
              {!isSegmen && nksId ? (
                <Select
                  value={respondenName}
                  onValueChange={setRespondenName}
                  disabled={isLoading}
                >
                  <SelectTrigger id="responden">
                    <SelectValue placeholder="Pilih Responden" />
                  </SelectTrigger>
                  <SelectContent>
                    {respondenData && respondenData.length > 0 ? (
                      respondenData.map((responden: any) => (
                        <SelectItem key={responden.id} value={responden.nama}>
                          {responden.nama}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no_data_available" disabled>
                        Tidak ada responden yang tersedia
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="responden"
                  value={respondenName}
                  onChange={(e) => setRespondenName(e.target.value)}
                  disabled={isLoading}
                  placeholder="Masukkan nama responden"
                />
              )}
            </div>

            <div>
              <Label htmlFor="tanggal">Tanggal Ubinan</Label>
              <DatePicker
                date={tanggalUbinan}
                onSelect={handleDateChange}
                disabled={isLoading}
                disableFutureDates={true}
              />
            </div>

            <div>
              <Label htmlFor="berat">Berat Hasil (kg)</Label>
              <Input
                id="berat"
                type="number"
                step="0.01"
                value={beratHasil}
                onChange={(e) => setBeratHasil(e.target.value)}
                disabled={isLoading}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="komentar">Komentar</Label>
            <Textarea
              id="komentar"
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              disabled={isLoading}
              placeholder="Tambahkan komentar atau catatan (opsional)"
              rows={3}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Batalkan
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Data
        </Button>
      </CardFooter>
    </Card>
  );
}

export const InputForm = UbinanInputForm;
