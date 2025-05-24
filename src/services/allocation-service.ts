
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AllocatedDesaItem {
  id: string;
  desa_id: string;
  desa_name: string;
  kecamatan_name: string;
  ppl_id: string;
  ppl_name: string;
  pml_id: string | null;
  pml_name: string | null;
}

export async function getAllocatedDesaList(): Promise<AllocatedDesaItem[]> {
  try {
    // Query from the alokasi_petugas table with joins to get names
    const { data, error } = await supabase
      .from('alokasi_petugas')
      .select(`
        id,
        desa_id,
        ppl_id,
        pml_id,
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
        ),
        pml:pml_id (
          id,
          name
        )
      `);

    if (error) {
      console.error("Error fetching allocated desa list:", error);
      throw error;
    }

    // Transform the data to match the expected interface
    return (data || []).map((item: any) => ({
      id: item.id,
      desa_id: item.desa_id,
      desa_name: item.desa?.name || 'Unknown',
      kecamatan_name: item.desa?.kecamatan?.name || 'Unknown',
      ppl_id: item.ppl_id,
      ppl_name: item.ppl?.name || 'Unknown',
      pml_id: item.pml_id,
      pml_name: item.pml?.name || null
    }));

  } catch (error) {
    console.error("Error in getAllocatedDesaList:", error);
    throw error;
  }
}

export async function allocateDesa(
  desaId: string, 
  pplId: string, 
  pmlId?: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('alokasi_petugas')
      .insert({
        desa_id: desaId,
        ppl_id: pplId,
        pml_id: pmlId || null
      });

    if (error) {
      console.error("Error allocating desa:", error);
      toast.error("Gagal mengalokasikan desa: " + error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in allocateDesa:", error);
    toast.error("Terjadi kesalahan saat mengalokasikan desa");
    return false;
  }
}

// Function to get PPL performance data using direct queries
export async function getPPLPerformance() {
  try {
    // Query users with role PPL and their ubinan data
    const { data: pplUsers, error: pplError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        ubinan_data (
          id,
          status,
          komoditas
        )
      `)
      .eq('role', 'ppl');

    if (pplError) {
      console.error("Error fetching PPL users:", pplError);
      throw pplError;
    }

    // Transform data to performance metrics
    return (pplUsers || []).map((ppl: any) => {
      const ubinanData = ppl.ubinan_data || [];
      const padiData = ubinanData.filter((item: any) => item.komoditas === 'padi');
      const palawijaData = ubinanData.filter((item: any) => item.komoditas !== 'padi');
      
      return {
        ppl_id: ppl.id,
        ppl_name: ppl.name,
        total_count: ubinanData.length,
        padi_count: padiData.length,
        palawija_count: palawijaData.length,
        confirmed_count: ubinanData.filter((item: any) => item.status === 'dikonfirmasi').length,
        pending_count: ubinanData.filter((item: any) => item.status === 'sudah_diisi').length,
        rejected_count: ubinanData.filter((item: any) => item.status === 'ditolak').length
      };
    });

  } catch (error) {
    console.error("Error in getPPLPerformance:", error);
    throw error;
  }
}

// Function to get dashboard data using direct queries
export async function getDashboardData() {
  try {
    // Get all ubinan data with user information
    const { data: ubinanData, error: ubinanError } = await supabase
      .from('ubinan_data')
      .select(`
        id,
        status,
        komoditas,
        created_at,
        ppl:ppl_id (
          id,
          name
        )
      `);

    if (ubinanError) {
      console.error("Error fetching ubinan data:", ubinanError);
      throw ubinanError;
    }

    // Group by PPL and calculate metrics
    const pplMetrics = new Map();
    
    (ubinanData || []).forEach((item: any) => {
      const pplId = item.ppl?.id;
      const pplName = item.ppl?.name;
      
      if (!pplId) return;
      
      if (!pplMetrics.has(pplId)) {
        pplMetrics.set(pplId, {
          ppl_id: pplId,
          ppl_name: pplName,
          total_count: 0,
          padi_count: 0,
          palawija_count: 0,
          confirmed_count: 0,
          pending_count: 0,
          rejected_count: 0
        });
      }
      
      const metrics = pplMetrics.get(pplId);
      metrics.total_count++;
      
      if (item.komoditas === 'padi') {
        metrics.padi_count++;
      } else {
        metrics.palawija_count++;
      }
      
      switch (item.status) {
        case 'dikonfirmasi':
          metrics.confirmed_count++;
          break;
        case 'sudah_diisi':
          metrics.pending_count++;
          break;
        case 'ditolak':
          metrics.rejected_count++;
          break;
      }
    });

    return Array.from(pplMetrics.values());

  } catch (error) {
    console.error("Error in getDashboardData:", error);
    throw error;
  }
}
