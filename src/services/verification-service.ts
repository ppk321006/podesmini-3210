
import { supabase } from '@/integrations/supabase/client';
import { PendataanDataItem } from '@/types/pendataan-types';

export async function getVerificationDataForPML(pmlId: string): Promise<PendataanDataItem[]> {
  try {
    // Get PPLs supervised by this PML
    const { data: pplsData, error: pplsError } = await supabase
      .from('users')
      .select('id')
      .eq('pml_id', pmlId);
      
    if (pplsError) throw pplsError;
    
    // Get all pendataan data from these PPLs
    const pplIds = pplsData.map(ppl => ppl.id);
    
    if (pplIds.length === 0) return [];
    
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
        persentase_selesai,
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
      .in('ppl_id', pplIds);
    
    if (error) throw error;
    
    return data as PendataanDataItem[] || [];
  } catch (error) {
    console.error('Error fetching verification data:', error);
    throw error;
  }
}

export async function approveDataPendataan(dataId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('data_pendataan_desa')
      .update({ verification_status: 'approved' })
      .eq('id', dataId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error approving data:', error);
    throw error;
  }
}

export async function rejectDataPendataan(dataId: string, reason: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('data_pendataan_desa')
      .update({
        verification_status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', dataId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error rejecting data:', error);
    throw error;
  }
}
