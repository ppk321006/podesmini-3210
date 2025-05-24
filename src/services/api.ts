
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase-db";
import { AllocationStatus, Petugas, UbinanData } from "@/types/database-schema";

// Define types based on our custom database schema
type DatabaseUser = Database['public']['Tables']['users']['Row'];
type Kecamatan = Database['public']['Tables']['kecamatan']['Row'];
type Desa = Database['public']['Tables']['desa']['Row'];
type NKS = Database['public']['Tables']['nks']['Row'];
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
  
  return data as unknown as UbinanData[];
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
  
  return data as unknown as UbinanData[];
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
    const { data, error } = await supabase.rpc('get_ubinan_progress_by_subround', { 
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

// Export types for use in other components
export type { DatabaseUser, Kecamatan, Desa, NKS, WilayahTugas };
