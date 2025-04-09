
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
