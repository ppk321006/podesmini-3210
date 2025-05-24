
import { supabase } from "@/integrations/supabase/client";

export async function getVerificationDataForPML(pmlId: string) {
  try {
    // Get all PPLs managed by this PML
    const { data: pplData, error: pplError } = await supabase
      .from('users')
      .select('id')
      .eq('pml_id', pmlId);
    
    if (pplError) throw pplError;
    
    if (!pplData || pplData.length === 0) {
      // Also check alokasi_petugas table
      const { data: alokasiPPLs, error: alokasiError } = await supabase
        .from('alokasi_petugas')
        .select('ppl_id')
        .eq('pml_id', pmlId);
      
      if (alokasiError) throw alokasiError;
      
      if (!alokasiPPLs || alokasiPPLs.length === 0) {
        return [];
      }
      
      const pplIds = alokasiPPLs.map(item => item.ppl_id);
      
      // Get pendataan data that needs verification
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .select(`
          id,
          desa_id,
          ppl_id,
          status,
          jumlah_keluarga,
          jumlah_lahan_pertanian,
          status_infrastruktur,
          potensi_ekonomi,
          catatan_khusus,
          persentase_selesai,
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
        .in('ppl_id', pplIds);
      
      if (error) throw error;
      
      return data || [];
    }
    
    // Combine PPL IDs from both sources
    const allPplIds = pplData.map(item => item.id);
    
    // Get pendataan data that needs verification
    const { data, error } = await supabase
      .from('data_pendataan_desa')
      .select(`
        id,
        desa_id,
        ppl_id,
        status,
        jumlah_keluarga,
        jumlah_lahan_pertanian,
        status_infrastruktur,
        potensi_ekonomi,
        catatan_khusus,
        persentase_selesai,
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
      .in('ppl_id', allPplIds);
    
    if (error) throw error;
    
    return data || [];
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
    return data;
  } catch (error) {
    console.error("Error approving data:", error);
    throw error;
  }
}

export async function rejectDataPendataan(dataId: string, reason: string) {
  try {
    const { data, error } = await supabase
      .from('data_pendataan_desa')
      .update({ 
        verification_status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', dataId)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error rejecting data:", error);
    throw error;
  }
}
