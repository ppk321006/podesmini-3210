import { supabase } from "@/integrations/supabase/client";
import { Kecamatan, Desa, NKS, WilayahTugas, Petugas } from "@/types/database-schema";

// Kecamatan APIs
export const getKecamatanList = async (): Promise<Kecamatan[]> => {
  const { data, error } = await supabase
    .from('kecamatan')
    .select('*')
    .order('name');
  
  if (error) {
    console.error("Error fetching kecamatan:", error);
    throw error;
  }
  
  return data;
};

export const createKecamatan = async (name: string): Promise<Kecamatan> => {
  const { data, error } = await supabase
    .from('kecamatan')
    .insert({ name })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating kecamatan:", error);
    throw error;
  }
  
  return data;
};

// Desa APIs
export const getDesaList = async (kecamatanId?: string): Promise<Desa[]> => {
  let query = supabase.from('desa').select('*').order('name');
  
  if (kecamatanId) {
    query = query.eq('kecamatan_id', kecamatanId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching desa:", error);
    throw error;
  }
  
  return data;
};

export const createDesa = async (name: string, kecamatanId: string): Promise<Desa> => {
  const { data, error } = await supabase
    .from('desa')
    .insert({ name, kecamatan_id: kecamatanId })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating desa:", error);
    throw error;
  }
  
  return data;
};

// NKS APIs
export const getNKSList = async (desaId?: string): Promise<NKS[]> => {
  let query = supabase.from('nks').select('*').order('code');
  
  if (desaId) {
    query = query.eq('desa_id', desaId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching NKS:", error);
    throw error;
  }
  
  return data;
};

export const createNKS = async (
  code: string, 
  desaId: string, 
  targetPadi: number, 
  targetPalawija: number
): Promise<NKS> => {
  const { data, error } = await supabase
    .from('nks')
    .insert({ 
      code, 
      desa_id: desaId, 
      target_padi: targetPadi, 
      target_palawija: targetPalawija 
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating NKS:", error);
    throw error;
  }
  
  return data;
};

// Additional NKS API for getting details
export const getNKSDetails = async (nksId: string): Promise<NKS> => {
  const { data, error } = await supabase
    .from('nks')
    .select('*')
    .eq('id', nksId)
    .single();
  
  if (error) {
    console.error("Error fetching NKS details:", error);
    return {
      id: '',
      code: '',
      desa_id: '',
      target_padi: 0,
      target_palawija: 0,
      created_at: new Date().toISOString()
    };
  }
  
  return data;
};

// Additional Desa API for getting by ID
export const getDesaById = async (desaId: string): Promise<Desa | null> => {
  const { data, error } = await supabase
    .from('desa')
    .select('*')
    .eq('id', desaId)
    .single();
  
  if (error) {
    console.error("Error fetching desa by ID:", error);
    return null;
  }
  
  return data;
};

// Additional Kecamatan API for getting by ID
export const getKecamatanById = async (kecamatanId: string): Promise<Kecamatan | null> => {
  const { data, error } = await supabase
    .from('kecamatan')
    .select('*')
    .eq('id', kecamatanId)
    .single();
  
  if (error) {
    console.error("Error fetching kecamatan by ID:", error);
    return null;
  }
  
  return data;
};

// Petugas APIs
export const getPetugasList = async (role?: 'admin' | 'pml' | 'ppl' | 'viewer'): Promise<Petugas[]> => {
  let query = supabase.from('users').select('*').order('name');
  
  if (role) {
    query = query.eq('role', role);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching petugas:", error);
    throw error;
  }
  
  return data;
};

export const createPetugas = async (
  username: string,
  password: string,
  name: string,
  role: 'admin' | 'pml' | 'ppl' | 'viewer',
  pmlId?: string
): Promise<Petugas> => {
  const { data, error } = await supabase
    .from('users')
    .insert({ 
      username, 
      password, 
      name, 
      role,
      pml_id: role === 'ppl' ? pmlId : null 
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating petugas:", error);
    throw error;
  }
  
  return data;
};

// Wilayah Tugas APIs
export const getWilayahTugasList = async (pmlId?: string, pplId?: string): Promise<WilayahTugas[]> => {
  let query = supabase.from('wilayah_tugas').select('*');
  
  if (pmlId) {
    query = query.eq('pml_id', pmlId);
  }
  
  if (pplId) {
    query = query.eq('ppl_id', pplId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching wilayah tugas:", error);
    throw error;
  }
  
  return data;
};

export const createWilayahTugas = async (
  nksId: string,
  pmlId: string,
  pplId: string
): Promise<WilayahTugas> => {
  const { data, error } = await supabase
    .from('wilayah_tugas')
    .insert({ 
      nks_id: nksId, 
      pml_id: pmlId, 
      ppl_id: pplId 
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating wilayah tugas:", error);
    throw error;
  }
  
  return data;
};

// Additional API functions for Alokasi Petugas
export const getPPLList = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'ppl')
      .order('name');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching PPL list:', error);
    throw error;
  }
};

export const getUnassignedNKS = async () => {
  try {
    const { data: allNKS, error: nksError } = await supabase
      .from('nks')
      .select('*');
    
    if (nksError) throw nksError;
    
    const { data: assignedNKS, error: wilayahError } = await supabase
      .from('wilayah_tugas')
      .select('nks_id');
      
    if (wilayahError) throw wilayahError;
    
    const assignedIds = assignedNKS.map(item => item.nks_id);
    
    return allNKS.filter(nks => !assignedIds.includes(nks.id));
  } catch (error) {
    console.error('Error fetching unassigned NKS:', error);
    throw error;
  }
};

export const assignPPLToNKS = async (nksId: string, pplId: string, pmlId: string) => {
  try {
    const { data, error } = await supabase
      .from('wilayah_tugas')
      .insert([
        { nks_id: nksId, ppl_id: pplId, pml_id: pmlId }
      ]);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error assigning PPL to NKS:', error);
    throw error;
  }
};

export const getNKSByPPL = async (pplId: string) => {
  try {
    const { data, error } = await supabase
      .from('wilayah_tugas')
      .select(`
        nks_id,
        nks:nks_id(id, code, desa_id, desa:desa_id(id, name, kecamatan_id, kecamatan:kecamatan_id(id, name)))
      `)
      .eq('ppl_id', pplId);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching NKS by PPL:', error);
    throw error;
  }
};

export const removePPLAssignment = async (nksId: string, pplId: string) => {
  try {
    const { data, error } = await supabase
      .from('wilayah_tugas')
      .delete()
      .match({ nks_id: nksId, ppl_id: pplId });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error removing PPL assignment:', error);
    throw error;
  }
};

// Get PML list function
export const getPMLList = async (): Promise<Petugas[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'pml')
      .order('name');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching PML list:', error);
    throw error;
  }
};
