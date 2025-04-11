import { supabase } from "@/integrations/supabase/client";
import { 
  Kecamatan, 
  Desa, 
  NKS, 
  Segmen, 
  SampelKRT, 
  Petugas, 
  UbinanData, 
  WilayahTugas,
  AllocationStatus,
  ProgressReport 
} from "@/types/database-schema";

// Kecamatan API
export async function getKecamatanList(): Promise<Kecamatan[]> {
  try {
    const { data, error } = await supabase
      .from('kecamatan')
      .select()
      .order('name');
      
    if (error) {
      console.error("Error fetching kecamatan:", error);
      throw error;
    }
    
    return data as Kecamatan[];
  } catch (error) {
    console.error("Error in getKecamatanList:", error);
    return [];
  }
}

export async function createKecamatan(name: string): Promise<Kecamatan | null> {
  try {
    const { data, error } = await supabase
      .from('kecamatan')
      .insert([{ name }])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating kecamatan:", error);
      throw error;
    }
    
    return data as Kecamatan;
  } catch (error) {
    console.error("Error in createKecamatan:", error);
    return null;
  }
}

// Desa API
export async function getDesaList(kecamatanId?: string): Promise<Desa[]> {
  try {
    let query = supabase
      .from('desa')
      .select('*, kecamatan:kecamatan_id(*)');
      
    if (kecamatanId) {
      query = query.eq('kecamatan_id', kecamatanId);
    }
    
    const { data, error } = await query.order('name');
      
    if (error) {
      console.error("Error fetching desa:", error);
      throw error;
    }
    
    return data as unknown as Desa[];
  } catch (error) {
    console.error("Error in getDesaList:", error);
    return [];
  }
}

export async function createDesa(name: string, kecamatanId: string): Promise<Desa | null> {
  try {
    const { data, error } = await supabase
      .from('desa')
      .insert([{ name, kecamatan_id: kecamatanId }])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating desa:", error);
      throw error;
    }
    
    return data as Desa;
  } catch (error) {
    console.error("Error in createDesa:", error);
    return null;
  }
}

// NKS API
export async function getNKSList(desaId?: string): Promise<NKS[]> {
  try {
    let query = supabase
      .from('nks')
      .select(`
        *,
        desa:desa_id(*, kecamatan:kecamatan_id(*))
      `);
      
    if (desaId) {
      query = query.eq('desa_id', desaId);
    }
    
    const { data, error } = await query.order('code');
      
    if (error) {
      console.error("Error fetching NKS:", error);
      throw error;
    }
    
    return data as unknown as NKS[];
  } catch (error) {
    console.error("Error in getNKSList:", error);
    return [];
  }
}

export async function createNKS(
  code: string, 
  desaId: string, 
  targetPalawija: number,
  subround: number
): Promise<NKS | null> {
  try {
    const { data, error } = await supabase
      .from('nks')
      .insert([{ 
        code, 
        desa_id: desaId, 
        target_palawija: targetPalawija,
        subround
      }])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating NKS:", error);
      throw error;
    }
    
    return data as NKS;
  } catch (error) {
    console.error("Error in createNKS:", error);
    return null;
  }
}

export async function getNKSWithAssignments(): Promise<NKS[]> {
  try {
    const { data, error } = await supabase
      .from('nks')
      .select(`
        *,
        desa:desa_id(*, kecamatan:kecamatan_id(*)),
        wilayah_tugas(*) 
      `)
      .order('code');
      
    if (error) {
      console.error("Error fetching NKS with assignments:", error);
      throw error;
    }
    
    return data as unknown as NKS[];
  } catch (error) {
    console.error("Error in getNKSWithAssignments:", error);
    return [];
  }
}

