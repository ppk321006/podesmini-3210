import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, 
  CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function AlokasiPetugasPage() {
  const { toast } = useToast();
  const [desaList, setDesaList] = useState([]);
  const [pplList, setPplList] = useState([]);
  const [pmlList, setPmlList] = useState([]);
  const [selectedDesa, setSelectedDesa] = useState("");
  const [selectedPpl, setSelectedPpl] = useState("");
  const [selectedPml, setSelectedPml] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [desaResponse, pplResponse, pmlResponse] = await Promise.all([
        getAllocatedDesaList(),
        supabase.from('users').select('*').eq('role', 'ppl'),
        supabase.from('users').select('*').eq('role', 'pml')
      ]);

      setDesaList(desaResponse);
      setPplList(pplResponse.data || []);
      setPmlList(pmlResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAllocate = async () => {
    if (!selectedDesa || !selectedPpl) {
      toast({
        title: "Error",
        description: "Please select desa and PPL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await allocateDesa(selectedDesa, selectedPpl, selectedPml);
      if (success) {
        toast({
          title: "Success",
          description: "Desa allocated successfully",
        });
        fetchData();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error allocating desa:", error);
      toast({
        title: "Error",
        description: "Failed to allocate desa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDesa("");
    setSelectedPpl("");
    setSelectedPml("");
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Alokasi Petugas ke Desa</CardTitle>
          <CardDescription>
            Alokasikan petugas PPL dan PML untuk setiap desa
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  desaList.map((desa: any) => (
                    <TableRow key={desa.id}>
                      <TableCell>{desa.kecamatan_name}</TableCell>
                      <TableCell>{desa.desa_name}</TableCell>
                      <TableCell>{desa.ppl_name || "-"}</TableCell>
                      <TableCell>{desa.pml_name || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleOpenDialog} className="mt-4">
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
              <Label htmlFor="desa">Desa</Label>
              <Select onValueChange={setSelectedDesa}>
                <SelectTrigger id="desa">
                  <SelectValue placeholder="Pilih Desa" />
                </SelectTrigger>
                <SelectContent>
                  {desaList.map((desa: any) => (
                    <SelectItem key={desa.desa_id} value={desa.desa_id}>
                      {desa.desa_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ppl">PPL</Label>
              <Select onValueChange={setSelectedPpl}>
                <SelectTrigger id="ppl">
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
              <Select onValueChange={setSelectedPml}>
                <SelectTrigger id="pml">
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
            <Button onClick={handleAllocate} disabled={isLoading}>
              Alokasikan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
