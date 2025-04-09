
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  getKecamatanList, 
  getDesaList,
  getNKSList,
  getPetugasList,
  createWilayahTugas,
  getWilayahTugasList
} from "@/services/wilayah-api";
import { useAuth } from "@/context/auth-context";

export default function AlokasiWilayahPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Selection states
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");
  const [selectedDesaId, setSelectedDesaId] = useState("");
  const [selectedNKSId, setSelectedNKSId] = useState("");
  const [selectedPMLId, setSelectedPMLId] = useState("");
  const [selectedPPLId, setSelectedPPLId] = useState("");
  
  // Data queries
  const { data: kecamatanList = [] } = useQuery({
    queryKey: ["kecamatan"],
    queryFn: getKecamatanList,
  });
  
  const { data: desaList = [] } = useQuery({
    queryKey: ["desa", selectedKecamatanId],
    queryFn: () => getDesaList(selectedKecamatanId || undefined),
    enabled: !!selectedKecamatanId,
  });
  
  const { data: nksList = [] } = useQuery({
    queryKey: ["nks", selectedDesaId],
    queryFn: () => getNKSList(selectedDesaId || undefined),
    enabled: !!selectedDesaId,
  });
  
  const { data: pmlList = [] } = useQuery({
    queryKey: ["petugas", "pml"],
    queryFn: () => getPetugasList("pml"),
  });
  
  const { data: pplList = [], isLoading: isLoadingPPL } = useQuery({
    queryKey: ["petugas", "ppl", selectedPMLId],
    queryFn: async () => {
      if (selectedPMLId) {
        // Filter PPL by selected PML
        const allPPL = await getPetugasList("ppl");
        return allPPL.filter(ppl => ppl.pml_id === selectedPMLId);
      }
      return getPetugasList("ppl");
    },
    enabled: !!selectedPMLId,
  });
  
  // Current allocations
  const { data: wilayahTugasList = [], isLoading: isLoadingWilayah } = useQuery({
    queryKey: ["wilayah_tugas"],
    queryFn: () => getWilayahTugasList(),
  });
  
  // Create allocation mutation
  const createWilayahMutation = useMutation({
    mutationFn: (values: { 
      nksId: string;
      pmlId: string;
      pplId: string;
    }) => createWilayahTugas(
      values.nksId,
      values.pmlId, 
      values.pplId
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wilayah_tugas"] });
      toast.success("Alokasi wilayah tugas berhasil ditambahkan");
      
      // Reset form
      setSelectedNKSId("");
    },
    onError: (error) => {
      console.error("Error creating wilayah tugas:", error);
      toast.error("Gagal menambahkan alokasi wilayah tugas");
    }
  });
  
  // Set default PML based on logged-in user
  useEffect(() => {
    if (user && user.role === "pml") {
      setSelectedPMLId(user.id);
    }
  }, [user]);
  
  // Handle form submission
  const handleAddWilayah = () => {
    if (!selectedNKSId || !selectedPMLId || !selectedPPLId) {
      toast.error("Semua field harus diisi");
      return;
    }
    
    // Check if allocation already exists
    const exists = wilayahTugasList.some(
      w => w.nks_id === selectedNKSId && w.ppl_id === selectedPPLId
    );
    
    if (exists) {
      toast.error("Alokasi untuk NKS dan PPL ini sudah ada");
      return;
    }
    
    createWilayahMutation.mutate({
      nksId: selectedNKSId,
      pmlId: selectedPMLId,
      pplId: selectedPPLId
    });
  };
  
  // Check if NKS is already allocated to a PPL
  const isNKSAllocated = (nksId: string) => {
    return wilayahTugasList.some(w => w.nks_id === nksId);
  };
  
  // Get NKS details by ID
  const getNKSDetails = (nksId: string) => {
    const nks = nksList.find(n => n.id === nksId) || { code: "-" };
    return nks;
  };
  
  // Get desa name by ID
  const getDesaName = (desaId: string) => {
    const desa = desaList.find(d => d.id === desaId);
    return desa ? desa.name : "-";
  };
  
  // Get petugas name by ID
  const getPetugasName = (id: string) => {
    const pml = pmlList.find(p => p.id === id);
    if (pml) return pml.name;
    
    const ppl = pplList.find(p => p.id === id);
    return ppl ? ppl.name : "-";
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Alokasi Wilayah Tugas</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tambah Alokasi Wilayah Baru</CardTitle>
            <CardDescription>
              Tetapkan wilayah tugas untuk petugas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Pilih Kecamatan</Label>
                  <Select 
                    value={selectedKecamatanId} 
                    onValueChange={(value) => {
                      setSelectedKecamatanId(value);
                      setSelectedDesaId("");
                      setSelectedNKSId("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kecamatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {kecamatanList.map((kecamatan) => (
                        <SelectItem key={kecamatan.id} value={kecamatan.id}>
                          {kecamatan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Pilih Desa</Label>
                  <Select 
                    value={selectedDesaId} 
                    onValueChange={(value) => {
                      setSelectedDesaId(value);
                      setSelectedNKSId("");
                    }}
                    disabled={!selectedKecamatanId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih desa" />
                    </SelectTrigger>
                    <SelectContent>
                      {desaList.map((desa) => (
                        <SelectItem key={desa.id} value={desa.id}>
                          {desa.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Pilih NKS</Label>
                  <Select 
                    value={selectedNKSId} 
                    onValueChange={setSelectedNKSId}
                    disabled={!selectedDesaId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih NKS" />
                    </SelectTrigger>
                    <SelectContent>
                      {nksList.map((nks) => (
                        <SelectItem 
                          key={nks.id} 
                          value={nks.id}
                          disabled={isNKSAllocated(nks.id)}
                        >
                          {nks.code} {isNKSAllocated(nks.id) ? "(Sudah dialokasikan)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Pilih PML</Label>
                  <Select 
                    value={selectedPMLId} 
                    onValueChange={(value) => {
                      setSelectedPMLId(value);
                      setSelectedPPLId("");
                    }}
                    disabled={user?.role === "pml"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih PML" />
                    </SelectTrigger>
                    <SelectContent>
                      {pmlList.map((pml) => (
                        <SelectItem key={pml.id} value={pml.id}>
                          {pml.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Pilih PPL</Label>
                  <Select 
                    value={selectedPPLId} 
                    onValueChange={setSelectedPPLId}
                    disabled={!selectedPMLId || isLoadingPPL}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPPL ? "Memuat PPL..." : "Pilih PPL"} />
                    </SelectTrigger>
                    <SelectContent>
                      {pplList.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Tidak ada PPL untuk PML ini
                        </SelectItem>
                      ) : (
                        pplList.map((ppl) => (
                          <SelectItem key={ppl.id} value={ppl.id}>
                            {ppl.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleAddWilayah}
              disabled={
                createWilayahMutation.isPending || 
                !selectedNKSId || 
                !selectedPMLId || 
                !selectedPPLId
              }
            >
              {createWilayahMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Wilayah Tugas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingWilayah ? (
              <p>Memuat data...</p>
            ) : wilayahTugasList.length === 0 ? (
              <p className="text-muted-foreground">Belum ada data wilayah tugas</p>
            ) : (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left">Kode NKS</th>
                      <th className="p-3 text-left">Desa</th>
                      <th className="p-3 text-left">Target (Padi/Palawija)</th>
                      <th className="p-3 text-left">PML</th>
                      <th className="p-3 text-left">PPL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wilayahTugasList.map((wilayah) => {
                      const nksDetails = getNKSDetails(wilayah.nks_id);
                      return (
                        <tr key={wilayah.id} className="border-t">
                          <td className="p-3">{nksDetails.code}</td>
                          <td className="p-3">{getDesaName(nksDetails.desa_id)}</td>
                          <td className="p-3">{nksDetails.target_padi}/{nksDetails.target_palawija}</td>
                          <td className="p-3">{getPetugasName(wilayah.pml_id)}</td>
                          <td className="p-3">{getPetugasName(wilayah.ppl_id)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
