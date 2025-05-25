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
      if (!item.desa) {
        return {
          desa_id: item.desa_id,
          desa_name: 'Unknown',
          kecamatan_name: 'Unknown'
        };
      }
      
      // The desa property should be a single object, not an array
      const desaData = item.desa as any;
      
      return {
        desa_id: item.desa_id,
        desa_name: desaData.name || 'Unknown',
        kecamatan_name: desaData.kecamatan?.name || 'Unknown'
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
    console.log('submitOrUpdatePendataanData called with:', { pendataanData, isNew });
    
    if (!pendataanData.desa_id || !pendataanData.ppl_id) {
      throw new Error("desa_id and ppl_id are required");
    }

    // Always check if record exists first to prevent duplicates
    const { data: existingRecord, error: checkError } = await supabase
      .from('data_pendataan_desa')
      .select('*')
      .eq('desa_id', pendataanData.desa_id)
      .eq('ppl_id', pendataanData.ppl_id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing record:", checkError);
      throw checkError;
    }

    console.log('Existing record check:', existingRecord);

    const updateData = {
      desa_id: pendataanData.desa_id,
      ppl_id: pendataanData.ppl_id,
      catatan_khusus: pendataanData.catatan_khusus,
      status: pendataanData.status,
      tanggal_mulai: pendataanData.tanggal_mulai,
      tanggal_selesai: pendataanData.tanggal_selesai,
      persentase_selesai: pendataanData.persentase_selesai,
      verification_status: pendataanData.verification_status || 'belum_verifikasi',
      rejection_reason: pendataanData.rejection_reason,
      jumlah_keluarga: pendataanData.jumlah_keluarga,
      jumlah_lahan_pertanian: pendataanData.jumlah_lahan_pertanian,
      status_infrastruktur: pendataanData.status_infrastruktur,
      potensi_ekonomi: pendataanData.potensi_ekonomi,
      updated_at: new Date().toISOString()
    };

    let result;

    if (existingRecord) {
      // Update existing record using the unique constraint (desa_id + ppl_id)
      console.log('Updating existing record with id:', existingRecord.id);
      
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .update(updateData)
        .eq('desa_id', pendataanData.desa_id)
        .eq('ppl_id', pendataanData.ppl_id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating pendataan data:", error);
        throw error;
      }
      
      result = data;
    } else {
      // Insert new record only if none exists
      console.log('Inserting new record');
      
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .insert(updateData)
        .select()
        .single();
        
      if (error) {
        console.error("Error inserting pendataan data:", error);
        throw error;
      }
      
      result = data;
    }
    
    console.log('Operation successful, result:', result);
    return result as PendataanDataItem;
  } catch (error) {
    console.error("Error in submitOrUpdatePendataanData:", error);
    throw error;
  }
}

export async function getProgressSummary(filter: PendataanFilter): Promise<ProgressSummary> {
  try {
    // Query the data_pendataan_desa table directly instead of using non-existent functions
    let query = supabase
      .from('data_pendataan_desa')
      .select('status');
    
    if (filter.userRole === UserRole.PPL) {
      query = query.eq('ppl_id', filter.userId);
    } else if (filter.userRole === UserRole.PML && filter.kecamatanId) {
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
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching progress summary:", error);
      throw error;
    }
    
    // Calculate summary from the data
    const summary = {
      total: data?.length || 0,
      belum: data?.filter(item => item.status === 'belum').length || 0,
      proses: data?.filter(item => item.status === 'proses').length || 0,
      selesai: data?.filter(item => item.status === 'selesai').length || 0,
      ditolak: data?.filter(item => item.status === 'ditolak').length || 0,
      persentase_selesai: 0
    };
    
    // Calculate percentage
    if (summary.total > 0) {
      summary.persentase_selesai = Math.round((summary.selesai / summary.total) * 100);
    }
    
    return summary;
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
