
import { supabase } from "@/integrations/supabase/client";
import { AlokasiBertugas, PendataanDataItem, PendataanFilter, PendataanStatus, ProgressSummary, VerificationStatus } from "@/types/pendataan-types";
import { UserRole } from "@/types/user";

export async function getPendataanByUserRole(filter: PendataanFilter): Promise<PendataanDataItem[]> {
  try {
    let query = supabase
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
      `);

    // Apply filters based on user role
    if (filter.userRole === UserRole.PPL) {
      query = query.eq('ppl_id', filter.userId);
    } else if (filter.userRole === UserRole.PML) {
      // For PML, get data from PPLs under their supervision
      const { data: pplIds } = await supabase
        .from('users')
        .select('id')
        .eq('pml_id', filter.userId);
        
      if (pplIds && pplIds.length > 0) {
        const ids = pplIds.map(item => item.id);
        query = query.in('ppl_id', ids);
      }
    }
    
    // Additional filters
    if (filter.kecamatanId) {
      query = query.eq('desa.kecamatan_id', filter.kecamatanId);
    }
    
    if (filter.desaId) {
      query = query.eq('desa_id', filter.desaId);
    }
    
    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching data pendataan:", error);
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
    console.error("Error in getPendataanByUserRole:", error);
    return [];
  }
}

export async function getAlokasiBertugasByPplId(pplId: string): Promise<AlokasiBertugas[]> {
  try {
    const { data, error } = await supabase
      .from('alokasi_petugas')
      .select(`
        desa_id,
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
      console.error("Error fetching alokasi bertugas:", error);
      throw error;
    }
    
    // Transform the data to our expected format
    const processedData = data.map(item => {
      // Type assertion to handle the complex nested structure
      const desa = item.desa as any;
      
      return {
        desa_id: item.desa_id,
        desa_name: desa && typeof desa === 'object' ? desa.name || 'Unknown' : 'Unknown',
        kecamatan_name: desa && 
                      typeof desa === 'object' && 
                      desa.kecamatan && 
                      typeof desa.kecamatan === 'object' ? 
                        desa.kecamatan.name || 'Unknown' : 'Unknown'
      };
    });
    
    return processedData;
  } catch (error) {
    console.error("Error in getAlokasiBertugasByPplId:", error);
    return [];
  }
}

export async function getDesaPendataanStatus(desaId: string, pplId: string): Promise<PendataanDataItem | null> {
  try {
    const { data, error } = await supabase
      .from('data_pendataan_desa')
      .select('*')
      .eq('desa_id', desaId)
      .eq('ppl_id', pplId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching desa status:", error);
      throw error;
    }
    
    return data as PendataanDataItem || null;
  } catch (error) {
    console.error("Error in getDesaPendataanStatus:", error);
    return null;
  }
}

export async function submitOrUpdatePendataanData(
  pendataanData: Partial<PendataanDataItem>,
  isNew: boolean
): Promise<PendataanDataItem | null> {
  try {
    let result;
    
    if (isNew) {
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .insert(pendataanData)
        .select();
        
      if (error) {
        console.error("Error inserting pendataan data:", error);
        throw error;
      }
      
      result = data?.[0];
    } else {
      // For updates, check if verification status needs to be reset
      let updateData = { ...pendataanData };
      
      // If status is changing to 'selesai', reset verification status
      if (pendataanData.status === 'selesai') {
        updateData.verification_status = 'belum_verifikasi';
      }
      
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .update(updateData)
        .eq('desa_id', pendataanData.desa_id as string)
        .eq('ppl_id', pendataanData.ppl_id as string)
        .select();
        
      if (error) {
        console.error("Error updating pendataan data:", error);
        throw error;
      }
      
      result = data?.[0];
    }
    
    return result as PendataanDataItem || null;
  } catch (error) {
    console.error("Error in submitOrUpdatePendataanData:", error);
    throw error;
  }
}

export async function getProgressSummary(filter: PendataanFilter): Promise<ProgressSummary> {
  try {
    // Based on user role, we'll call a different function or filter differently
    let query = supabase.rpc('get_pendataan_progress');
    
    if (filter.userRole === UserRole.PPL) {
      query = supabase.rpc('get_pendataan_progress', { ppl_id: filter.userId });
    } else if (filter.userRole === UserRole.PML && filter.kecamatanId) {
      query = supabase.rpc('get_pendataan_progress', { kecamatan_id: filter.kecamatanId });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching progress summary:", error);
      throw error;
    }
    
    // Default values if no data
    const defaultSummary: ProgressSummary = {
      total: 0,
      belum: 0,
      proses: 0,
      selesai: 0,
      ditolak: 0,
      persentase_selesai: 0
    };
    
    return data?.[0] || defaultSummary;
  } catch (error) {
    console.error("Error in getProgressSummary:", error);
    return {
      total: 0,
      belum: 0,
      proses: 0,
      selesai: 0,
      ditolak: 0,
      persentase_selesai: 0
    };
  }
}
