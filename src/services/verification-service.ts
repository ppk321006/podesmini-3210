
import { supabase } from "@/integrations/supabase/client";
import { PendataanDataItem, VerificationStatus } from "@/types/pendataan-types";

export async function getPendataanDataForVerification(pmlId: string) {
  try {
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
        ),
        ppl:ppl_id(
          id,
          name,
          username
        )
      `)
      .eq('status', 'selesai')
      .or(`verification_status.eq.belum_verifikasi,verification_status.is.null`);
      
    if (error) {
      console.error("Error fetching data for verification:", error);
      throw error;
    }
    
    // Transform the data to match our type structure
    const processedData = data.map(item => {
      // Extract desa and kecamatan data from the nested structure
      const desaData = item.desa ? {
        id: item.desa.id,
        name: item.desa.name,
        kecamatan_id: item.desa.kecamatan?.id,
        kecamatan: item.desa.kecamatan ? {
          id: item.desa.kecamatan.id,
          name: item.desa.kecamatan.name
        } : undefined
      } : undefined;
      
      // Extract ppl data from the nested structure
      const pplData = item.ppl ? {
        id: item.ppl.id,
        name: item.ppl.name,
        username: item.ppl.username
      } : undefined;
      
      return {
        ...item,
        desa: desaData,
        ppl: pplData
      } as PendataanDataItem;
    });
    
    return processedData;
  } catch (error) {
    console.error("Error in getPendataanDataForVerification:", error);
    return [];
  }
}

export async function verifyPendataanData(
  dataId: string,
  status: VerificationStatus,
  rejectionReason?: string
) {
  try {
    const updateData: {
      verification_status: VerificationStatus;
      rejection_reason?: string;
    } = { verification_status: status };
    
    if (status === 'ditolak' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }
    
    const { data, error } = await supabase
      .from('data_pendataan_desa')
      .update(updateData)
      .eq('id', dataId)
      .select();
      
    if (error) {
      console.error("Error updating verification status:", error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error("Error in verifyPendataanData:", error);
    throw error;
  }
}
