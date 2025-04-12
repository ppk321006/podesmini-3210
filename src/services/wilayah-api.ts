import { supabase } from '@/integrations/supabase/client';
import { AllocationStatus, Petugas, NKS } from '@/types/database-schema';

// Define types based on our custom database schema
type DatabaseUser = Database['public']['Tables']['users']['Row'];
type Kecamatan = Database['public']['Tables']['kecamatan']['Row'];
type Desa = Database['public']['Tables']['desa']['Row'];
type WilayahTugas = Database['public']['Tables']['wilayah_tugas']['Row'];

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

// Kecamatan API
export const getKecamatans = async () => {
  const { data, error } = await supabase
    .from('kecamatan')
    .select()
    .order('name');
  
  if (error) {
    throw error;
  }
  
  return data as Kecamatan[];
};

// Desa API
export const getDesasByKecamatan = async (kecamatanId: string) => {
  const { data, error } = await supabase
    .from('desa')
    .select()
    .eq('kecamatan_id', kecamatanId)
    .order('name');
  
  if (error) {
    throw error;
  }
  
  return data as Desa[];
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

// NKS API
export const getNKSByDesa = async (desaId: string) => {
  const { data, error } = await supabase
    .from('nks')
    .select()
    .eq('desa_id', desaId);
  
  if (error) {
    throw error;
  }
  
  return data as NKS[];
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

// Ubinan Data API
export const getUbinanDataByPPL = async (pplId: string) => {
  const { data, error } = await supabase
    .from('ubinan_data')
    .select('*, nks:nks_id(*)')
    .eq('ppl_id', pplId);
  
  if (error) {
    throw error;
  }
  
  return data as unknown as any[];
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
  
  return data as unknown as any[];
};

export const getSubround = async () => {
  const { data, error } = await supabase.rpc('get_subround');
  
  if (error) {
    throw error;
  }
  
  return data as unknown as number;
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
    let nksIdColumn = '';
    
    if (allocation.type === 'nks') {
      tableName = 'wilayah_tugas';
      nksIdColumn = 'nks_id';
    } else if (allocation.type === 'segmen') {
      tableName = 'wilayah_tugas_segmen';
      nksIdColumn = 'segmen_id';
    } else {
      throw new Error("Unknown allocation type");
    }
    
    // Assign PPL to the specified NKS or Segmen
    const { data, error } = await supabase
      .from(tableName)
      .insert([{ [nksIdColumn]: allocationId, ppl_id: pplId, pml_id: pmlId }]);
      
    if (error) {
      console.error("Error assigning PPL to NKS/Segmen:", error);
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
    let nksIdColumn = '';
    
    if (allocation.type === 'nks') {
      tableName = 'wilayah_tugas';
      nksIdColumn = 'nks_id';
    } else if (allocation.type === 'segmen') {
      tableName = 'wilayah_tugas_segmen';
      nksIdColumn = 'segmen_id';
    } else {
      throw new Error("Unknown allocation type");
    }
    
    // Remove PPL assignment from the specified NKS or Segmen
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq(nksIdColumn, allocationId)
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
export type { DatabaseUser, Kecamatan, Desa, NKS, WilayahTugas };
