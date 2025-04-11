
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { 
  getNKSByPPL,
  getSegmenByPPL,
  getUbinanDataByPPL, 
  createUbinanData,
  getSampelKRTList
} from "@/services/wilayah-api";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SampelKRT } from "@/types/database-schema";

export default function InputUbinanPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state
  const [allocationType, setAllocationType] = useState<"nks" | "segmen">("nks");
  const [selectedNKSId, setSelectedNKSId] = useState("");
  const [selectedSegmenId, setSelectedSegmenId] = useState("");
  const [selectedKomoditas, setSelectedKomoditas] = useState("");
  const [respondenName, setRespondenName] = useState("");
  const [sampleStatus, setSampleStatus] = useState<"Utama" | "Cadangan">("Utama");
  const [beratHasil, setBeratHasil] = useState("");
  const [tanggalUbinan, setTanggalUbinan] = useState<Date | undefined>(undefined);
  const [sampelList, setSampelList] = useState<SampelKRT[]>([]);
  
  // Get NKS list assigned to the logged-in PPL
  const { data: assignedNKS = [], isLoading: isLoadingNKS } = useQuery({
    queryKey: ["nks_by_ppl", user?.id],
    queryFn: () => user?.id ? getNKSByPPL(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });
  
  // Get Segmen list assigned to the logged-in PPL
  const { data: assignedSegmen = [], isLoading: isLoadingSegmen } = useQuery({
    queryKey: ["segmen_by_ppl", user?.id],
    queryFn: () => user?.id ? getSegmenByPPL(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });
  
  // Get ubinan data entered by the PPL
  const { data: ubinanData = [], isLoading: isLoadingUbinan } = useQuery({
    queryKey: ["ubinan_data", user?.id],
    queryFn: () => user?.id ? getUbinanDataByPPL(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  // Fetch sampel KRT for selected NKS or Segmen
  useEffect(() => {
    const fetchSampelKRT = async () => {
      try {
        if (allocationType === "nks" && selectedNKSId) {
          const data = await getSampelKRTList(selectedNKSId);
          setSampelList(data);
        } else if (allocationType === "segmen" && selectedSegmenId) {
          const data = await getSampelKRTList(undefined, selectedSegmenId);
          setSampelList(data);
        } else {
          setSampelList([]);
        }
      } catch (error) {
        console.error("Error fetching sampel KRT:", error);
        setSampelList([]);
      }
    };

    fetchSampelKRT();
  }, [allocationType, selectedNKSId, selectedSegmenId]);

  // When allocation type changes, reset selection and form
  useEffect(() => {
    setSelectedNKSId("");
    setSelectedSegmenId("");
    setSelectedKomoditas("");
    resetForm();
  }, [allocationType]);

  // Create ubinan data mutation
  const createUbinanMutation = useMutation({
    mutationFn: (values: { 
      nksId?: string;
      segmenId?: string;
      respondenName: string;
      sampleStatus: string;
      komoditas: string;
      tanggalUbinan: string;
      beratHasil: number;
    }) => {
      if (!user?.id) {
        throw new Error("User not logged in");
      }
      
      // Find the PML ID associated with this allocation
      let pmlId = "";
      if (values.nksId) {
        const nksWithPML = assignedNKS.find(item => item.nks_id === values.nksId);
        pmlId = nksWithPML?.pml?.id || "";
      } else if (values.segmenId) {
        const segmenWithPML = assignedSegmen.find(item => item.segmen_id === values.segmenId);
        pmlId = segmenWithPML?.pml?.id || "";
      }
      
      return createUbinanData(
        values.respondenName,
        values.sampleStatus,
        values.komoditas,
        values.tanggalUbinan,
        Number(values.beratHasil),
        user.id,
        pmlId,
        values.nksId,
        values.segmenId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ubinan_data", user?.id] });
      resetForm();
      toast.success("Data ubinan berhasil disimpan");
    },
    onError: (error) => {
      console.error("Error creating ubinan data:", error);
      toast.error("Gagal menyimpan data ubinan");
    }
  });
  
  // Reset form
  const resetForm = () => {
    setRespondenName("");
    setSampleStatus("Utama");
    setBeratHasil("");
    setTanggalUbinan(undefined);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (allocationType === "nks" && !selectedNKSId) {
      toast.error("Pilih NKS terlebih dahulu");
      return;
    }
    
    if (allocationType === "segmen" && !selectedSegmenId) {
      toast.error("Pilih Segmen terlebih dahulu");
      return;
    }
    
    if (!selectedKomoditas && allocationType === "nks") {
      toast.error("Pilih komoditas terlebih dahulu");
      return;
    }
    
    if (!respondenName.trim()) {
      toast.error("Nama responden tidak boleh kosong");
      return;
    }
    
    if (!beratHasil || Number(beratHasil) <= 0) {
      toast.error("Berat hasil harus lebih dari 0");
      return;
    }
    
    if (!tanggalUbinan) {
      toast.error("Pilih tanggal ubinan");
      return;
    }
    
    createUbinanMutation.mutate({
      nksId: allocationType === "nks" ? selectedNKSId : undefined,
      segmenId: allocationType === "segmen" ? selectedSegmenId : undefined,
      respondenName: respondenName.trim(),
      sampleStatus: sampleStatus,
      komoditas: allocationType === "segmen" ? "padi" : selectedKomoditas,
      tanggalUbinan: format(tanggalUbinan, "yyyy-MM-dd"),
      beratHasil: Number(beratHasil),
    });
  };

  // Select responden from sampel list
  const handleSelectResponden = (sampel: SampelKRT) => {
    setRespondenName(sampel.nama);
    setSampleStatus(sampel.status as "Utama" | "Cadangan");
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Input Data Ubinan</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Form Input Data Ubinan</CardTitle>
            <CardDescription>
              Masukkan data hasil ubinan berdasarkan NKS atau Segmen yang telah dialokasikan
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Jenis Alokasi */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Jenis Alokasi</label>
                <RadioGroup
                  value={allocationType}
                  onValueChange={(value) => setAllocationType(value as "nks" | "segmen")}
                  className="flex flex-wrap gap-6"
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

              {/* NKS Selection */}
              {allocationType === "nks" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pilih NKS</label>
                  <Select value={selectedNKSId} onValueChange={setSelectedNKSId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih NKS" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingNKS ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Memuat...</span>
                        </div>
                      ) : assignedNKS.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground">
                          Belum ada NKS yang dialokasikan
                        </div>
                      ) : (
                        assignedNKS.map((item) => (
                          <SelectItem key={item.nks_id} value={item.nks_id}>
                            {item.nks?.code || "-"} - {item.nks?.desa?.name || "-"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Segmen Selection */}
              {allocationType === "segmen" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pilih Segmen</label>
                  <Select value={selectedSegmenId} onValueChange={setSelectedSegmenId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Segmen" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSegmen ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Memuat...</span>
                        </div>
                      ) : assignedSegmen.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground">
                          Belum ada Segmen yang dialokasikan
                        </div>
                      ) : (
                        assignedSegmen.map((item) => (
                          <SelectItem key={item.segmen_id} value={item.segmen_id}>
                            {item.segmen?.code || "-"} - {item.segmen?.desa?.name || "-"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Komoditas */}
              {allocationType === "nks" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Komoditas</label>
                  <Select value={selectedKomoditas} onValueChange={setSelectedKomoditas}>
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
              )}

              {allocationType === "segmen" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Komoditas</label>
                  <Input value="Padi" disabled className="bg-gray-100" />
                </div>
              )}
              
              {/* Nama Responden */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Responden</label>
                <Input
                  placeholder="Masukkan nama responden"
                  value={respondenName}
                  onChange={(e) => setRespondenName(e.target.value)}
                />
              </div>

              {/* Status Sampel */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Sampel</label>
                <RadioGroup
                  value={sampleStatus}
                  onValueChange={(value) => setSampleStatus(value as "Utama" | "Cadangan")}
                  className="flex flex-wrap gap-6"
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

              {/* Sampel KRT list */}
              {sampelList.length > 0 && (
                <div className="space-y-2 p-3 border rounded-md">
                  <label className="text-sm font-medium">Pilih dari Daftar Sampel KRT:</label>
                  <div className="max-h-40 overflow-y-auto">
                    <ul className="divide-y">
                      {sampelList.map((sampel) => (
                        <li key={sampel.id} className="py-2">
                          <Button 
                            variant="ghost" 
                            className="w-full text-left justify-start" 
                            onClick={() => handleSelectResponden(sampel)}
                          >
                            {sampel.nama} - <Badge variant="outline">{sampel.status}</Badge>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Tanggal Ubinan */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Ubinan</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!tanggalUbinan && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tanggalUbinan ? (
                        format(tanggalUbinan, "PPP", { locale: id })
                      ) : (
                        "Pilih tanggal"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tanggalUbinan}
                      onSelect={setTanggalUbinan}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Berat Hasil */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Berat Hasil (kg)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Masukkan berat hasil dalam kg"
                  value={beratHasil}
                  onChange={(e) => setBeratHasil(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={createUbinanMutation.isPending}
              >
                {createUbinanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Simpan Data Ubinan
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Data Ubinan</CardTitle>
            <CardDescription>
              Data ubinan yang telah diinput oleh Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUbinan ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2">Memuat data ubinan...</span>
              </div>
            ) : ubinanData.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                Belum ada data ubinan yang diinput
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Komoditas</TableHead>
                      <TableHead>Alokasi</TableHead>
                      <TableHead>Responden</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Berat (kg)</TableHead>
                      <TableHead>Status Verifikasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ubinanData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium capitalize">
                          {item.komoditas.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          {item.nks_id ? (
                            <span>NKS: {item.nks?.code || "-"}</span>
                          ) : item.segmen_id ? (
                            <span>Segmen: {item.segmen?.code || "-"}</span>
                          ) : "-"}
                        </TableCell>
                        <TableCell>{item.responden_name}</TableCell>
                        <TableCell>{item.sample_status || "-"}</TableCell>
                        <TableCell>{item.berat_hasil} kg</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.status === "dikonfirmasi"
                                ? "bg-green-100 text-green-800"
                                : item.status === "ditolak"
                                ? "bg-red-100 text-red-800"
                                : item.status === "sudah_diisi"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {item.status === "dikonfirmasi"
                              ? "Dikonfirmasi"
                              : item.status === "ditolak"
                              ? "Ditolak"
                              : item.status === "sudah_diisi"
                              ? "Menunggu Verifikasi"
                              : "Belum Diisi"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
