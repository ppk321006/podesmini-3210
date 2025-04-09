
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase-db";

// Define types based on our custom database schema
type DatabaseUser = Database['public']['Tables']['users']['Row'];
type Kecamatan = Database['public']['Tables']['kecamatan']['Row'];
type Desa = Database['public']['Tables']['desa']['Row'];
type NKS = Database['public']['Tables']['nks']['Row'];
type WilayahTugas = Database['public']['Tables']['wilayah_tugas']['Row'];
type UbinanData = Database['public']['Tables']['ubinan_data']['Row'];

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

// Wilayah Tugas API
export const getWilayahTugasByPML = async (pmlId: string) => {
  const { data, error } = await supabase
    .from('wilayah_tugas')
    .select()
    .eq('pml_id', pmlId);
  
  if (error) {
    throw error;
  }
  
  return data as WilayahTugas[];
};

export const getWilayahTugasByPPL = async (pplId: string) => {
  const { data, error } = await supabase
    .from('wilayah_tugas')
    .select()
    .eq('ppl_id', pplId);
  
  if (error) {
    throw error;
  }
  
  return data as WilayahTugas[];
};

// Ubinan Data API
export const getUbinanDataByPPL = async (pplId: string) => {
  const { data, error } = await supabase
    .from('ubinan_data')
    .select()
    .eq('ppl_id', pplId);
  
  if (error) {
    throw error;
  }
  
  return data as UbinanData[];
};

export const getUbinanDataForVerification = async (pmlId: string) => {
  const { data, error } = await supabase
    .from('ubinan_data')
    .select()
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
  
  return data as unknown as number;
};

// Export types for use in other components
export type { DatabaseUser, Kecamatan, Desa, NKS, WilayahTugas, UbinanData };