export async function deleteNKS(id: string): Promise<boolean> {
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

// Segmen API
export async function getSegmenList(desaId?: string): Promise<Segmen[]> {
  try {
    let query = supabase
      .from('segmen')
      .select(`
        *,
        desa:desa_id(*, kecamatan:kecamatan_id(*))
      `);
      
    if (desaId) {
      query = query.eq('desa_id', desaId);
    }
    
    const { data, error } = await query.order('code');
      
    if (error) {
      console.error("Error fetching segmen:", error);
      throw error;
    }
    
    return data as unknown as Segmen[];
  } catch (error) {
    console.error("Error in getSegmenList:", error);
    return [];
  }
}

export async function createSegmen(
  code: string, 
  desaId: string, 
  targetPadi: number,
  bulan: number
): Promise<Segmen | null> {
  try {
    const { data, error } = await supabase
      .from('segmen')
      .insert([{ 
        code, 
        desa_id: desaId, 
        target_padi: targetPadi,
        bulan
      }])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating segmen:", error);
      throw error;
    }
    
    return data as Segmen;
  } catch (error) {
    console.error("Error in createSegmen:", error);
    return null;
  }
}

export async function getSegmenWithAssignments(): Promise<Segmen[]> {
  try {
    const { data, error } = await supabase
      .from('segmen')
      .select(`
        *,
        desa:desa_id(*, kecamatan:kecamatan_id(*)),
        wilayah_tugas_segmen(*)
      `)
      .order('code');
      
    if (error) {
      console.error("Error fetching segmen with assignments:", error);
      throw error;
    }
    
    return data as unknown as Segmen[];
  } catch (error) {
    console.error("Error in getSegmenWithAssignments:", error);
    return [];
  }
}

export async function deleteSegmen(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('segmen')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting segmen:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteSegmen:", error);
    return false;
  }
}

// Sampel KRT API
export async function createSampelKRT(data: { 
  nama: string; 
  status: "Utama" | "Cadangan"; 
  nks_id?: string; 
  segmen_id?: string; 
}): Promise<SampelKRT | null> {
  try {
    const { data: newData, error } = await supabase
      .from('sampel_krt')
      .insert([data])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating sampel KRT:", error);
      throw error;
    }
    
    return newData as SampelKRT;
  } catch (error) {
    console.error("Error in createSampelKRT:", error);
    return null;
  }
}

export async function getSampelKRTList(params: {
  nks_id?: string;
  segmen_id?: string;
}): Promise<SampelKRT[]> {
  try {
    let query = supabase.from('sampel_krt').select('*');
    
    if (params.nks_id) {
      query = query.eq('nks_id', params.nks_id);
    }
    
    if (params.segmen_id) {
      query = query.eq('segmen_id', params.segmen_id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching sampel KRT:", error);
      throw error;
    }
    
    return data as SampelKRT[];
  } catch (error) {
    console.error("Error in getSampelKRTList:", error);
    return [];
  }
}

export async function deleteSampelKRT(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sampel_krt')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting sampel KRT:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteSampelKRT:", error);
    return false;
  }
}

// Users & Petugas API
export async function getPetugasList(role?: string): Promise<Petugas[]> {
  try {
    let query = supabase
      .from('users')
      .select();
      
    if (role) {
      query = query.eq('role', role);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error("Error fetching petugas:", error);
      throw error;
    }
    
    return data.map(user => ({
      ...user,
      role: user.role as "admin" | "pml" | "ppl" | "viewer"
    })) as Petugas[];
  } catch (error) {
    console.error("Error in getPetugasList:", error);
    return [];
  }
}

export async function getPPLList(): Promise<Petugas[]> {
  return getPetugasList("ppl");
}

export async function getPMLList(): Promise<Petugas[]> {
  return getPetugasList("pml");
}

export async function createPetugas(
  username: string,
  password: string,
  name: string,
  role: "admin" | "pml" | "ppl" | "viewer",
  pmlId?: string
): Promise<Petugas | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        username, 
        password, 
        name, 
        role,
        pml_id: pmlId
      }])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating petugas:", error);
      throw error;
    }
    
    return {
      ...data,
      role: data.role as "admin" | "pml" | "ppl" | "viewer"
    } as Petugas;
  } catch (error) {
    console.error("Error in createPetugas:", error);
    return null;
  }
}

