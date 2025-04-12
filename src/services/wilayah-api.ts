
import { supabase } from '@/integrations/supabase/client';
import { AllocationStatus, Petugas, NKS, UbinanData } from '@/types/database-schema';

// Define types based on our custom database schema
type DatabaseUser = {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'pml' | 'ppl' | 'viewer';
  pml_id: string | null;
  created_at: string | null;
};

type Kecamatan = {
  id: string;
  name: string;
  created_at?: string;
};

type Desa = {
  id: string;
  name: string;
  kecamatan_id: string;
  created_at?: string;
};

type WilayahTugas = {
  id: string;
  nks_id: string;
  pml_id: string;
  ppl_id: string;
  created_at: string;
};

// Export functions first before using them as aliases
export async function getKecamatans() {
  const { data, error } = await supabase
    .from('kecamatan')
    .select()
    .order('name');
  
  if (error) {
    throw error;
  }
  
  return data as Kecamatan[];
}

export async function getDesasByKecamatan(kecamatanId?: string) {
  const { data, error } = await supabase
    .from('desa')
    .select()
    .eq('kecamatan_id', kecamatanId || '')
    .order('name');
  
  if (error) {
    throw error;
  }
  
  return data as Desa[];
}

export async function getNKSByDesa(desaId?: string) {
  const { data, error } = await supabase
    .from('nks')
    .select()
    .eq('desa_id', desaId || '');
  
  if (error) {
    throw error;
  }
  
  return data as NKS[];
}

// Alias functions for backward compatibility
export const getKecamatanList = getKecamatans;
export const getDesaList = getDesasByKecamatan;
export const getNKSList = getNKSByDesa;
export const getWilayahTugasList = async () => {
  const { data, error } = await supabase
    .from('wilayah_tugas')
    .select('*, nks:nks_id(*), ppl:ppl_id(*), pml:pml_id(*)');
  
  if (error) {
    throw error;
  }
  
  return data as WilayahTugas[];
};

// Users API
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select();
  
  if (error) {
    throw error;
  }
  
  return data as DatabaseUser[];
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', id)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as DatabaseUser;
};

// Create Kecamatan
export const createKecamatan = async (name: string) => {
  const { data, error } = await supabase
    .from('kecamatan')
    .insert([{ name }])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Kecamatan;
};

// Create Desa
export const createDesa = async (name: string, kecamatanId: string) => {
  const { data, error } = await supabase
    .from('desa')
    .insert([{ name, kecamatan_id: kecamatanId }])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Desa;
};

