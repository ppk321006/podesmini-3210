
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
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { 
  getNKSByPPL, 
  getUbinanDataByPPL, 
  createUbinanData 
} from "@/services/wilayah-api";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Loader2, Plus } from "lucide-react";

export default function InputUbinanPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state
  const [selectedNKSId, setSelectedNKSId] = useState("");
  const [selectedKomoditas, setSelectedKomoditas] = useState("");
  const [respondenName, setRespondenName] = useState("");
  const [beratHasil, setBeratHasil] = useState("");
  const [tanggalUbinan, setTanggalUbinan] = useState<Date | undefined>(undefined);
  
  // Get NKS list assigned to the logged-in PPL
  const { data: assignedNKS = [], isLoading: isLoadingNKS } = useQuery({
    queryKey: ["nks_by_ppl", user?.id],
    queryFn: () => user?.id ? getNKSByPPL(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });
  
  // Get ubinan data entered by the PPL
  const { data: ubinanData = [], isLoading: isLoadingUbinan } = useQuery({
    queryKey: ["ubinan_data", user?.id],
    queryFn: () => user?.id ? getUbinanDataByPPL(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });
  
  // Create ubinan data mutation
  const createUbinanMutation = useMutation({
    mutationFn: (values: { 
      nksId: string;
      respondenName: string;
      komoditas: string;
      tanggalUbinan: string;
      beratHasil: number;
    }) => {
      if (!user?.id) {
        throw new Error("User not logged in");
      }
      
      // Find the PML ID associated with this NKS
      const nksWithPML = assignedNKS.find(item => item.nks_id === values.nksId);
      const pmlId = nksWithPML?.pml?.id || "";
      
      return createUbinanData(
        values.nksId,
        user.id,
        values.respondenName,
        values.komoditas,
        values.tanggalUbinan,
        values.beratHasil,
        pmlId
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
    setSelectedNKSId("");
    setSelectedKomoditas("");
    setRespondenName("");
    setBeratHasil("");
    setTanggalUbinan(undefined);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedNKSId) {
      toast.error("Pilih NKS terlebih dahulu");
      return;
    }
    
    if (!selectedKomoditas) {
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
      nksId: selectedNKSId,
      respondenName: respondenName.trim(),
      komoditas: selectedKomoditas,
      tanggalUbinan: format(tanggalUbinan, "yyyy-MM-dd"),
      beratHasil: Number(beratHasil),
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Input Data Ubinan</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Form Input Data Ubinan</CardTitle>
            <CardDescription>
              Masukkan data hasil ubinan berdasarkan NKS yang telah dialokasikan
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Komoditas</label>
                <Select value={selectedKomoditas} onValueChange={setSelectedKomoditas}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih komoditas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="padi">Padi</SelectItem>
                    <SelectItem value="jagung">Jagung</SelectItem>
                    <SelectItem value="kedelai">Kedelai</SelectItem>
                    <SelectItem value="kacang_tanah">Kacang Tanah</SelectItem>
                    <SelectItem value="ubi_kayu">Ubi Kayu</SelectItem>
                    <SelectItem value="ubi_jalar">Ubi Jalar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Responden</label>
                <Input
                  placeholder="Masukkan nama responden"
                  value={respondenName}
                  onChange={(e) => setRespondenName(e.target.value)}
                />
              </div>
              
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
                      <TableHead>NKS</TableHead>
                      <TableHead>Responden</TableHead>
                      <TableHead>Berat (kg)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ubinanData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.komoditas.replace("_", " ")}
                        </TableCell>
                        <TableCell>{item.nks?.code || "-"}</TableCell>
                        <TableCell>{item.responden_name}</TableCell>
                        <TableCell>{item.berat_hasil}</TableCell>
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
