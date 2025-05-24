import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

interface PendataanProgress {
  id: string;
  desa_id: string;
  ppl_id: string;
  desa_name: string;
  kecamatan_name: string;
  ppl_name: string;
  status: string;
  verification_status: string;
  persentase_selesai: number;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
}

// Fetch progress data for PPL role
const fetchPendataanProgressForPPL = async (pplId: string): Promise<PendataanProgress[]> => {
  console.log("Fetching pendataan progress for PPL:", pplId);
  
  // Get allocated desa for this PPL
  const { data: alokasiData, error: alokasiError } = await supabase
    .from('alokasi_petugas')
    .select(`
      desa_id,
      desa:desa_id (
        id,
        name,
        kecamatan:kecamatan_id (
          id,
          name
        )
      )
    `)
    .eq('ppl_id', pplId);

  if (alokasiError) {
    console.error('Error fetching alokasi:', alokasiError);
    throw alokasiError;
  }

  if (!alokasiData || alokasiData.length === 0) {
    return [];
  }

  const desaIds = alokasiData.map(item => item.desa_id);

  // Get pendataan data for allocated desa
  const { data: pendataanData, error: pendataanError } = await supabase
    .from('data_pendataan_desa')
    .select(`
      *,
      ppl:ppl_id (
        id,
        name
      )
    `)
    .in('desa_id', desaIds)
    .eq('ppl_id', pplId);

  if (pendataanError) {
    console.error('Error fetching pendataan data:', pendataanError);
    throw pendataanError;
  }

  // Combine data
  const progressData = alokasiData.map((alokasi: any) => {
    const pendataan = pendataanData?.find(p => p.desa_id === alokasi.desa_id);
    
    return {
      id: pendataan?.id || alokasi.desa_id,
      desa_id: alokasi.desa_id,
      ppl_id: pplId,
      desa_name: alokasi.desa?.name || 'Unknown',
      kecamatan_name: alokasi.desa?.kecamatan?.name || 'Unknown',
      ppl_name: pendataan?.ppl?.name || 'Unknown',
      status: pendataan?.status || 'belum',
      verification_status: pendataan?.verification_status || 'belum_verifikasi',
      persentase_selesai: pendataan?.persentase_selesai || 0,
      tanggal_mulai: pendataan?.tanggal_mulai || null,
      tanggal_selesai: pendataan?.tanggal_selesai || null
    };
  });

  return progressData;
};

// Fetch progress data for PML role
const fetchPendataanProgressForPML = async (pmlId: string): Promise<PendataanProgress[]> => {
  // Get PPLs under this PML
  const { data: pplData, error: pplError } = await supabase
    .from('users')
    .select('id, name')
    .eq('pml_id', pmlId)
    .eq('role', 'ppl');

  if (pplError) {
    console.error('Error fetching PPLs:', pplError);
    throw pplError;
  }

  if (!pplData || pplData.length === 0) {
    return [];
  }

  const pplIds = pplData.map(ppl => ppl.id);

  // Get pendataan data for all PPLs under this PML
  const { data: pendataanData, error: pendataanError } = await supabase
    .from('data_pendataan_desa')
    .select(`
      *,
      desa:desa_id (
        id,
        name,
        kecamatan:kecamatan_id (
          id,
          name
        )
      ),
      ppl:ppl_id (
        id,
        name
      )
    `)
    .in('ppl_id', pplIds);

  if (pendataanError) {
    console.error('Error fetching pendataan data:', pendataanError);
    throw pendataanError;
  }

  // Transform data
  const progressData = pendataanData?.map((item: any) => ({
    id: item.id,
    desa_id: item.desa_id,
    ppl_id: item.ppl_id,
    desa_name: item.desa?.name || 'Unknown',
    kecamatan_name: item.desa?.kecamatan?.name || 'Unknown',
    ppl_name: item.ppl?.name || 'Unknown',
    status: item.status || 'belum',
    verification_status: item.verification_status || 'belum_verifikasi',
    persentase_selesai: item.persentase_selesai || 0,
    tanggal_mulai: item.tanggal_mulai,
    tanggal_selesai: item.tanggal_selesai
  })) || [];

  return progressData;
};

export default function ProgressUbinanPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch data based on user role
  const { data: progressData = [], isLoading, error } = useQuery({
    queryKey: ['pendataan_progress', user?.id, user?.role],
    queryFn: async () => {
      if (!user?.id || !user?.role) return [];
      
      if (user.role === UserRole.PPL) {
        return fetchPendataanProgressForPPL(user.id);
      } else if (user.role === UserRole.PML) {
        return fetchPendataanProgressForPML(user.id);
      }
      
      return [];
    },
    enabled: !!user?.id && !!user?.role
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "belum":
        return <Badge variant="outline">Belum Dikerjakan</Badge>;
      case "proses":
        return <Badge variant="secondary">Sedang Dikerjakan</Badge>;
      case "selesai":
        return <Badge className="bg-green-500 hover:bg-green-600">Selesai</Badge>;
      case "approved":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Disetujui</Badge>;
      case "ditolak":
        return <Badge className="bg-red-500 hover:bg-red-600">Ditolak</Badge>;
      default:
        return <Badge variant="outline">Belum Dikerjakan</Badge>;
    }
  };

  const getVerificationBadge = (verificationStatus: string) => {
    switch (verificationStatus) {
      case "belum_verifikasi":
        return <Badge className="bg-orange-500">Menunggu Verifikasi</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Disetujui</Badge>;
      case "ditolak":
        return <Badge className="bg-red-500">Ditolak</Badge>;
      default:
        return <Badge className="bg-gray-500">-</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long", 
      year: "numeric"
    });
  };

  const filteredData = progressData.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.desa_name.toLowerCase().includes(searchLower) ||
        item.kecamatan_name.toLowerCase().includes(searchLower) ||
        item.ppl_name.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
          <span>Gagal memuat data. Silakan coba lagi.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Pendataan Desa</h1>
          <p className="text-gray-500">Pantau progress pendataan potensi desa</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Progress Pendataan</CardTitle>
          <CardDescription>
            {user?.role === UserRole.PPL 
              ? "Daftar desa yang menjadi tanggung jawab Anda" 
              : "Daftar progress pendataan dari semua PPL"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Cari</Label>
              <Input
                id="search"
                placeholder="Cari berdasarkan desa, kecamatan, atau PPL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="belum">Belum Dikerjakan</option>
                <option value="proses">Sedang Dikerjakan</option>
                <option value="selesai">Selesai</option>
                <option value="approved">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Desa</TableHead>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead>PPL</TableHead>
                  <TableHead>Status Pendataan</TableHead>
                  <TableHead>Status Verifikasi</TableHead>
                  <TableHead>Progress (%)</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {progressData.length === 0 ? "Tidak ada data pendataan" : "Tidak ada data yang sesuai filter"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.desa_name}</TableCell>
                      <TableCell>{item.kecamatan_name}</TableCell>
                      <TableCell>{item.ppl_name}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{getVerificationBadge(item.verification_status)}</TableCell>
                      <TableCell>{item.persentase_selesai}%</TableCell>
                      <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                      <TableCell>{formatDate(item.tanggal_selesai)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
