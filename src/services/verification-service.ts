
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function getVerificationDataForPML(pmlId: string) {
  try {
    // Fetch all the data pendataan that need verification (PPLs under this PML)
    const { data, error } = await supabase
      .from('data_pendataan_desa')
      .select(`
        id,
        desa_id,
        ppl_id,
        jumlah_keluarga,
        jumlah_lahan_pertanian,
        status_infrastruktur,
        potensi_ekonomi,
        catatan_khusus,
        status,
        tanggal_mulai,
        tanggal_selesai,
        verification_status,
        rejection_reason,
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
          name,
          username
        )
      `)
      .or(`status.eq.selesai,verification_status.eq.rejected`);
      
    if (error) throw error;
    
    // Filter the data to only include PPLs under this PML's supervision
    const { data: pplIds, error: pplError } = await supabase
      .from('users')
      .select('id')
      .eq('pml_id', pmlId);
      
    if (pplError) throw pplError;
    
    const pplIdArray = pplIds.map(p => p.id);
    
    // Also check alokasi_petugas for direct assignments
    const { data: alokasiData, error: alokasiError } = await supabase
      .from('alokasi_petugas')
      .select('ppl_id')
      .eq('pml_id', pmlId);
      
    if (alokasiError) throw alokasiError;
    
    const additionalPplIds = alokasiData.map(a => a.ppl_id);
    
    // Combine both sources of PPL IDs
    const allPplIds = [...new Set([...pplIdArray, ...additionalPplIds])];
    
    // Filter data to only include those from supervised PPLs
    const filteredData = data.filter(item => allPplIds.includes(item.ppl_id));
    
    return filteredData;
  } catch (error) {
    console.error("Error fetching verification data:", error);
    throw error;
  }
}

export async function approveDataPendataan(dataId: string) {
  try {
    const { data, error } = await supabase
      .from('data_pendataan_desa')
      .update({ verification_status: 'approved' })
      .eq('id', dataId)
      .select();
      
    if (error) throw error;
    
    toast.success("Data berhasil disetujui");
    return data;
  } catch (error) {
    console.error("Error approving data:", error);
    toast.error("Gagal menyetujui data");
    throw error;
  }
}

export async function rejectDataPendataan(dataId: string, rejectionReason: string) {
  try {
    const { data, error } = await supabase
      .from('data_pendataan_desa')
      .update({ 
        verification_status: 'rejected',
        rejection_reason: rejectionReason
      })
      .eq('id', dataId)
      .select();
      
    if (error) throw error;
    
    toast.success("Data telah ditolak");
    return data;
  } catch (error) {
    console.error("Error rejecting data:", error);
    toast.error("Gagal menolak data");
    throw error;
  }
}
