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
  assignPPLToNKS, 
  getNKSByPPL, 
  removePPLAssignment, 
  getNKSDetails, 
  getDesaById,
  getKecamatanById,
  getAllocationStatus
} from "@/services/wilayah-api";
import { Desa, Kecamatan, NKS, Petugas, AllocationStatus } from "@/types/database-schema";
import { Search, Loader2, AlertCircle, Map, User, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AlokasiPetugasPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("allocate");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPPL, setSelectedPPL] = useState<string>("");
  const [selectedPML, setSelectedPML] = useState<string>("");
  const [selectedNKS, setSelectedNKS] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "nks" | "segmen">("all");
  const [filterAllocated, setFilterAllocated] = useState<"all" | "allocated" | "unallocated">("all");
  
  const { data: pplList = [], isLoading: isLoadingPPL } = useQuery({
    queryKey: ["petugas", "ppl"],
    queryFn: () => getPPLList(),
  });
  
  const { data: pmlList = [], isLoading: isLoadingPML } = useQuery({
    queryKey: ["petugas", "pml"],
    queryFn: () => getPMLList(),
  });
  
  const { 
    data: allocationStatus = [], 
    isLoading: isLoadingAllocation
  } = useQuery({
    queryKey: ["allocation_status"],
    queryFn: () => getAllocationStatus(),
  });
  
  const { 
    data: assignedNKS = [], 
    isLoading: isLoadingAssignedNKS, 
    refetch: refetchAssignedNKS 
  } = useQuery({
    queryKey: ["wilayah", "assigned", selectedPPL],
    queryFn: () => selectedPPL ? getNKSByPPL(selectedPPL) : Promise.resolve([]),
    enabled: !!selectedPPL && activeTab === "view",
  });
  
  const assignMutation = useMutation({
    mutationFn: ({ nksId, pplId, pmlId }: { nksId: string; pplId: string; pmlId: string }) => 
      assignPPLToNKS(nksId, pplId, pmlId),
    onSuccess: () => {
      toast.success("PPL berhasil dialokasikan ke NKS");
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
      queryClient.invalidateQueries({ queryKey: ["allocation_status"] });
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
  
  const removeMutation = useMutation({
    mutationFn: ({ nksId, pplId }: { nksId: string; pplId: string }) => 
      removePPLAssignment(nksId, pplId),
    onSuccess: () => {
      toast.success("Alokasi PPL berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
      queryClient.invalidateQueries({ queryKey: ["allocation_status"] });
      if (selectedPPL) {
        refetchAssignedNKS();
      }
    },
    onError: (error) => {
      console.error("Error removing PPL assignment:", error);
      toast.error("Gagal menghapus alokasi PPL");
    }
  });
  
  const getPPLName = (id: string) => {
    const ppl = pplList.find(p => p.id === id);
    return ppl ? ppl.name : "-";
  };
  
  const getPMLName = (id: string) => {
    const pml = pmlList.find(p => p.id === id);
    return pml ? pml.name : "-";
  };
  
  const filteredAllocationStatus = allocationStatus.filter(item => {
    const searchMatch = 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.desa_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.kecamatan_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = filterType === "all" || item.type === filterType;
    
    const allocatedMatch = 
      filterAllocated === "all" || 
      (filterAllocated === "allocated" && item.is_allocated) || 
      (filterAllocated === "unallocated" && !item.is_allocated);
    
    return searchMatch && typeMatch && allocatedMatch;
  });
  
  const handleAssign = () => {
    if (!selectedPPL || !selectedNKS || !selectedPML) {
      toast.error("Pilih PPL, PML, dan NKS/Segmen terlebih dahulu");
      return;
    }
    
    assignMutation.mutate({
      nksId: selectedNKS,
      pplId: selectedPPL,
      pmlId: selectedPML
    });
  };
  
  const handleRemoveAssignment = (nksId: string, pplId: string) => {
    removeMutation.mutate({ nksId, pplId });
  };
  
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
          <TabsTrigger value="allocate">Alokasikan Petugas</TabsTrigger>
          <TabsTrigger value="view">Lihat Alokasi Petugas</TabsTrigger>
          <TabsTrigger value="status">Status Alokasi</TabsTrigger>
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
                <CardTitle>Pilih NKS/Segmen</CardTitle>
                <CardDescription>Pilih NKS atau Segmen yang akan dialokasikan ke PPL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari NKS/Segmen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={filterType === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterType("all")}
                  >
                    Semua Tipe
                  </Badge>
                  <Badge 
                    variant={filterType === "nks" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterType("nks")}
                  >
                    NKS
                  </Badge>
                  <Badge 
                    variant={filterType === "segmen" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterType("segmen")}
                  >
                    Segmen
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={filterAllocated === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterAllocated("all")}
                  >
                    Semua Status
                  </Badge>
                  <Badge 
                    variant={filterAllocated === "allocated" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterAllocated("allocated")}
                  >
                    Teralokasi
                  </Badge>
                  <Badge 
                    variant={filterAllocated === "unallocated" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterAllocated("unallocated")}
                  >
                    Belum Teralokasi
                  </Badge>
                </div>
                
                {isLoadingAllocation ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2">Memuat data...</span>
                  </div>
                ) : filteredAllocationStatus.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data NKS/Segmen"}
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Kode</TableHead>
                          <TableHead>Desa/Kecamatan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAllocationStatus.slice(0, 10).map((item) => (
                          <TableRow 
                            key={`${item.type}-${item.id}`} 
                            className={selectedNKS === item.id ? "bg-muted" : undefined}
                          >
                            <TableCell>
                              <Badge variant="outline">
                                {item.type === 'nks' ? 'NKS' : 'Segmen'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.code}</TableCell>
                            <TableCell>
                              {item.desa_name} / {item.kecamatan_name}
                            </TableCell>
                            <TableCell>
                              {item.is_allocated ? (
                                <Badge variant="success" className="bg-green-100 text-green-800">
                                  Teralokasi
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-red-100 text-red-800">
                                  Belum Dialokasi
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant={selectedNKS === item.id ? "default" : "outline"} 
                                size="sm"
                                disabled={item.is_allocated}
                                onClick={() => setSelectedNKS(selectedNKS === item.id ? "" : item.id)}
                              >
                                {selectedNKS === item.id ? "Terpilih" : "Pilih"}
                              </Button>
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
        </TabsContent>
        
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Alokasi Petugas PPL</CardTitle>
              <CardDescription>Lihat alokasi wilayah tugas untuk PPL</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Pilih PPL</label>
                <div className="max-w-sm">
                  <Select value={selectedPPL} onValueChange={setSelectedPPL}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih PPL untuk melihat alokasi" />
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
              </div>
              
              {!selectedPPL ? (
                <div className="text-center p-6 bg-muted/20 rounded-lg">
                  <User className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Pilih PPL untuk melihat alokasi wilayah</p>
                </div>
              ) : isLoadingAssignedNKS ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Memuat data alokasi...</span>
                </div>
              ) : assignedNKS.length === 0 ? (
                <div className="text-center p-6 bg-muted/20 rounded-lg">
                  <Map className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">PPL ini belum memiliki alokasi wilayah</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode NKS</TableHead>
                        <TableHead>Desa</TableHead>
                        <TableHead>Kecamatan</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedNKS.map((item) => (
                        <TableRow key={item.nks_id}>
                          <TableCell className="font-medium">{item.nks?.code || "-"}</TableCell>
                          <TableCell>{item.nks?.desa?.name || "-"}</TableCell>
                          <TableCell>{item.nks?.desa?.kecamatan?.name || "-"}</TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRemoveAssignment(item.nks_id, selectedPPL)}
                            >
                              <X className="h-4 w-4 mr-1" /> Hapus Alokasi
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Status Alokasi Wilayah</CardTitle>
              <CardDescription>Pantau status alokasi NKS dan Segmen ke Petugas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari berdasarkan kode, desa, atau kecamatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={filterType === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterType("all")}
                  >
                    Semua Tipe
                  </Badge>
                  <Badge 
                    variant={filterType === "nks" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterType("nks")}
                  >
                    NKS
                  </Badge>
                  <Badge 
                    variant={filterType === "segmen" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterType("segmen")}
                  >
                    Segmen
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={filterAllocated === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterAllocated("all")}
                  >
                    Semua Status
                  </Badge>
                  <Badge 
                    variant={filterAllocated === "allocated" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterAllocated("allocated")}
                  >
                    Teralokasi
                  </Badge>
                  <Badge 
                    variant={filterAllocated === "unallocated" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterAllocated("unallocated")}
                  >
                    Belum Teralokasi
                  </Badge>
                </div>
                
                {isLoadingAllocation ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2">Memuat data...</span>
                  </div>
                ) : filteredAllocationStatus.length === 0 ? (
                  <div className="text-center p-8 bg-muted/20 rounded-lg">
                    <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Tidak ada data yang sesuai dengan filter</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Kode</TableHead>
                          <TableHead>Desa</TableHead>
                          <TableHead>Kecamatan</TableHead>
                          <TableHead>Status Alokasi</TableHead>
                          <TableHead>PPL</TableHead>
                          <TableHead>PML</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAllocationStatus.map((item) => (
                          <TableRow key={`${item.type}-${item.id}`}>
                            <TableCell>
                              <Badge variant="outline">
                                {item.type === 'nks' ? 'NKS' : 'Segmen'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.code}</TableCell>
                            <TableCell>{item.desa_name}</TableCell>
                            <TableCell>{item.kecamatan_name}</TableCell>
                            <TableCell>
                              {item.is_allocated ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" /> Teralokasi
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-100 text-red-800">
                                  <X className="h-3 w-3 mr-1" /> Belum Dialokasi
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{item.ppl_id ? getPPLName(item.ppl_id) : "-"}</TableCell>
                            <TableCell>{item.pml_id ? getPMLName(item.pml_id) : "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
