
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ProgressTableSimplified } from './components/progress-table-simplified';
import { PendataanDataItem } from '@/types/pendataan-types';
import { UserRole } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';

export default function ProgressUbinanPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState<PendataanDataItem[]>([]);
  const [filteredData, setFilteredData] = useState<PendataanDataItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kecamatanFilter, setKecamatanFilter] = useState<string>('all');
  const [kecamatanList, setKecamatanList] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    if (user?.id) {
      fetchProgressData();
    }
  }, [user?.id]);
  
  useEffect(() => {
    filterData();
  }, [progressData, searchTerm, statusFilter, kecamatanFilter]);
  
  const fetchProgressData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      let query = supabase
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
        `);

      // Apply role-based filtering
      if (user.role === UserRole.PPL) {
        query = query.eq('ppl_id', user.id);
      } else if (user.role === UserRole.PML) {
        // Get PPL IDs under this PML
        const { data: pplData } = await supabase
          .from('users')
          .select('id')
          .eq('pml_id', user.id)
          .eq('role', 'ppl');
        
        if (pplData && pplData.length > 0) {
          const pplIds = pplData.map(ppl => ppl.id);
          query = query.in('ppl_id', pplIds);
        }
      }
      // For ADMIN role, no additional filtering is applied (fetch all data)

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching progress data:', error);
        toast.error('Gagal memuat data progress');
        return;
      }
      
      setProgressData(data || []);
      
      // Extract unique kecamatan for filter
      const uniqueKecamatan = [...new Map(
        (data || [])
          .filter(item => item.desa?.kecamatan)
          .map(item => [item.desa.kecamatan.id, {
            id: item.desa.kecamatan.id,
            name: item.desa.kecamatan.name
          }])
      ).values()];
      
      setKecamatanList(uniqueKecamatan);
      
    } catch (error) {
      console.error('Error in fetchProgressData:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterData = () => {
    let filtered = progressData;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.desa?.name?.toLowerCase().includes(searchLower) ||
        item.desa?.kecamatan?.name?.toLowerCase().includes(searchLower) ||
        item.ppl?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Kecamatan filter
    if (kecamatanFilter !== 'all') {
      filtered = filtered.filter(item => item.desa?.kecamatan?.id === kecamatanFilter);
    }
    
    setFilteredData(filtered);
  };
  
  const getProgressSummary = () => {
    const total = progressData.length;
    const selesai = progressData.filter(item => item.status === 'selesai').length;
    const proses = progressData.filter(item => item.status === 'proses').length;
    const belum = progressData.filter(item => item.status === 'belum').length;
    
    return { total, selesai, proses, belum };
  };
  
  const summary = getProgressSummary();
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Pendataan Desa</h1>
          <p className="text-gray-500">Pantau progress pendataan desa secara real-time</p>
        </div>
        <Button 
          onClick={fetchProgressData}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Desa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-gray-500">100%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.selesai}</div>
            <p className="text-xs text-gray-500">
              {summary.total > 0 ? `${Math.round((summary.selesai / summary.total) * 100)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sedang Proses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.proses}</div>
            <p className="text-xs text-gray-500">
              {summary.total > 0 ? `${Math.round((summary.proses / summary.total) * 100)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Belum Dimulai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{summary.belum}</div>
            <p className="text-xs text-gray-500">
              {summary.total > 0 ? `${Math.round((summary.belum / summary.total) * 100)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Cari</Label>
              <Input
                id="search"
                placeholder="Cari desa, kecamatan, atau PPL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="belum">Belum Dikerjakan</SelectItem>
                  <SelectItem value="proses">Sedang Dikerjakan</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="kecamatan">Kecamatan</Label>
              <Select value={kecamatanFilter} onValueChange={setKecamatanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kecamatan</SelectItem>
                  {kecamatanList.map((kecamatan) => (
                    <SelectItem key={kecamatan.id} value={kecamatan.id}>
                      {kecamatan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setKecamatanFilter('all');
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Progress Table */}
      <ProgressTableSimplified 
        data={filteredData}
        isLoading={isLoading}
      />
    </div>
  );
}
