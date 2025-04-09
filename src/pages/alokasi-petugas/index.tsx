
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  getPPLList, 
  getPMLList, 
  getUnassignedNKS, 
  assignPPLToNKS, 
  getNKSByPPL, 
  removePPLAssignment, 
  getNKSDetails, 
  getDesaById,
  getKecamatanById
} from "@/services/wilayah-api";
import { Desa, Kecamatan, NKS, Petugas } from "@/types/database-schema";
import { Search, Loader2, AlertCircle, Map, User, X } from "lucide-react";

export default function AlokasiPetugasPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("allocate");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPPL, setSelectedPPL] = useState<string>("");
  const [selectedPML, setSelectedPML] = useState<string>("");
  const [selectedNKS, setSelectedNKS] = useState<string>("");
  
  // Fetch PPL list
  const { data: pplList = [], isLoading: isLoadingPPL } = useQuery({
    queryKey: ["petugas", "ppl"],
    queryFn: () => getPPLList(),
  });
  
  // Fetch PML list
  const { data: pmlList = [], isLoading: isLoadingPML } = useQuery({
    queryKey: ["petugas", "pml"],
    queryFn: () => getPMLList(),
  });
  
  // Fetch unassigned NKS
  const { 
    data: unassignedNKS = [], 
    isLoading: isLoadingNKS, 
    refetch: refetchUnassignedNKS 
  } = useQuery({
    queryKey: ["wilayah", "unassigned"],
    queryFn: () => getUnassignedNKS(),
  });
  
  // Fetch assigned NKS for a PPL
  const { 
    data: assignedNKS = [], 
    isLoading: isLoadingAssignedNKS, 
    refetch: refetchAssignedNKS 
  } = useQuery({
    queryKey: ["wilayah", "assigned", selectedPPL],
    queryFn: () => selectedPPL ? getNKSByPPL(selectedPPL) : Promise.resolve([]),
    enabled: !!selectedPPL && activeTab === "view",
  });
  
  // Assign PPL to NKS mutation
  const assignMutation = useMutation({
    mutationFn: ({ nksId, pplId, pmlId }: { nksId: string; pplId: string; pmlId: string }) => 
      assignPPLToNKS(nksId, pplId, pmlId),
    onSuccess: () => {
      toast.success("PPL berhasil dialokasikan ke NKS");
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
      refetchUnassignedNKS();
      if (selectedPPL) {
        refetchAssignedNKS();
      }
      setSelectedNKS("");
    },
    onError: (error) => {
      console.error("Error assigning PPL to NKS:", error);
      toast.error("Gagal mengalokasikan PPL ke NKS");
    }
  });
  
  // Remove PPL assignment mutation
  const removeMutation = useMutation({
    mutationFn: ({ nksId, pplId }: { nksId: string; pplId: string }) => 
      removePPLAssignment(nksId, pplId),
    onSuccess: () => {
      toast.success("Alokasi PPL berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
      refetchUnassignedNKS();
      if (selectedPPL) {
        refetchAssignedNKS();
      }
    },
    onError: (error) => {
      console.error("Error removing PPL assignment:", error);
      toast.error("Gagal menghapus alokasi PPL");
    }
  });
  
  // Get the PPL name based on ID
  const getPPLName = (id: string) => {
    const ppl = pplList.find(p => p.id === id);
    return ppl ? ppl.name : "-";
  };
  
  // Get the PML name based on ID
  const getPMLName = (id: string) => {
    const pml = pmlList.find(p => p.id === id);
    return pml ? pml.name : "-";
  };
  
  // Filter NKS by search term
  const filteredNKS = unassignedNKS.filter(nks => 
    nks.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle assigning PPL to NKS
  const handleAssign = () => {
    if (!selectedPPL || !selectedNKS || !selectedPML) {
      toast.error("Pilih PPL, PML, dan NKS terlebih dahulu");
      return;
    }
    
    assignMutation.mutate({
      nksId: selectedNKS,
      pplId: selectedPPL,
      pmlId: selectedPML
    });
  };
  
  // Handle removing PPL assignment
  const handleRemoveAssignment = (nksId: string, pplId: string) => {
    removeMutation.mutate({ nksId, pplId });
  };
  
  // Effect to reset the PPL selection when tab changes
  useEffect(() => {
    if (activeTab === "allocate") {
      setSelectedPPL("");
    }
  }, [activeTab]);
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Alokasi Petugas</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="allocate">Alokasikan PPL</TabsTrigger>
          <TabsTrigger value="view">Lihat Alokasi PPL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="allocate">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Pilih Petugas</CardTitle>
                <CardDescription>Pilih PPL dan PML yang akan dialokasikan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Petugas PPL</label>
                  <Select value={selectedPPL} onValueChange={setSelectedPPL}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih PPL" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingPPL ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Memuat...</span>
                        </div>
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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Petugas PML (Pengawas)</label>
                  <Select value={selectedPML} onValueChange={setSelectedPML}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih PML" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingPML ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Memuat...</span>
                        </div>
                      ) : (
                        pmlList.map((pml) => (
                          <SelectItem key={pml.id} value={pml.id}>
                            {pml.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleAssign}
                  disabled={!selectedPPL || !selectedNKS || !selectedPML || assignMutation.isPending}
                >
                  {assignMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Alokasikan Petugas"
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Pilih NKS</CardTitle>
                <CardDescription>Pilih NKS yang akan dialokasikan ke PPL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari NKS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                
                {isLoadingNKS ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2">Memuat data NKS...</span>
                  </div>
                ) : filteredNKS.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "Tidak ada NKS yang sesuai dengan pencarian" : "Semua NKS sudah dialokasikan"}
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Kode</TableHead>
                          <TableHead>Desa/Kecamatan</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNKS.slice(0, 10).map((nks) => (
                          <TableRow 
                            key={nks.id} 
                            className={selectedNKS === nks.id ? "bg-muted" : undefined}
                          >
                            <TableCell className="font-medium">{nks.code}</TableCell>
                            <TableCell>
                              {/* In a real implementation, you would fetch and display desa/kecamatan names */}
                              Desa/Kecamatan
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant={selectedNKS === nks.id ? "default" : "outline"} 
                                size="sm"
                                onClick={() => setSelectedNKS(selectedNKS === nks.id ? "" : nks.id)}
                              >
                                {selectedNKS === nks.id ? "Terpilih" : "Pilih"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredNKS.length > 10 && (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Menampilkan 10 dari {filteredNKS.length} NKS
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Lihat Alokasi PPL</CardTitle>
              <CardDescription>Pilih PPL untuk melihat alokasi wilayah tugasnya</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedPPL} onValueChange={setSelectedPPL}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Pilih PPL" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingPPL ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Memuat...</span>
                      </div>
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
              
              {selectedPPL && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Map className="h-5 w-5 text-simonita-green" />
                    <h3 className="text-lg font-medium">
                      Wilayah Tugas untuk: {getPPLName(selectedPPL)}
                    </h3>
                  </div>
                  
                  {isLoadingAssignedNKS ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2">Memuat data alokasi...</span>
                    </div>
                  ) : assignedNKS.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        PPL ini belum memiliki alokasi wilayah tugas
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kode NKS</TableHead>
                          <TableHead>Desa</TableHead>
                          <TableHead>Kecamatan</TableHead>
                          <TableHead>PML</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedNKS.map((assignment: any) => (
                          <TableRow key={assignment.nks_id}>
                            <TableCell className="font-medium">
                              {assignment.nks?.code || "-"}
                            </TableCell>
                            <TableCell>
                              {assignment.nks?.desa?.name || "-"}
                            </TableCell>
                            <TableCell>
                              {assignment.nks?.desa?.kecamatan?.name || "-"}
                            </TableCell>
                            <TableCell>
                              {/* We would get this from the wilayah_tugas record */}
                              {getPMLName(assignment.pml_id || "")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveAssignment(assignment.nks_id, selectedPPL)}
                                disabled={removeMutation.isPending}
                              >
                                {removeMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                                <span className="sr-only">Hapus alokasi</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
