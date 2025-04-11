
import { supabase } from "@/integrations/supabase/client";
import { AllocationStatus, Petugas, UbinanData, SampelKRT, ProgressReport } from "@/types/database-schema";

export async function getKecamatanList() {
  try {
    const { data, error } = await supabase
      .from('kecamatan')
      .select('*')
      .order('name');
      
    if (error) {
      console.error("Error fetching kecamatan list:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getKecamatanList:", error);
    return [];
  }
}

export async function getDesaByKecamatan(kecamatanId: string) {
  try {
    const { data, error } = await supabase
      .from('desa')
      .select('*')
      .eq('kecamatan_id', kecamatanId)
      .order('name');
      
    if (error) {
      console.error("Error fetching desa by kecamatan:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getDesaByKecamatan:", error);
    return [];
  }
}

export async function getNKSByDesa(desaId: string) {
  try {
    const { data, error } = await supabase
      .from('nks')
      .select('*')
      .eq('desa_id', desaId)
      .order('code');
      
    if (error) {
      console.error("Error fetching NKS by desa:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getNKSByDesa:", error);
    return [];
  }
}

export async function getSegmenByDesa(desaId: string) {
  try {
    const { data, error } = await supabase
      .from('segmen')
      .select('*')
      .eq('desa_id', desaId)
      .order('code');
      
    if (error) {
      console.error("Error fetching segmen by desa:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getSegmenByDesa:", error);
    return [];
  }
}

export async function createNKS(code: string, desaId: string, targetPadi: number = 0, targetPalawija: number = 0, subround: number | null = null) {
  try {
    const { data, error } = await supabase
      .from('nks')
      .insert([
        { 
          code, 
          desa_id: desaId, 
          target_padi: targetPadi,
          target_palawija: targetPalawija,
          subround
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating NKS:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in createNKS:", error);
    throw error;
  }
}

export async function createSegmen(code: string, desaId: string, targetPadi: number = 0, bulan: number | null = null) {
  try {
    const { data, error } = await supabase
      .from('segmen')
      .insert([
        { 
          code, 
          desa_id: desaId, 
          target_padi: targetPadi,
          bulan
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating Segmen:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in createSegmen:", error);
    throw error;
  }
}

export async function updateNKS(id: string, updates: { code?: string; desa_id?: string; target_padi?: number; target_palawija?: number; subround?: number | null }) {
  try {
    const { data, error } = await supabase
      .from('nks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating NKS:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in updateNKS:", error);
    throw error;
  }
}

export async function updateSegmen(id: string, updates: { code?: string; desa_id?: string; target_padi?: number; bulan?: number | null }) {
  try {
    const { data, error } = await supabase
      .from('segmen')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating Segmen:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in updateSegmen:", error);
    throw error;
  }
}

export async function deleteNKS(id: string) {
  try {
    const { error } = await supabase
      .from('nks')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting NKS:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteNKS:", error);
    return false;
  }
}

export async function deleteSegmen(id: string) {
  try {
    const { error } = await supabase
      .from('segmen')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting Segmen:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteSegmen:", error);
    return false;
  }
}

export async function getSampelKRTByNKS(nksId: string) {
  try {
    const { data, error } = await supabase
      .from('sampel_krt')
      .select('*')
      .eq('nks_id', nksId)
      .order('nama');
      
    if (error) {
      console.error("Error fetching sampel KRT by NKS:", error);
      throw error;
    }
    
    return data as unknown as SampelKRT[];
  } catch (error) {
    console.error("Error in getSampelKRTByNKS:", error);
    return [];
  }
}

export async function getSampelKRTBySegmen(segmenId: string) {
  try {
    const { data, error } = await supabase
      .from('sampel_krt')
      .select('*')
      .eq('segmen_id', segmenId)
      .order('nama');
      
    if (error) {
      console.error("Error fetching sampel KRT by Segmen:", error);
      throw error;
    }
    
    return data as unknown as SampelKRT[];
  } catch (error) {
    console.error("Error in getSampelKRTBySegmen:", error);
    return [];
  }
}

export async function createSampelKRT(nama: string, status: string, nksId: string | null = null, segmenId: string | null = null) {
  try {
    const { data, error } = await supabase
      .from('sampel_krt')
      .insert([
        { 
          nama,
          status,
          nks_id: nksId,
          segmen_id: segmenId
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating Sampel KRT:", error);
      throw error;
    }
    
    return data as unknown as SampelKRT;
  } catch (error) {
    console.error("Error in createSampelKRT:", error);
    throw error;
  }
}

export async function updateSampelKRT(id: string, updates: { nama?: string; status?: string }) {
  try {
    const { data, error } = await supabase
      .from('sampel_krt')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating Sampel KRT:", error);
      throw error;
    }
    
    return data as unknown as SampelKRT;
  } catch (error) {
    console.error("Error in updateSampelKRT:", error);
    throw error;
  }
}

export async function deleteSampelKRT(id: string) {
  try {
    const { error } = await supabase
      .from('sampel_krt')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting Sampel KRT:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteSampelKRT:", error);
    return false;
  }
}

export async function getPetugasByRole(role: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('name');
      
    if (error) {
      console.error("Error fetching petugas by role:", error);
      throw error;
    }
    
    return data as unknown as Petugas[];
  } catch (error) {
    console.error("Error in getPetugasByRole:", error);
    return [];
  }
}

export async function getPetugasById(id: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error fetching petugas by id:", error);
      throw error;
    }
    
    return data as unknown as Petugas;
  } catch (error) {
    console.error("Error in getPetugasById:", error);
    throw error;
  }
}

export async function getPPLByPML(pmlId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'ppl')
      .eq('pml_id', pmlId)
      .order('name');
      
    if (error) {
      console.error("Error fetching PPL by PML:", error);
      throw error;
    }
    
    return data as unknown as Petugas[];
  } catch (error) {
    console.error("Error in getPPLByPML:", error);
    return [];
  }
}

export async function getWilayahTugasByPML(pmlId: string) {
  try {
    const { data, error } = await supabase
      .from('allocation_status')
      .select('*')
      .eq('pml_id', pmlId)
      .order('type', { ascending: true })
      .order('code', { ascending: true });
      
    if (error) {
      console.error("Error fetching wilayah tugas by PML:", error);
      throw error;
    }
    
    return data as unknown as AllocationStatus[];
  } catch (error) {
    console.error("Error in getWilayahTugasByPML:", error);
    return [];
  }
}

export async function getWilayahTugasByPPL(pplId: string) {
  try {
    const { data, error } = await supabase
      .from('allocation_status')
      .select('*')
      .eq('ppl_id', pplId)
      .order('type', { ascending: true })
      .order('code', { ascending: true });
      
    if (error) {
      console.error("Error fetching wilayah tugas by PPL:", error);
      throw error;
    }
    
    return data as unknown as AllocationStatus[];
  } catch (error) {
    console.error("Error in getWilayahTugasByPPL:", error);
    return [];
  }
}

export async function getPMLList() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'pml')
      .order('name');
      
    if (error) {
      console.error("Error fetching PML list:", error);
      throw error;
    }
    
    return data as unknown as Petugas[];
  } catch (error) {
    console.error("Error in getPMLList:", error);
    return [];
  }
}

export async function getUbinanDataByPPL(pplId: string) {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(*),
        segmen:segmen_id(*)
      `)
      .eq('ppl_id', pplId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching ubinan data by PPL:", error);
      throw error;
    }
    
    return data as unknown as UbinanData[];
  } catch (error) {
    console.error("Error in getUbinanDataByPPL:", error);
    return [];
  }
}

export async function getUbinanDataForVerification(pmlId: string) {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(*),
        segmen:segmen_id(*),
        ppl:ppl_id(*)
      `)
      .eq('pml_id', pmlId)
      .eq('status', 'sudah_diisi')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching ubinan data for verification:", error);
      throw error;
    }
    
    return data as unknown as UbinanData[];
  } catch (error) {
    console.error("Error in getUbinanDataForVerification:", error);
    return [];
  }
}

export async function getProgressReportByPML(pmlId: string, year: number = new Date().getFullYear(), month?: number) {
  try {
    let query = supabase
      .from('progress_report')
      .select(`
        *,
        ppl:ppl_id(*)
      `)
      .eq('year', year);
      
    if (month) {
      query = query.eq('month', month);
    }
    
    const { data, error } = await query
      .order('month', { ascending: true })
      .order('ppl_id', { ascending: true });
      
    if (error) {
      console.error("Error fetching progress report by PML:", error);
      throw error;
    }
    
    return data as unknown as ProgressReport[];
  } catch (error) {
    console.error("Error in getProgressReportByPML:", error);
    return [];
  }
}

export async function createUbinanData(ubinanData: Partial<UbinanData>) {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .insert([ubinanData])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating ubinan data:", error);
      throw error;
    }
    
    return data as unknown as UbinanData;
  } catch (error) {
    console.error("Error in createUbinanData:", error);
    throw error;
  }
}