// Allocation Status API
export async function getAllocationStatus(): Promise<AllocationStatus[]> {
  try {
    const { data, error } = await supabase
      .from('allocation_status')
      .select('*')
      .order('type')
      .order('code');
      
    if (error) {
      console.error("Error fetching allocation status:", error);
      throw error;
    }
    
    return data.map(item => ({
      ...item,
      type: item.type as "nks" | "segmen"
    })) as AllocationStatus[];
  } catch (error) {
    console.error("Error in getAllocationStatus:", error);
    return [];
  }
}

export async function getWilayahTugasList(): Promise<WilayahTugas[]> {
  try {
    const { data, error } = await supabase
      .from('wilayah_tugas')
      .select('*');
      
    if (error) {
      console.error("Error fetching wilayah tugas:", error);
      throw error;
    }
    
    return data as WilayahTugas[];
  } catch (error) {
    console.error("Error in getWilayahTugasList:", error);
    return [];
  }
}

export async function createWilayahTugas(
  nksId: string,
  pmlId: string,
  pplId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wilayah_tugas')
      .insert([{ 
        nks_id: nksId, 
        pml_id: pmlId, 
        ppl_id: pplId 
      }]);
      
    if (error) {
      console.error("Error creating wilayah tugas:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in createWilayahTugas:", error);
    return false;
  }
}

export async function assignPPLToNKS(allocationId: string, pplId: string, pmlId: string): Promise<boolean> {
  try {
    // First check if this is an NKS or a Segmen based on allocation ID
    const { data: allocData, error: allocError } = await supabase
      .from('allocation_status')
      .select('*')
      .eq('id', allocationId)
      .single();
    
    if (allocError) {
      throw allocError;
    }
    
    if (allocData.type === 'nks') {
      // Handle NKS assignment
      const { error } = await supabase
        .from('wilayah_tugas')
        .insert([{ 
          nks_id: allocationId, 
          ppl_id: pplId, 
          pml_id: pmlId 
        }]);
        
      if (error) throw error;
    } else {
      // Handle Segmen assignment
      const { error } = await supabase
        .from('wilayah_tugas_segmen')
        .insert([{ 
          segmen_id: allocationId, 
          ppl_id: pplId, 
          pml_id: pmlId 
        }]);
        
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in assignPPLToNKS:", error);
    return false;
  }
}

export async function removePPLAssignment(allocationId: string, pplId: string): Promise<boolean> {
  try {
    // First check if this is an NKS or a Segmen based on allocation ID
    const { data: allocData, error: allocError } = await supabase
      .from('allocation_status')
      .select('*')
      .eq('id', allocationId)
      .single();
    
    if (allocError) {
      throw allocError;
    }
    
    if (allocData.type === 'nks') {
      // Handle NKS assignment removal
      const { error } = await supabase
        .from('wilayah_tugas')
        .delete()
        .match({ 
          nks_id: allocationId, 
          ppl_id: pplId 
        });
        
      if (error) throw error;
    } else {
      // Handle Segmen assignment removal
      const { error } = await supabase
        .from('wilayah_tugas_segmen')
        .delete()
        .match({ 
          segmen_id: allocationId, 
          ppl_id: pplId 
        });
        
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removePPLAssignment:", error);
    return false;
  }
}

// Ubinan Data API
export async function createUbinanData(ubinanData: {
  nks_id?: string;
  segmen_id?: string;
  ppl_id: string;
  responden_name: string;
  sample_status?: "Utama" | "Cadangan";
  komoditas: string;
  tanggal_ubinan: string;
  berat_hasil: number;
  pml_id?: string;
}): Promise<UbinanData | null> {
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
    return null;
  }
}

export async function updateUbinanData(id: string, updateData: Partial<UbinanData>): Promise<UbinanData | null> {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .update(updateData)
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
    return null;
  }
}

