
import { useState, useEffect, useCallback } from "react";
import { 
  Card, CardContent, CardHeader, 
  CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { allocateDesa, getAllocatedDesaList } from "@/services/allocation-service";
import { getKecamatanList, getDesaList } from "@/services/wilayah-api";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

export default function AlokasiPetugasPage() {
  const { toast } = useToast();
  const [selectedDesa, setSelectedDesa] = useState("");
  const [selectedPpl, setSelectedPpl] = useState("");
  const [selectedPml, setSelectedPml] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [availableDesaList, setAvailableDesaList] = useState([]);

  const { user } = useAuth();

  // Menggunakan React Query untuk menghindari blinking data
  const { 
    data: desaList = [], 
    error: desaError,
    isLoading: isDesaLoading,
    refetch: refetchDesa
  } = useQuery({
    queryKey: ['allocated_desa'],
    queryFn: getAllocatedDesaList,
    staleTime: 60000, // 1 menit
    refetchOnWindowFocus: false
  });

  const { 
    data: pplList = [], 
    isLoading: isPplLoading 
  } = useQuery({
    queryKey: ['ppl_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'ppl');
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  const { 
    data: pmlList = [], 
    isLoading: isPmlLoading 
  } = useQuery({
    queryKey: ['pml_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'pml');
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  const { 
    data: kecamatanList = [], 
    isLoading: isKecamatanLoading 
  } = useQuery({
    queryKey: ['kecamatan_list'],
    queryFn: getKecamatanList,
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  // Fetch desa based on selected kecamatan
  useEffect(() => {
    async function fetchDesaByKecamatan() {
      if (!selectedKecamatan) {
        setAvailableDesaList([]);
        return;
      }
      
      try {
        const desaData = await getDesaList(selectedKecamatan);
        setAvailableDesaList(desaData || []);
      } catch (error) {
        console.error("Error fetching desa list:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data desa",
          variant: "destructive",
        });
      }
    }
    
    fetchDesaByKecamatan();
  }, [selectedKecamatan, toast]);

  const handleAllocate = async () => {
    if (!selectedDesa || !selectedPpl) {
      toast({
        title: "Error",
        description: "Harap pilih desa dan PPL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await allocateDesa(selectedDesa, selectedPpl, selectedPml);
      if (success) {
        toast({
          title: "Sukses",
          description: "Desa berhasil dialokasikan",
        });
        refetchDesa();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error allocating desa:", error);
      toast({
        title: "Error",
        description: "Gagal mengalokasikan desa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setSelectedKecamatan("");
    setSelectedDesa("");
    setSelectedPpl("");
    setSelectedPml("");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedKecamatan("");
    setSelectedDesa("");
    setSelectedPpl("");
    setSelectedPml("");
  };
  
  const isDataLoading = isDesaLoading || isPplLoading || isPmlLoading || isKecamatanLoading;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Alokasi Petugas ke Desa</CardTitle>
            <CardDescription>
              Alokasikan petugas PPL dan PML untuk setiap desa
            </CardDescription>
          </div>
          <Button onClick={() => refetchDesa()} disabled={isDataLoading} variant="outline">
            {isDesaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent>
          {desaError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Gagal mengambil data alokasi. Silakan coba lagi nanti.</AlertDescription>
            </Alert>
          )}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead>Desa</TableHead>
                  <TableHead>PPL</TableHead>
                  <TableHead>PML</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDataLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : desaList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Tidak ada data alokasi. Silakan tambahkan alokasi petugas.
                    </TableCell>
                  </TableRow>
                ) : (
                  desaList.map((desa: any) => (
                    <TableRow key={desa.id || desa.desa_id}>
                      <TableCell>{desa.kecamatan_name || "-"}</TableCell>
                      <TableCell>{desa.desa_name || "-"}</TableCell>
                      <TableCell>{desa.ppl_name || "-"}</TableCell>
                      <TableCell>{desa.pml_name || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleOpenDialog} className="mt-4" disabled={isDataLoading}>
            Alokasikan Petugas
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alokasi Petugas</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="kecamatan">Kecamatan</Label>
              <Select onValueChange={setSelectedKecamatan} value={selectedKecamatan}>
                <SelectTrigger id="kecamatan" className="w-full">
                  <SelectValue placeholder="Pilih Kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  {kecamatanList.map((kecamatan: any) => (
                    <SelectItem key={kecamatan.id} value={kecamatan.id}>
                      {kecamatan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="desa">Desa</Label>
              <Select onValueChange={setSelectedDesa} value={selectedDesa} disabled={!selectedKecamatan}>
                <SelectTrigger id="desa" className="w-full">
                  <SelectValue placeholder={selectedKecamatan ? "Pilih Desa" : "Pilih Kecamatan terlebih dahulu"} />
                </SelectTrigger>
                <SelectContent>
                  {availableDesaList.map((desa: any) => (
                    <SelectItem key={desa.id} value={desa.id}>
                      {desa.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ppl">PPL</Label>
              <Select onValueChange={setSelectedPpl} value={selectedPpl}>
                <SelectTrigger id="ppl" className="w-full">
                  <SelectValue placeholder="Pilih PPL" />
                </SelectTrigger>
                <SelectContent>
                  {pplList.map((ppl: any) => (
                    <SelectItem key={ppl.id} value={ppl.id}>
                      {ppl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pml">PML (Opsional)</Label>
              <Select onValueChange={setSelectedPml} value={selectedPml}>
                <SelectTrigger id="pml" className="w-full">
                  <SelectValue placeholder="Pilih PML" />
                </SelectTrigger>
                <SelectContent>
                  {pmlList.map((pml: any) => (
                    <SelectItem key={pml.id} value={pml.id}>
                      {pml.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleCloseDialog}>
              Batal
            </Button>
            <Button onClick={handleAllocate} disabled={isLoading || !selectedDesa || !selectedPpl}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : "Alokasikan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
