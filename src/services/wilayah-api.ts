import { supabase } from "@/integrations/supabase/client";
import { Kecamatan, Desa, NKS, WilayahTugas, Petugas, UbinanData, Segmen, SampelKRT } from "@/types/database-schema";

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
  targetPalawija: number,
  komoditasPalawija: string,
  subround: number
): Promise<NKS> => {
  const { data, error } = await supabase
    .from('nks')
    .insert({ 
      code, 
      desa_id: desaId,
      target_palawija: targetPalawija,
      komoditas_palawija: komoditasPalawija,
      subround
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating NKS:", error);
    throw error;
  }
  
  return data;
};

export const updateNKS = async (
  id: string, 
  updates: Partial<NKS>
): Promise<NKS> => {
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
};

export const deleteNKS = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('nks')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting NKS:", error);
    throw error;
  }
};

// Segmen APIs
export const getSegmenList = async (desaId?: string): Promise<Segmen[]> => {
  let query = supabase.from('segmen').select('*').order('code');
  
  if (desaId) {
    query = query.eq('desa_id', desaId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching Segmen:", error);
    throw error;
  }
  
  return data;
};

export const createSegmen = async (
  code: string, 
  desaId: string, 
  targetPadi: number
): Promise<Segmen> => {
  const { data, error } = await supabase
    .from('segmen')
    .insert({ 
      code, 
      desa_id: desaId, 
      target_padi: targetPadi
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating Segmen:", error);
    throw error;
  }
  
  return data;
};

export const updateSegmen = async (
  id: string, 
  updates: Partial<Segmen>
): Promise<Segmen> => {
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
};

export const deleteSegmen = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('segmen')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting Segmen:", error);
    throw error;
  }
};

// Sampel KRT APIs
export const getSampelKRTList = async (nksId?: string, segmenId?: string): Promise<SampelKRT[]> => {
  let query = supabase.from('sampel_krt').select('*').order('nama');
  
  if (nksId) {
    query = query.eq('nks_id', nksId);
  }
  
  if (segmenId) {
    query = query.eq('segmen_id', segmenId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching Sampel KRT:", error);
    throw error;
  }
  
  return data;
};

export const createSampelKRT = async (
  nama: string,
  status: 'Utama' | 'Cadangan',
  nksId?: string,
  segmenId?: string
): Promise<SampelKRT> => {
  const { data, error } = await supabase
    .from('sampel_krt')
    .insert({ 
      nama, 
      status,
      nks_id: nksId,
      segmen_id: segmenId
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating Sampel KRT:", error);
    throw error;
  }
  
  return data;
};

export const deleteSampelKRT = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('sampel_krt')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting Sampel KRT:", error);
    throw error;
  }
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

// Ubinan Data APIs
export const getUbinanDataByPPL = async (pplId: string): Promise<UbinanData[]> => {
  const { data, error } = await supabase
    .from('ubinan_data')
    .select('*, nks:nks_id(*)')
    .eq('ppl_id', pplId);
    
  if (error) {
    console.error("Error fetching ubinan data by PPL:", error);
    throw error;
  }
    
  return data;
};

export const getUbinanDataForVerification = async (pmlId: string): Promise<UbinanData[]> => {
  const { data, error } = await supabase
    .from('ubinan_data')
    .select('*, nks:nks_id(*), ppl:ppl_id(*)')
    .eq('pml_id', pmlId);
    
  if (error) {
    console.error("Error fetching ubinan data for verification:", error);
    throw error;
  }
    
  return data;
};

export const createUbinanData = async (
  nksId: string,
  pplId: string,
  respondenName: string,
  komoditas: string,
  tanggalUbinan: string,
  beratHasil: number,
  pmlId: string
): Promise<UbinanData> => {
  const { data, error } = await supabase
    .from('ubinan_data')
    .insert({
      nks_id: nksId,
      ppl_id: pplId,
      responden_name: respondenName,
      komoditas: komoditas,
      tanggal_ubinan: tanggalUbinan,
      berat_hasil: beratHasil,
      status: 'sudah_diisi',
      pml_id: pmlId
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating ubinan data:", error);
    throw error;
  }
    
  return data;
};

export const updateUbinanVerification = async (
  id: string,
  status: 'dikonfirmasi' | 'ditolak',
  dokumenDiterima: boolean,
  komentar?: string
): Promise<UbinanData> => {
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
    
  return data;
};

// Get full details of NKS with assignments
export const getNKSWithAssignments = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('nks')
    .select(`
      *,
      desa:desa_id(id, name, kecamatan:kecamatan_id(id, name)),
      wilayah_tugas(id, pml_id, ppl_id, pml:pml_id(id, name), ppl:ppl_id(id, name))
    `);
  
  if (error) {
    console.error("Error fetching NKS with assignments:", error);
    throw error;
  }
  
  return data;
};

// Get full details of Segmen with assignments
export const getSegmenWithAssignments = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('segmen')
    .select(`
      *,
      desa:desa_id(id, name, kecamatan:kecamatan_id(id, name))
    `);
  
  if (error) {
    console.error("Error fetching Segmen with assignments:", error);
    throw error;
  }
  
  return data;
};

// Get current subround
export const getSubround = async () => {
  const { data, error } = await supabase.rpc('get_subround');
  
  if (error) {
    throw error;
  }
  
  return data as unknown as number;
};

export const getUbinanProgressBySubround = async (subround: number) => {
  const { data, error } = await supabase.rpc('get_ubinan_progress_by_subround', { subround_param: subround });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getUbinanProgressByYear = async (year: number = new Date().getFullYear()) => {
  const { data, error } = await supabase.rpc('get_ubinan_progress_by_year', { year_param: year });
  
  if (error) {
    throw error;
  }
  
  return data;
};
