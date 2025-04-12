
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserRole } from "@/types/user";
import { getPetugasList, createPetugas, deletePetugas } from "@/services/wilayah-api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export default function PetugasPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  
  // New petugas form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "pml" | "ppl" | "viewer">("ppl");
  const [selectedPmlId, setSelectedPmlId] = useState("");
  
  // Fetch all petugas
  const { data: allPetugas = [], isLoading: isLoadingPetugas } = useQuery({
    queryKey: ["petugas"],
    queryFn: () => getPetugasList(),
  });
  
  // Filtered queries by role
  const { data: pmlList = [] } = useQuery({
    queryKey: ["petugas", "pml"],
    queryFn: () => getPetugasList("pml"),
  });
  
  const { data: pplList = [] } = useQuery({
    queryKey: ["petugas", "ppl"],
    queryFn: () => getPetugasList("ppl"),
  });
  
  // Create petugas mutation
  const createPetugasMutation = useMutation({
    mutationFn: (values: { 
      username: string;
      password: string;
      name: string;
      role: "admin" | "pml" | "ppl" | "viewer";
      pmlId?: string;
    }) => createPetugas(
      values.username,
      values.password,
      values.name,
      values.role,
      values.pmlId
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petugas"] });
      setNewUsername("");
      setNewPassword("");
      setNewName("");
      toast.success("Petugas berhasil ditambahkan");
    },
    onError: (error) => {
      console.error("Error creating petugas:", error);
      toast.error("Gagal menambahkan petugas");
    }
  });
  
  // Delete petugas mutation
  const deletePetugasMutation = useMutation({
    mutationFn: (petugasId: string) => deletePetugas(petugasId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petugas"] });
      toast.success("Petugas berhasil dihapus");
    },
    onError: (error) => {
      console.error("Error deleting petugas:", error);
      toast.error("Gagal menghapus petugas");
    }
  });
  
  // Handle form submission
  const handleAddPetugas = () => {
    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      toast.error("Semua field harus diisi");
      return;
    }
    
    // If role is PPL, check if PML is selected
    if (selectedRole === "ppl" && !selectedPmlId) {
      toast.error("Pilih PML untuk petugas PPL");
      return;
    }
    
    createPetugasMutation.mutate({
      username: newUsername,
      password: newPassword,
      name: newName,
      role: selectedRole,
      pmlId: selectedRole === "ppl" ? selectedPmlId : undefined
    });
  };
  
  // Handle delete petugas
  const handleDeletePetugas = (petugasId: string) => {
    deletePetugasMutation.mutate(petugasId);
  };
  
  const roleFilteredData = () => {
    switch (activeTab) {
      case "admin":
        return allPetugas.filter(p => p.role === "admin");
      case "pml":
        return pmlList;
      case "ppl":
        return pplList;
      default:
        return allPetugas;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Manajemen Petugas</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tambah Petugas Baru</CardTitle>
            <CardDescription>Tambahkan petugas baru ke sistem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Masukkan username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Masukkan nama lengkap"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Peran</Label>
                <Select 
                  value={selectedRole} 
                  onValueChange={(value) => setSelectedRole(value as "admin" | "pml" | "ppl" | "viewer")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="pml">PML (Pengawas)</SelectItem>
                    <SelectItem value="ppl">PPL (Petugas Lapangan)</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedRole === "ppl" && (
                <div className="grid gap-2">
                  <Label htmlFor="pml">Pilih PML</Label>
                  <Select 
                    value={selectedPmlId} 
                    onValueChange={setSelectedPmlId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih PML pengawas" />
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
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              onClick={handleAddPetugas}
              disabled={createPetugasMutation.isPending}
            >
              {createPetugasMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Petugas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="pml">PML</TabsTrigger>
                <TabsTrigger value="ppl">PPL</TabsTrigger>
              </TabsList>
              
              <div>
                {isLoadingPetugas ? (
                  <p>Memuat data...</p>
                ) : roleFilteredData().length === 0 ? (
                  <p className="text-muted-foreground">Belum ada data petugas</p>
                ) : (
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-3 text-left">Nama</th>
                          <th className="p-3 text-left">Username</th>
                          <th className="p-3 text-left">Peran</th>
                          <th className="p-3 text-left">PML</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roleFilteredData().map((petugas) => (
                          <tr key={petugas.id} className="border-t">
                            <td className="p-3">{petugas.name}</td>
                            <td className="p-3">{petugas.username}</td>
                            <td className="p-3">{petugas.role}</td>
                            <td className="p-3">
                              {petugas.pml_id ? (
                                allPetugas.find(p => p.id === petugas.pml_id)?.name || "-"
                              ) : "-"}
                            </td>
                            <td className="p-3 text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Hapus
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Petugas</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus petugas "{petugas.name}"? 
                                      Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeletePetugas(petugas.id)}
                                      className="bg-red-500 hover:bg-red-700"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