export const getDesaById = async (desaId: string) => {
  const { data, error } = await supabase
    .from('desa')
    .select('*, kecamatan:kecamatan_id(*)')
    .eq('id', desaId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getNKSWithAssignments = async () => {
  const { data, error } = await supabase
    .from('nks')
    .select(`
      *,
      desa:desa_id(*, kecamatan:kecamatan_id(*)),
      komoditas_list:nks_komoditas(*),
      wilayah_tugas(*, ppl:ppl_id(*), pml:pml_id(*))
    `);
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const createNKS = async (code: string, desaId: string, targetPalawija: number, subround: number) => {
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
    throw error;
  }
  
  return data as NKS;
};

export const deleteNKS = async (nksId: string) => {
  const { error } = await supabase
    .from('nks')
    .delete()
    .eq('id', nksId);
  
  if (error) {
    throw error;
  }
  
  return true;
};

export const getNKSDetails = async (nksId: string) => {
  const { data, error } = await supabase
    .from('nks')
    .select('*, desa:desa_id(*)')
    .eq('id', nksId)
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Segmen API
export const getSegmenList = async (desaId?: string) => {
  let query = supabase
    .from('segmen')
    .select();
  
  if (desaId) {
    query = query.eq('desa_id', desaId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getSegmenWithAssignments = async () => {
  const { data, error } = await supabase
    .from('segmen')
    .select(`
      *,
      desa:desa_id(*, kecamatan:kecamatan_id(*)),
      wilayah_tugas_segmen(*, ppl:ppl_id(*), pml:pml_id(*))
    `);
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const createSegmen = async (code: string, desaId: string, targetPadi: number, bulan: number) => {
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
    throw error;
  }
  
  return data;
};

export const deleteSegmen = async (segmenId: string) => {
  const { error } = await supabase
    .from('segmen')
    .delete()
    .eq('id', segmenId);
  
  if (error) {
    throw error;
  }
  
  return true;
};

// Sampel KRT API
// Updated to accept an object with either nks_id or segmen_id
export const getSampelKRTList = async (params: { nks_id?: string; segmen_id?: string }) => {
  let query = supabase
    .from('sampel_krt')
    .select();
  
  if (params.nks_id) {
    query = query.eq('nks_id', params.nks_id);
  } else if (params.segmen_id) {
    query = query.eq('segmen_id', params.segmen_id);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const createSampelKRT = async (data: { nama: string; status: string; nks_id?: string; segmen_id?: string; }) => {
  const { data: result, error } = await supabase
    .from('sampel_krt')
    .insert([data])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return result;
};

export const deleteSampelKRT = async (krtId: string) => {
  const { error } = await supabase
    .from('sampel_krt')
    .delete()
    .eq('id', krtId);
  
  if (error) {
    throw error;
  }
  
  return true;
};

// Wilayah Tugas API
export const getWilayahTugasByPML = async (pmlId: string) => {
  const { data, error } = await supabase
    .from('wilayah_tugas')
    .select('*, nks:nks_id(*), ppl:ppl_id(*)')
    .eq('pml_id', pmlId);
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getWilayahTugasByPPL = async (pplId: string) => {
  const { data, error } = await supabase
    .from('wilayah_tugas')
    .select('*, nks:nks_id(*), pml:pml_id(*)')
    .eq('ppl_id', pplId);
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const createWilayahTugas = async (nksId: string, pmlId: string, pplId: string) => {
  const { data, error } = await supabase
    .from('wilayah_tugas')
    .insert([{ 
      nks_id: nksId, 
      pml_id: pmlId, 
      ppl_id: pplId 
    }])
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Ubinan API
export const createUbinanData = async (data: {
  nks_id?: string;
  segmen_id?: string;
  ppl_id: string;
  responden_name: string;
  sample_status?: string;
  komoditas: string;
  tanggal_ubinan: string;
  berat_hasil: number;
  pml_id?: string;
}) => {
  const { data: result, error } = await supabase
    .from('ubinan_data')
    .insert([data])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return result as UbinanData;
};

export const updateUbinanData = async (id: string, data: {
  responden_name?: string;
  sample_status?: string;
  komoditas?: string;
  tanggal_ubinan?: string;
  berat_hasil?: number;
  status?: string;
  dokumen_diterima?: boolean;
}) => {
  const { data: result, error } = await supabase
    .from('ubinan_data')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return result as UbinanData;
};

export const updateUbinanVerification = async (id: string, status: string, komentar?: string) => {
  const { data, error } = await supabase
    .from('ubinan_data')
    .update({ status, komentar })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as UbinanData;
};

// Ubinan Data API
export const getUbinanDataByPPL = async (pplId: string) => {
  const { data, error } = await supabase
    .from('ubinan_data')
    .select('*, nks:nks_id(*)')
    .eq('ppl_id', pplId);
  
  if (error) {
    throw error;
  }
  
  return data as UbinanData[];
};

export const getUbinanDataForVerification = async (pmlId: string) => {
  const { data, error } = await supabase
    .from('ubinan_data')
    .select('*, nks:nks_id(*), ppl:ppl_id(*)')
    .eq('pml_id', pmlId)
    .eq('status', 'sudah_diisi');
  
  if (error) {
    throw error;
  }
  
  return data as UbinanData[];
};

export const getSubround = async () => {
  const { data, error } = await supabase.rpc('get_subround');
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getUbinanProgressBySubround = async (subround: number) => {
  try {
    const { data, error } = await supabase.rpc('get_ubinan_progress_detail_by_subround', { 
      subround_param: subround 
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUbinanProgressBySubround:", error);
    return [];
  }
};

export const getUbinanProgressByYear = async (year: number = new Date().getFullYear()) => {
  const { data, error } = await supabase.rpc('get_ubinan_progress_by_year', { year_param: year });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getNKSByKomoditas = async (komoditas: string) => {
  const { data, error } = await supabase
    .from('nks')
    .select('*')
    .or(`target_${komoditas.toLowerCase()}=gt.0`);
  
  if (error) {
    throw error;
  }
  
  return data as NKS[];
};

// Add the deletePetugas function
export async function deletePetugas(petugasId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', petugasId);

    if (error) {
      console.error('Error deleting petugas:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in deletePetugas:', error);
    throw error;
  }
}

export async function createPetugas(
  username: string,
  password: string,
  name: string,
  role: "admin" | "pml" | "ppl" | "viewer",
  pmlId?: string
): Promise<Petugas> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password, name, role, pml_id: pmlId }])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating petugas:", error);
      throw new Error(error.message);
    }
    
    return data as Petugas;
  } catch (error) {
    console.error("Error in createPetugas:", error);
    throw error;
  }
}

export async function getPetugasList(role?: "admin" | "pml" | "ppl" | "viewer"): Promise<Petugas[]> {
  try {
    let query = supabase
      .from('users')
      .select('*');
      
    if (role) {
      query = query.eq('role', role);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching petugas list:", error);
      return [];
    }
    
    return data as Petugas[];
  } catch (error) {
    console.error("Error in getPetugasList:", error);
    return [];
  }
}

export async function getPPLList(): Promise<Petugas[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'ppl');
      
    if (error) {
      console.error("Error fetching PPL list:", error);
      return [];
    }
    
    return data as Petugas[];
  } catch (error) {
    console.error("Error in getPPLList:", error);
    return [];
  }
}

export async function getPMLList(): Promise<Petugas[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'pml');
      
    if (error) {
      console.error("Error fetching PML list:", error);
      return [];
    }
    
    return data as Petugas[];
  } catch (error) {
    console.error("Error in getPMLList:", error);
    return [];
  }
}

export async function getAllocationStatus(): Promise<AllocationStatus[]> {
  try {
    const { data: viewData, error: viewError } = await supabase
      .from('allocation_status')
      .select('*');
      
    if (viewError) {
      console.error("Error fetching allocation status:", viewError);
      return [];
    }
    
    // Get NKS items with target information
    const { data: nksWithTargets, error: nksError } = await supabase
      .from('nks')
      .select('id, target_padi, target_palawija');
      
    if (nksError) {
      console.error("Error fetching NKS targets:", nksError);
    }
    
    // Get Segmen items with target information
    const { data: segmenWithTargets, error: segmenError } = await supabase
      .from('segmen')
      .select('id, target_padi');
      
    if (segmenError) {
      console.error("Error fetching Segmen targets:", segmenError);
    }
    
    // Get komoditas information for NKS
    const { data: nksKomoditas, error: komoditasError } = await supabase
      .from('nks_komoditas')
      .select('nks_id, komoditas');
      
    if (komoditasError) {
      console.error("Error fetching NKS komoditas:", komoditasError);
    }
    
    // Get PML names
    const { data: pmlList, error: pmlError } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'pml');
      
    if (pmlError) {
      console.error("Error fetching PML names:", pmlError);
    }

    // Combine data
    const komoditasByNks = nksKomoditas?.reduce((acc, item) => {
      if (!acc[item.nks_id]) {
        acc[item.nks_id] = [];
      }
      acc[item.nks_id].push(item.komoditas);
      return acc;
    }, {} as Record<string, string[]>) || {};
    
    const nksTargetsMap = nksWithTargets?.reduce((acc, item) => {
      acc[item.id] = { padi_target: item.target_padi, palawija_target: item.target_palawija };
      return acc;
    }, {} as Record<string, { padi_target: number, palawija_target: number }>) || {};
    
    const segmenTargetsMap = segmenWithTargets?.reduce((acc, item) => {
      acc[item.id] = { padi_target: item.target_padi };
      return acc;
    }, {} as Record<string, { padi_target: number }>) || {};
    
    const pmlNameMap = pmlList?.reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {} as Record<string, string>) || {};
    
    // Add target and komoditas information to each allocation status
    return (viewData || []).map(item => {
      const enhancedItem = { ...item } as AllocationStatus;
      
      if (item.type === 'nks' && nksTargetsMap[item.id]) {
        enhancedItem.padi_target = nksTargetsMap[item.id].padi_target;
        enhancedItem.palawija_target = nksTargetsMap[item.id].palawija_target;
        enhancedItem.komoditas = komoditasByNks[item.id] || [];
      } else if (item.type === 'segmen' && segmenTargetsMap[item.id]) {
        enhancedItem.padi_target = segmenTargetsMap[item.id].padi_target;
        enhancedItem.palawija_target = 0;
      }
      
      if (item.pml_id && pmlNameMap[item.pml_id]) {
        enhancedItem.pml_name = pmlNameMap[item.pml_id];
      }
      
      return enhancedItem;
    });
  } catch (error) {
    console.error("Error in getAllocationStatus:", error);
    return [];
  }
}

export async function assignPPLToNKS(allocationId: string, pplId: string, pmlId: string): Promise<any> {
  try {
    // Determine the type of allocation (nks or segmen)
    const { data: allocation, error: allocationError } = await supabase
      .from('allocation_status')
      .select('type')
      .eq('id', allocationId)
      .single();
      
    if (allocationError) {
      console.error("Error fetching allocation type:", allocationError);
      throw new Error(allocationError.message);
    }
    
    if (!allocation) {
      throw new Error("Allocation not found");
    }
    
    let tableName = '';
    let idColumn = '';
    
    if (allocation.type === 'nks') {
      tableName = 'wilayah_tugas';
      idColumn = 'nks_id';
    } else if (allocation.type === 'segmen') {
      tableName = 'wilayah_tugas_segmen';
      idColumn = 'segmen_id';
    } else {
      throw new Error("Unknown allocation type");
    }
    
    // Create the insertion object dynamically
    const insertObj: { ppl_id: string; pml_id: string; [key: string]: string } = {
      ppl_id: pplId,
      pml_id: pmlId,
    };
    insertObj[idColumn] = allocationId;
    
    // Assign PPL to the specified NKS or Segmen
    const { data, error } = await supabase
      .from(tableName)
      .insert([insertObj])
      .select();
      
    if (error) {
      console.error(`Error assigning PPL to ${allocation.type}:`, error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Error in assignPPLToNKS:", error);
    throw error;
  }
}

export async function removePPLAssignment(allocationId: string, pplId: string): Promise<void> {
  try {
    // Determine the type of allocation (nks or segmen)
    const { data: allocation, error: allocationError } = await supabase
      .from('allocation_status')
      .select('type')
      .eq('id', allocationId)
      .single();
      
    if (allocationError) {
      console.error("Error fetching allocation type:", allocationError);
      throw new Error(allocationError.message);
    }
    
    if (!allocation) {
      throw new Error("Allocation not found");
    }
    
    let tableName = '';
    let idColumn = '';
    
    if (allocation.type === 'nks') {
      tableName = 'wilayah_tugas';
      idColumn = 'nks_id';
    } else if (allocation.type === 'segmen') {
      tableName = 'wilayah_tugas_segmen';
      idColumn = 'segmen_id';
    } else {
      throw new Error("Unknown allocation type");
    }
    
    // Remove PPL assignment from the specified NKS or Segmen
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq(idColumn, allocationId)
      .eq('ppl_id', pplId);
      
    if (error) {
      console.error("Error removing PPL assignment:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in removePPLAssignment:", error);
    throw error;
  }
}

// Export types for use in other components
export type { DatabaseUser, Kecamatan, Desa, WilayahTugas };
