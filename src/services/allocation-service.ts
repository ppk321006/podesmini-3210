
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function getAllocatedDesaList() {
  try {
    console.log("Fetching allocated desa list...");
    const { data, error } = await supabase
      .from('desa_allocation_view')
      .select('*')
      .order('kecamatan_name', { ascending: true })
      .order('desa_name', { ascending: true });

    if (error) {
      console.error("Error fetching allocated desa list:", error);
      throw error;
    }
    
    console.log("Allocated desa list fetched:", data?.length || 0, "items");
    return data || [];
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
    const updateData: any = { status };
    
    // Set dates based on status
    if (status === 'proses' && !target) {
      updateData.tanggal_mulai = new Date().toISOString();
      updateData.tanggal_selesai = null;
    } else if (status === 'selesai') {
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
