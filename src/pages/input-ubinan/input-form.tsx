
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { getPPLAllocations } from "@/services/allocation-service";
import { createUbinanData } from "@/services/wilayah-api";
import { getSampelKRTList } from "@/services/wilayah-api";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { SampelKRT } from "@/types/database-schema";

interface InputUbinanFormProps {
  onSubmitSuccess: () => void;
}

export function InputUbinanForm({ onSubmitSuccess }: InputUbinanFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [allocationType, setAllocationType] = useState<"nks" | "segmen">("nks");
  const [allocations, setAllocations] = useState<{
    nks: any[];
    segmen: any[];
  }>({ nks: [], segmen: [] });
  const [selectedAllocation, setSelectedAllocation] = useState<string>("");
  const [sampelList, setSampelList] = useState<SampelKRT[]>([]);
  const [selectedSampel, setSelectedSampel] = useState<string>("");
  const [useManualInput, setUseManualInput] = useState(false);
  const [responden, setResponden] = useState("");
  const [sampelStatus, setSampelStatus] = useState<"Utama" | "Cadangan">("Utama");
  const [komoditas, setKomoditas] = useState("padi");
  const [tanggalUbinan, setTanggalUbinan] = useState<Date | undefined>(new Date());
  const [beratHasil, setBeratHasil] = useState("");

  // Available komoditas list
  const komoditasList = [
    { value: "padi", label: "Padi" },
    { value: "jagung", label: "Jagung" },
    { value: "kedelai", label: "Kedelai" },
    { value: "kacang_tanah", label: "Kacang Tanah" },
    { value: "ubi_kayu", label: "Ubi Kayu" },
    { value: "ubi_jalar", label: "Ubi Jalar" },
  ];

  // Load allocations when component mounts
  useEffect(() => {
    const fetchAllocations = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getPPLAllocations(user.id);
        setAllocations(data);
      } catch (error) {
        console.error("Error fetching allocations:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data alokasi",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocations();
  }, [user]);

  // Load sampel KRT when allocation is selected
  useEffect(() => {
    const fetchSampelKRT = async () => {
      if (!selectedAllocation) {
        setSampelList([]);
        return;
      }

      try {
        setIsLoading(true);
        
        const params = allocationType === "nks"
          ? { nks_id: selectedAllocation }
          : { segmen_id: selectedAllocation };
          
        const data = await getSampelKRTList(params);
        setSampelList(data);
      } catch (error) {
        console.error("Error fetching sampel KRT:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data sampel",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSampelKRT();
  }, [selectedAllocation, allocationType]);

  // Handle sampel selection change
  useEffect(() => {
    if (!useManualInput && selectedSampel) {
      const sampel = sampelList.find(s => s.id === selectedSampel);
      if (sampel) {
        setResponden(sampel.nama);
        setSampelStatus(sampel.status === "Utama" ? "Utama" : "Cadangan");
      }
    }
  }, [selectedSampel, sampelList, useManualInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "User tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    if (!tanggalUbinan) {
      toast({
        title: "Error",
        description: "Tanggal ubinan harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!beratHasil || isNaN(Number(beratHasil))) {
      toast({
        title: "Error",
        description: "Berat hasil harus diisi dengan angka",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get the PML ID based on the allocation type
      const pmlId = allocationType === "nks" 
        ? allocations.nks.find(item => item.nks?.id === selectedAllocation)?.pml?.id
        : allocations.segmen.find(item => item.segmen?.id === selectedAllocation)?.pml?.id;
      
      const ubinanData = {
        nks_id: allocationType === "nks" ? selectedAllocation : undefined,
        segmen_id: allocationType === "segmen" ? selectedAllocation : undefined,
        ppl_id: user.id,
        responden_name: responden,
        sample_status: sampelStatus,
        komoditas,
        tanggal_ubinan: format(tanggalUbinan, "yyyy-MM-dd"),
        berat_hasil: Number(beratHasil),
        pml_id: pmlId
      };

      await createUbinanData(ubinanData);
      
      toast({
        title: "Sukses",
        description: "Data ubinan berhasil disimpan",
        variant: "default",
      });
      
      // Reset form
      setSelectedAllocation("");
      setSelectedSampel("");
      setUseManualInput(false);
      setResponden("");
      setSampelStatus("Utama");
      setKomoditas("padi");
      setTanggalUbinan(new Date());
      setBeratHasil("");
      
      // Call the success callback
      onSubmitSuccess();
      
    } catch (error) {
      console.error("Error submitting ubinan data:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data ubinan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Data Ubinan</CardTitle>
        <CardDescription>
          Isi formulir berikut untuk menambahkan data ubinan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipe Alokasi</Label>
              <RadioGroup
                value={allocationType}
                onValueChange={(value: "nks" | "segmen") => {
                  setAllocationType(value);
                  setSelectedAllocation("");
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nks" id="nks" />
                  <Label htmlFor="nks">NKS (Palawija)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="segmen" id="segmen" />
                  <Label htmlFor="segmen">Segmen (Padi)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allocation">
                {allocationType === "nks" ? "NKS" : "Segmen"}
              </Label>
              <Select
                value={selectedAllocation}
                onValueChange={setSelectedAllocation}
              >
                <SelectTrigger id="allocation">
                  <SelectValue placeholder={`Pilih ${allocationType === "nks" ? "NKS" : "Segmen"}`} />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : allocationType === "nks" ? (
                    allocations.nks.length > 0 ? (
                      allocations.nks.map((item) => (
                        <SelectItem key={item.nks?.id} value={item.nks?.id}>
                          {item.nks?.code} - {item.nks?.desa?.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-center py-2 text-muted-foreground">
                        Tidak ada NKS yang tersedia
                      </div>
                    )
                  ) : allocations.segmen.length > 0 ? (
                    allocations.segmen.map((item) => (
                      <SelectItem key={item.segmen?.id} value={item.segmen?.id}>
                        {item.segmen?.code} - {item.segmen?.desa?.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-center py-2 text-muted-foreground">
                      Tidak ada Segmen yang tersedia
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="sampel">Sampel KRT</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUseManualInput(!useManualInput)}
                >
                  {useManualInput ? "Pilih dari Sampel" : "Input Manual"}
                </Button>
              </div>

              {!useManualInput ? (
                <Select
                  value={selectedSampel}
                  onValueChange={setSelectedSampel}
                  disabled={!selectedAllocation || isLoading}
                >
                  <SelectTrigger id="sampel">
                    <SelectValue placeholder="Pilih Sampel KRT" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : sampelList.length > 0 ? (
                      sampelList.map((sampel) => (
                        <SelectItem key={sampel.id} value={sampel.id}>
                          {sampel.nama} ({sampel.status})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-center py-2 text-muted-foreground">
                        Tidak ada Sampel KRT yang tersedia
                      </div>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="responden">Nama Responden</Label>
                    <Input
                      id="responden"
                      value={responden}
                      onChange={(e) => setResponden(e.target.value)}
                      placeholder="Masukkan nama responden"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status Sampel</Label>
                    <RadioGroup
                      value={sampelStatus}
                      onValueChange={(value: "Utama" | "Cadangan") => setSampelStatus(value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Utama" id="utama" />
                        <Label htmlFor="utama">Utama</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Cadangan" id="cadangan" />
                        <Label htmlFor="cadangan">Cadangan</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="komoditas">Komoditas</Label>
              <Select value={komoditas} onValueChange={setKomoditas}>
                <SelectTrigger id="komoditas">
                  <SelectValue placeholder="Pilih Komoditas" />
                </SelectTrigger>
                <SelectContent>
                  {komoditasList.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      disabled={
                        (allocationType === "nks" && item.value === "padi") ||
                        (allocationType === "segmen" && item.value !== "padi")
                      }
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Ubinan</Label>
              <DatePicker
                date={tanggalUbinan}
                onSelect={setTanggalUbinan}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="berat">Berat Hasil (kg)</Label>
              <Input
                id="berat"
                type="number"
                step="0.01"
                value={beratHasil}
                onChange={(e) => setBeratHasil(e.target.value)}
                placeholder="Masukkan berat hasil dalam kg"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Data Ubinan"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
