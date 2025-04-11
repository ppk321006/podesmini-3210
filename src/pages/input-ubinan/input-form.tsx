
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { getPPLAllocations } from "@/services/allocation-service";
import { createUbinanData } from "@/services/wilayah-api";
import { getSampelKRTList } from "@/services/wilayah-api";
import { SampelKRT } from "@/types/database-schema";

interface InputUbinanFormProps {
  onSubmitSuccess: () => Promise<void>;
}

export function InputUbinanForm({ onSubmitSuccess }: InputUbinanFormProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"nks" | "segmen">("nks");
  const [komoditas, setKomoditas] = useState<string>("");
  const [selectedNKS, setSelectedNKS] = useState<string>("");
  const [selectedSegmen, setSelectedSegmen] = useState<string>("");
  const [tanggal, setTanggal] = useState<Date>(new Date());
  const [berat, setBerat] = useState<string>("");
  const [responden, setResponden] = useState<string>("");
  const [isUsingKRT, setIsUsingKRT] = useState<boolean>(false);
  const [selectedKRT, setSelectedKRT] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Get PPL allocations
  const { data: allocations, isLoading: isLoadingAllocations } = useQuery({
    queryKey: ["ppl_allocations", user?.id],
    queryFn: () => getPPLAllocations(user?.id || ""),
    enabled: !!user?.id,
  });
  
  // Get Sampel KRT list based on selected NKS or Segmen
  const { data: krtList = [], isLoading: isLoadingKRT } = useQuery({
    queryKey: ["sampel_krt", { nks_id: selectedNKS, segmen_id: selectedSegmen }],
    queryFn: () => {
      const params: { nks_id?: string; segmen_id?: string } = {};
      if (activeTab === "nks" && selectedNKS) {
        params.nks_id = selectedNKS;
      } else if (activeTab === "segmen" && selectedSegmen) {
        params.segmen_id = selectedSegmen;
      }
      return getSampelKRTList(params);
    },
    enabled: (activeTab === "nks" && !!selectedNKS) || (activeTab === "segmen" && !!selectedSegmen),
  });

  // Reset form when switching tabs
  useEffect(() => {
    setSelectedNKS("");
    setSelectedSegmen("");
    setKomoditas("");
    setBerat("");
    setResponden("");
    setIsUsingKRT(false);
    setSelectedKRT("");
  }, [activeTab]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }
    
    if (!komoditas) {
      toast.error("Pilih komoditas terlebih dahulu");
      return;
    }
    
    if (activeTab === "nks" && !selectedNKS) {
      toast.error("Pilih NKS terlebih dahulu");
      return;
    }
    
    if (activeTab === "segmen" && !selectedSegmen) {
      toast.error("Pilih Segmen terlebih dahulu");
      return;
    }
    
    if (!berat || isNaN(Number(berat)) || Number(berat) <= 0) {
      toast.error("Masukkan berat hasil yang valid");
      return;
    }

    // If using KRT but no KRT selected
    if (isUsingKRT && !selectedKRT) {
      toast.error("Pilih Sampel KRT terlebih dahulu");
      return;
    }

    // If not using KRT but no name entered
    if (!isUsingKRT && !responden) {
      toast.error("Masukkan nama responden");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get the selected KRT for detail
      const selectedKRTDetail = isUsingKRT 
        ? krtList.find((krt: SampelKRT) => krt.id === selectedKRT)
        : null;
      
      // Create ubinan data
      const ubinanData = {
        nks_id: activeTab === "nks" ? selectedNKS : null,
        segmen_id: activeTab === "segmen" ? selectedSegmen : null,
        ppl_id: user.id,
        responden_name: isUsingKRT ? selectedKRTDetail?.nama || "" : responden,
        sample_status: isUsingKRT ? selectedKRTDetail?.status as ("Utama" | "Cadangan") : undefined,
        komoditas: komoditas,
        tanggal_ubinan: format(tanggal, 'yyyy-MM-dd'),
        berat_hasil: parseFloat(berat),
        pml_id: user.pml_id || null,
        status: 'sudah_diisi',
      };
      
      await createUbinanData(ubinanData);
      
      toast.success("Data ubinan berhasil disimpan");
      
      // Reset form
      setKomoditas("");
      setBerat("");
      setResponden("");
      setIsUsingKRT(false);
      setSelectedKRT("");
      
      // Call the onSubmitSuccess callback
      if (onSubmitSuccess) {
        await onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error submitting ubinan data:", error);
      toast.error("Gagal menyimpan data ubinan");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Form Input Ubinan</CardTitle>
          <CardDescription>
            Input data ubinan berdasarkan alokasi dan komoditas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "nks" | "segmen")} className="w-full">
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="nks">NKS (Palawija)</TabsTrigger>
                <TabsTrigger value="segmen">Segmen (Padi)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="nks">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pilih NKS</Label>
                    <Select 
                      value={selectedNKS} 
                      onValueChange={setSelectedNKS}
                      disabled={isLoadingAllocations}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingAllocations ? "Memuat..." : "Pilih NKS"} />
                      </SelectTrigger>
                      <SelectContent>
                        {allocations?.nks.map((item) => (
                          <SelectItem key={item.nks.id} value={item.nks.id}>
                            {item.nks.code} - {item.nks.desa?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Komoditas Palawija</Label>
                    <Select value={komoditas} onValueChange={setKomoditas}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih komoditas" />
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
                </div>
              </TabsContent>
              
              <TabsContent value="segmen">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pilih Segmen</Label>
                    <Select 
                      value={selectedSegmen} 
                      onValueChange={setSelectedSegmen}
                      disabled={isLoadingAllocations}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingAllocations ? "Memuat..." : "Pilih Segmen"} />
                      </SelectTrigger>
                      <SelectContent>
                        {allocations?.segmen.map((item) => (
                          <SelectItem key={item.segmen.id} value={item.segmen.id}>
                            {item.segmen.code} - {item.segmen.desa?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Komoditas</Label>
                    <Input value="padi" readOnly disabled className="bg-slate-100" />
                    <input type="hidden" value="padi" onChange={() => setKomoditas("padi")} />
                    {activeTab === "segmen" && setKomoditas("padi")}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="space-y-2">
              <Label>Tanggal Ubinan</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !tanggal && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tanggal ? format(tanggal, "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={tanggal}
                    onSelect={(date) => date && setTanggal(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Berat Hasil (kg)</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                min="0" 
                step="0.01"
                value={berat}
                onChange={(e) => setBerat(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="block">Responden</Label>
              <RadioGroup value={isUsingKRT ? "krt" : "manual"} onValueChange={(v) => setIsUsingKRT(v === "krt")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="krt" id="krt" />
                  <Label htmlFor="krt" className="cursor-pointer">Gunakan sampel KRT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual" className="cursor-pointer">Input manual</Label>
                </div>
              </RadioGroup>

              {isUsingKRT ? (
                <div className="mt-2">
                  <Select 
                    value={selectedKRT} 
                    onValueChange={setSelectedKRT}
                    disabled={isLoadingKRT || krtList.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoadingKRT ? "Memuat..." : 
                        krtList.length === 0 ? "Tidak ada sampel KRT" : 
                        "Pilih sampel KRT"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {krtList.map((krt: SampelKRT) => (
                        <SelectItem key={krt.id} value={krt.id}>
                          {krt.nama} ({krt.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!isLoadingKRT && krtList.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Tidak ada sampel KRT untuk {activeTab === "nks" ? "NKS" : "Segmen"} ini
                    </p>
                  )}
                </div>
              ) : (
                <Input 
                  placeholder="Nama responden" 
                  value={responden}
                  onChange={(e) => setResponden(e.target.value)}
                />
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Simpan Data
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
