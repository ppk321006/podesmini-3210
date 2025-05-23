
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper function to validate UUID
function isValidUUID(id: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function getAllocatedDesaList() {
  try {
    console.log("Fetching allocated desa list...");
    // Tambah cache dan debounce untuk mencegah blinking
    const cacheKey = 'allocated_desa_list';
    const cachedData = sessionStorage.getItem(cacheKey);
    
    // Gunakan data cache sementara permintaan baru diproses
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const { data, error } = await supabase
      .from('desa_allocation_view')
      .select('*')
      .order('kecamatan_name', { ascending: true })
      .order('desa_name', { ascending: true });

    if (error) {
      console.error("Error fetching allocated desa list:", error);
      throw error;
    }
    
    // Simpan data ke cache untuk menghindari fetching berulang
    const result = data || [];
    sessionStorage.setItem(cacheKey, JSON.stringify(result));
    console.log("Allocated desa list fetched:", result.length, "items");
    return result;
  } catch (error) {
    console.error("Error fetching allocated desa list:", error);
    toast.error("Gagal mengambil data desa");
    return [];
  }
}

export async function allocateDesa(
  desaId: string,
  pplId: string,
  pmlId: string | null
) {
  try {
    console.log("Allocating desa:", { desaId, pplId, pmlId });
    
    const { error } = await supabase
      .from('alokasi_petugas')
      .insert({
        desa_id: desaId,
        ppl_id: pplId,
        pml_id: pmlId
      });

    if (error) {
      if (error.code === '23505') {
        toast.error("Desa ini sudah dialokasikan");
        return false;
      }
      throw error;
    }

    // Initialize status_pendataan_desa record
    const { error: statusError } = await supabase
      .from('status_pendataan_desa')
      .insert({
        desa_id: desaId,
        ppl_id: pplId,
        status: 'belum'
      });

    if (statusError) throw statusError;
    
    // Hapus cache setelah perubahan
    sessionStorage.removeItem('allocated_desa_list');

    toast.success("Desa berhasil dialokasikan");
    return true;
  } catch (error) {
    console.error("Error allocating desa:", error);
    toast.error("Gagal mengalokasikan desa");
    return false;
  }
}

export async function updateDesaStatus(
  desaId: string,
  status: 'belum' | 'proses' | 'selesai',
  target?: number | null
) {
  try {
    console.log("Updating desa status:", { desaId, status, target });
    
    const updateData: any = { status };
    
    // Set dates based on status
    if (status === 'proses') {
      updateData.tanggal_mulai = new Date().toISOString();
      updateData.tanggal_selesai = null;
    } else if (status === 'selesai') {
      if (!updateData.tanggal_mulai) {
        updateData.tanggal_mulai = new Date().toISOString();
      }
      updateData.tanggal_selesai = new Date().toISOString();
    }

    if (target !== undefined) {
      updateData.target = target;
    }

    const { error } = await supabase
      .from('status_pendataan_desa')
      .update(updateData)
      .eq('desa_id', desaId);

    if (error) throw error;
    
    // Hapus cache setelah perubahan
    sessionStorage.removeItem('allocated_desa_list');

    toast.success("Status desa berhasil diperbarui");
    return true;
  } catch (error) {
    console.error("Error updating desa status:", error);
    toast.error("Gagal memperbarui status desa");
    return false;
  }
}

export async function getDesaStatus(desaId: string) {
  try {
    const { data, error } = await supabase
      .from('status_pendataan_desa')
      .select('*')
      .eq('desa_id', desaId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return data;
  } catch (error) {
    console.error("Error getting desa status:", error);
    return null;
  }
}

// Fungsi untuk mengambil data dashboard khusus untuk PPL
export async function getPPLDashboardData(pplId: string) {
  try {
    console.log("Fetching PPL dashboard data for:", pplId);
    
    if (!pplId) {
      console.error("Invalid PPL ID: empty ID provided");
      return [];
    }
    
    // Use RLS filtering with eq() rather than direct UUID validation
    // This allows the database to handle the type casting
    const { data, error } = await supabase
      .from('dashboard_ppl_view')
      .select('*')
      .eq('ppl_id', pplId);
      
    if (error) {
      console.error("Error fetching PPL dashboard data:", error);
      throw error;
    }
    
    console.log("PPL dashboard data fetched:", data?.length || 0, "items");
    return data || [];
  } catch (error) {
    console.error("Error fetching PPL dashboard data:", error);
    return [];
  }
}

// Fungsi untuk mengambil data dashboard khusus untuk PML
export async function getPMLDashboardData(pmlId: string) {
  try {
    console.log("Fetching PML dashboard data for:", pmlId);
    
    if (!pmlId) {
      console.error("Invalid PML ID: empty ID provided");
      return [];
    }
    
    // Use RLS filtering with eq() rather than direct UUID validation
    const { data, error } = await supabase
      .from('dashboard_ppl_view')
      .select('*')
      .eq('pml_id', pmlId);
      
    if (error) {
      console.error("Error fetching PML dashboard data:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching PML dashboard data:", error);
    return [];
  }
}

// Fungsi untuk memperbarui verifikasi data ubinan
export async function updateVerifikasiData(
  ubinanId: string, 
  status: 'dikonfirmasi' | 'ditolak',
  alasanPenolakan?: string
) {
  try {
    const updateData: any = { 
      status: status
    };
    
    if (status === 'ditolak' && alasanPenolakan) {
      updateData.alasan_penolakan = alasanPenolakan;
    }

    const { error } = await supabase
      .from('ubinan_data')
      .update(updateData)
      .eq('id', ubinanId);

    if (error) throw error;

    toast.success(
      status === 'dikonfirmasi' 
        ? "Data berhasil disetujui" 
        : "Data berhasil ditolak"
    );
    return true;
  } catch (error) {
    console.error("Error updating verifikasi data:", error);
    toast.error("Gagal memperbarui status verifikasi");
    return false;
  }
}

// Fungsi untuk mendapatkan data pendataan desa
export async function getDataPendataanDesa(pplId: string) {
  try {
    console.log("Fetching data pendataan desa for PPL ID:", pplId);
    
    if (!pplId) {
      console.error("Invalid PPL ID: empty ID provided");
      return [];
    }
    
    // Use RLS filtering with eq() rather than direct UUID validation
    const { data, error } = await supabase
      .from('data_pendataan_desa')
      .select(`
        *,
        desa:desa_id(
          id,
          name,
          kecamatan:kecamatan_id(
            id,
            name
          )
        )
      `)
      .eq('ppl_id', pplId);
      
    if (error) {
      console.error("Error fetching pendataan desa data:", error);
      throw error;
    }
    
    console.log("Pendataan desa data fetched:", data?.length || 0, "items");
    return data || [];
  } catch (error) {
    console.error("Error fetching pendataan desa data:", error);
    return [];
  }
}

// Fungsi untuk mendapatkan status pendataan desa
export async function getAllStatusPendataanDesa() {
  try {
    const { data, error } = await supabase
      .from('status_pendataan_desa')
      .select(`
        *,
        desa:desa_id(
          id,
          name,
          kecamatan:kecamatan_id(
            id,
            name
          )
        ),
        ppl:ppl_id(
          id,
          name
        )
      `);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching pendataan desa status:", error);
    return [];
  }
}

// Fungsi untuk mendapatkan statistik pendataan desa
export async function getPendataanDesaStats() {
  try {
    const { data, error } = await supabase
      .from('status_pendataan_desa')
      .select('status');
      
    if (error) throw error;
    
    const stats = {
      total: data.length,
      belum: 0,
      proses: 0,
      selesai: 0,
    };
    
    data.forEach(item => {
      if (item.status === 'belum') stats.belum++;
      else if (item.status === 'proses') stats.proses++;
      else if (item.status === 'selesai') stats.selesai++;
    });
    
    return stats;
  } catch (error) {
    console.error("Error fetching pendataan desa stats:", error);
    return {
      total: 0,
      belum: 0,
      proses: 0,
      selesai: 0,
    };
  }
}
