
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
    
    // Transform the data to match our PendataanDataItem interface
    const transformedData = data?.map(item => {
      // Transform nested desa array to object
      const desa = Array.isArray(item.desa) && item.desa.length > 0 
        ? {
            id: item.desa[0].id,
            name: item.desa[0].name,
            kecamatan: item.desa[0].kecamatan && item.desa[0].kecamatan.length > 0 
              ? {
                  id: item.desa[0].kecamatan[0].id,
                  name: item.desa[0].kecamatan[0].name
                }
              : undefined
          }
        : undefined;
        
      // Transform nested ppl array to object  
      const ppl = Array.isArray(item.ppl) && item.ppl.length > 0
        ? {
            id: item.ppl[0].id,
            name: item.ppl[0].name,
            username: item.ppl[0].username
          }
        : undefined;
        
      return {
        ...item,
        desa,
        ppl
      } as PendataanDataItem;
    }) || [];
    
    return transformedData;
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