export async function updateUbinanData(id: string, updates: Partial<UbinanData>) {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating ubinan data:", error);
      throw error;
    }
    
    return data as unknown as UbinanData;
  } catch (error) {
    console.error("Error in updateUbinanData:", error);
    throw error;
  }
}

export async function updateUbinanVerification(id: string, status: string, dokumenDiterima: boolean, komentar?: string) {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .update({
        status,
        dokumen_diterima: dokumenDiterima,
        komentar,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating ubinan verification:", error);
      throw error;
    }
    
    return data as unknown as UbinanData;
  } catch (error) {
    console.error("Error in updateUbinanVerification:", error);
    throw error;
  }
}

export async function getUbinanData(id: string) {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(*),
        segmen:segmen_id(*),
        ppl:ppl_id(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error fetching ubinan data:", error);
      throw error;
    }
    
    return data as unknown as UbinanData;
  } catch (error) {
    console.error("Error in getUbinanData:", error);
    throw error;
  }
}

export async function getAllUbinanData(startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(*),
        segmen:segmen_id(*),
        ppl:ppl_id(*),
        pml:pml_id(*)
      `);
      
    if (startDate) {
      query = query.gte('tanggal_ubinan', startDate);
    }
    
    if (endDate) {
      query = query.lte('tanggal_ubinan', endDate);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching all ubinan data:", error);
      throw error;
    }
    
    return data as unknown as UbinanData[];
  } catch (error) {
    console.error("Error in getAllUbinanData:", error);
    return [];
  }
}

// New functions for API
export async function getVerificationStatusCounts() {
  try {
    const { data, error } = await supabase.rpc('get_verification_status_counts');
    
    if (error) {
      console.error("Error fetching verification status counts:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getVerificationStatusCounts:", error);
    return [];
  }
}

export async function getPalawijaTypeCounts() {
  try {
    const { data, error } = await supabase.rpc('get_palawija_by_type');
    
    if (error) {
      console.error("Error fetching palawija type counts:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getPalawijaTypeCounts:", error);
    return [];
  }
}

export async function getUbinanTotalsBySubround(subround: number) {
  try {
    const { data, error } = await supabase.rpc('get_ubinan_totals_by_subround', { subround_param: subround });
    
    if (error) {
      console.error("Error fetching ubinan totals by subround:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUbinanTotalsBySubround:", error);
    return [];
  }
}

export async function getUbinanProgressDetailBySubround(subround: number) {
  try {
    const { data, error } = await supabase.rpc('get_ubinan_progress_detail_by_subround', { subround_param: subround });
    
    if (error) {
      console.error("Error fetching ubinan progress detail by subround:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUbinanProgressDetailBySubround:", error);
    return [];
  }
}

export async function getUbinanProgressByYear(year: number = new Date().getFullYear()) {
  try {
    const { data, error } = await supabase.rpc('get_ubinan_progress_by_year', { year_param: year });
    
    if (error) {
      console.error("Error fetching ubinan progress by year:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUbinanProgressByYear:", error);
    return [];
  }
}

export async function getSubround() {
  try {
    const { data, error } = await supabase.rpc('get_subround');
    
    if (error) {
      console.error("Error fetching subround:", error);
      throw error;
    }
    
    return data as number;
  } catch (error) {
    console.error("Error in getSubround:", error);
    return 1; // Default to first subround
  }
}
