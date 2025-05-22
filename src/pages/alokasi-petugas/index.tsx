
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getKecamatans, getDesasByKecamatan } from "@/services/api";
import { allocateDesa, getAllocatedDesaList } from "@/services/allocation-service";
import { useAuth } from "@/context/auth-context";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export default function AlokasiPetugasPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");
  const [selectedDesaId, setSelectedDesaId] = useState("");
  const [selectedPPLId, setSelectedPPLId] = useState("");
  
  const { data: kecamatanList = [] } = useQuery({
    queryKey: ["kecamatan"],
    queryFn: getKecamatans,
  });
  
  const { data: desaList = [], isLoading: isLoadingDesa } = useQuery({
    queryKey: ["desa", selectedKecamatanId],
    queryFn: () => getDesasByKecamatan(selectedKecamatanId),
    enabled: !!selectedKecamatanId,
  });

  const { data: pplList = [], isLoading: isLoadingPPL } = useQuery({
    queryKey: ["petugas", "ppl", user?.role, user?.id],
    queryFn: async () => {
      // For now, let's fetch PPL based on the current user's role
      const { data, error } = await supabase
        .from('users')
        .select('id, name, username, pml_id')
        .eq('role', 'ppl')
        .order('name');
        
      if (error) throw error;

      // If current user is PML, filter PPLs assigned to them
      if (user?.role === 'pml') {
        return (data || []).filter(ppl => ppl.pml_id === user.id);
      }
      
      return data || [];
    },
    enabled: !!user,
  });
  
  const { data: allocatedDesa = [], isLoading: isLoadingAllocated } = useQuery({
    queryKey: ["allocated_desa"],
    queryFn: getAllocatedDesaList,
  });
  
  const allocateDesaMutation = useMutation({
    mutationFn: (values: { 
      desaId: string;
      pplId: string;
    }) => allocateDesa(
      values.desaId,
      values.pplId, 
      user?.role === 'pml' ? user.id : null
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocated_desa"] });
      setSelectedDesaId("");
    },
  });
  
  const handleAllocate = () => {
    if (!selectedDesaId || !selectedPPLId) {
      toast.error("Pilih desa dan PPL terlebih dahulu");
      return;
    }
    
    const desaAlreadyAllocated = allocatedDesa.some(
      desa => desa.desa_id === selectedDesaId && desa.is_allocated
    );
    
    if (desaAlreadyAllocated) {
      toast.error("Desa ini sudah dialokasikan");
      return;
    }
    
    allocateDesaMutation.mutate({
      desaId: selectedDesaId,
      pplId: selectedPPLId
    });
  };

  // Filter allocated desa based on search term
  const filteredAllocatedDesa = allocatedDesa.filter(desa => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      desa.desa_name?.toLowerCase().includes(searchLower) ||
      desa.kecamatan_name?.toLowerCase().includes(searchLower) ||
      desa.ppl_name?.toLowerCase().includes(searchLower)
    );
  });
  
  const getStatusBadge = (status?: string | null) => {
    if (!status) return <Badge variant="outline">Belum</Badge>;
    
    switch (status) {
      case "belum":
        return <Badge variant="outline">Belum</Badge>;
      case "proses":
        return <Badge variant="secondary">Sedang Dikerjakan</Badge>;
      case "selesai":
        return <Badge className="bg-green-500 hover:bg-green-600">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Alokasi Petugas</h1>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Alokasi</CardTitle>
              <CardDescription>
                Tetapkan desa untuk petugas pencacah
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kecamatan">Kecamatan</Label>
                  <Select 
                    value={selectedKecamatanId} 
                    onValueChange={(value) => {
                      setSelectedKecamatanId(value);
                      setSelectedDesaId("");
                    }}
                  >
                    <SelectTrigger id="kecamatan">
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
                
                <div className="space-y-2">
                  <Label htmlFor="desa">Desa</Label>
                  <Select 
                    value={selectedDesaId} 
                    onValueChange={setSelectedDesaId}
                    disabled={isLoadingDesa || !selectedKecamatanId}
                  >
                    <SelectTrigger id="desa">
                      <SelectValue 
                        placeholder={
                          isLoadingDesa 
                            ? "Memuat..." 
                            : !selectedKecamatanId 
                            ? "Pilih kecamatan dulu" 
                            : "Pilih Desa"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {desaList.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Tidak ada desa di kecamatan ini
                        </SelectItem>
                      ) : (
                        desaList.map((desa: any) => {
                          const isAllocated = allocatedDesa.some(
                            ad => ad.desa_id === desa.id && ad.is_allocated
                          );
                          return (
                            <SelectItem 
                              key={desa.id} 
                              value={desa.id}
                              disabled={isAllocated}
                            >
                              {desa.name} {isAllocated && "(Sudah dialokasikan)"}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ppl">PPL (Petugas Pencacah)</Label>
                  <Select 
                    value={selectedPPLId} 
                    onValueChange={setSelectedPPLId}
                    disabled={isLoadingPPL}
                  >
                    <SelectTrigger id="ppl">
                      <SelectValue placeholder={isLoadingPPL ? "Memuat..." : "Pilih PPL"} />
                    </SelectTrigger>
                    <SelectContent>
                      {pplList.length === 0 ? (
                        <SelectItem value="none" disabled>
                          {user?.role === 'pml' 
                            ? "Tidak ada PPL yang ditugaskan kepada Anda" 
                            : "Tidak ada data PPL"}
                        </SelectItem>
                      ) : (
                        pplList.map((ppl: any) => (
                          <SelectItem key={ppl.id} value={ppl.id}>
                            {ppl.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleAllocate}
                  disabled={allocateDesaMutation.isPending || !selectedDesaId || !selectedPPLId}
                >
                  {allocateDesaMutation.isPending ? "Menyimpan..." : "Simpan Alokasi"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="space-y-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <CardTitle>Daftar Alokasi</CardTitle>
                <div className="flex-1 md:max-w-xs">
                  <Input
                    placeholder="Cari desa atau PPL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAllocated ? (
                <div className="text-center py-4">Memuat data alokasi...</div>
              ) : filteredAllocatedDesa.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada alokasi"}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kecamatan</TableHead>
                        <TableHead>Desa</TableHead>
                        <TableHead>PPL</TableHead>
                        <TableHead>PML</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAllocatedDesa.map((desa) => (
                        <TableRow key={desa.desa_id}>
                          <TableCell>{desa.kecamatan_name}</TableCell>
                          <TableCell>{desa.desa_name}</TableCell>
                          <TableCell>{desa.ppl_name || "-"}</TableCell>
                          <TableCell>{desa.pml_name || "-"}</TableCell>
                          <TableCell>{getStatusBadge(desa.status)}</TableCell>
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
    </div>
  );
}