export async function getUbinanDataByPPL(pplId: string): Promise<UbinanData[]> {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(*),
        segmen:segmen_id(*)
      `)
      .eq('ppl_id', pplId);
      
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

export async function getUbinanDataForVerification(pmlId: string): Promise<UbinanData[]> {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(*),
        ppl:ppl_id(id, name)
      `)
      .eq('pml_id', pmlId)
      .eq('status', 'sudah_diisi');
      
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

export async function verifyUbinanData(id: string, isApproved: boolean, komentar?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ubinan_data')
      .update({ 
        status: isApproved ? 'dikonfirmasi' : 'ditolak',
        komentar: komentar || null
      })
      .eq('id', id);
      
    if (error) {
      console.error("Error verifying ubinan data:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in verifyUbinanData:", error);
    return false;
  }
}

export async function updateUbinanVerification(
  id: string,
  status: 'dikonfirmasi' | 'ditolak',
  dokumenDiterima: boolean,
  komentar?: string
): Promise<UbinanData | null> {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .update({
        status,
        dokumen_diterima: dokumenDiterima,
        komentar: komentar || null
      })
      .eq('id', id)
      .select(`
        *,
        nks:nks_id(*),
        segmen:segmen_id(*)
      `)
      .single();
      
    if (error) {
      console.error("Error updating ubinan verification:", error);
      throw error;
    }
    
    return data as unknown as UbinanData;
  } catch (error) {
    console.error("Error in updateUbinanVerification:", error);
    return null;
  }
}

export async function getUbinanProgressByYear(year: number = new Date().getFullYear()) {
  try {
    const { data, error } = await supabase.rpc('get_ubinan_progress_by_year', { year_param: year });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUbinanProgressByYear:", error);
    return [];
  }
}

export async function getUbinanProgressDetailBySubround(subround: number) {
  try {
    const { data, error } = await supabase.rpc('get_ubinan_progress_detail_by_subround', { 
      subround_param: subround 
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUbinanProgressDetailBySubround:", error);
    return [];
  }
}

export async function getVerificationStatusCounts() {
  try {
    const { data, error } = await supabase.rpc('get_verification_status_counts');
    
    if (error) {
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
    const { data, error } = await supabase.rpc('get_ubinan_totals_by_subround', { 
      subround_param: subround 
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUbinanTotalsBySubround:", error);
    return [];
  }
}

// Progress API
export async function getPPLTargets(pplId: string): Promise<{ padi: number; palawija: number }> {
  try {
    // Get targets from NKS assignments
    const { data: nksData, error: nksError } = await supabase
      .from('wilayah_tugas')
      .select('nks:nks_id(target_palawija)')
      .eq('ppl_id', pplId);
    
    if (nksError) {
      throw nksError;
    }
    
    // Get targets from Segmen assignments
    const { data: segmenData, error: segmenError } = await supabase
      .from('wilayah_tugas_segmen')
      .select('segmen:segmen_id(target_padi)')
      .eq('ppl_id', pplId);
    
    if (segmenError) {
      throw segmenError;
    }
    
    // Calculate total targets
    let palawijaTarget = 0;
    nksData.forEach(item => {
      if (item.nks && typeof item.nks.target_palawija === 'number') {
        palawijaTarget += item.nks.target_palawija;
      }
    });
    
    let padiTarget = 0;
    segmenData.forEach(item => {
      if (item.segmen && typeof item.segmen.target_padi === 'number') {
        padiTarget += item.segmen.target_padi;
      }
    });
    
    return {
      padi: padiTarget,
      palawija: palawijaTarget
    };
  } catch (error) {
    console.error("Error in getPPLTargets:", error);
    return { padi: 0, palawija: 0 };
  }
}

// Subround API
export async function getSubround(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_subround');
    
    if (error) {
      throw error;
    }
    
    return data as number;
  } catch (error) {
    console.error("Error in getSubround:", error);
    return 1; // Default to subround 1 if error
  }
}
