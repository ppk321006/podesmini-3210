
import { supabase } from "@/integrations/supabase/client";
import { DetailProgressData } from "@/types/database-schema";
import { createProgressDataFromUbinan } from "./utils.service";

export async function getPPLTargets(pplId: string): Promise<{ padi: number, palawija: number }> {
  try {
    const { data: nksAssignments, error: nksError } = await supabase
      .from('wilayah_tugas')
      .select('nks_id, nks!inner(target_padi, target_palawija)')
      .eq('ppl_id', pplId);
      
    if (nksError) {
      console.error("Error fetching NKS assignments:", nksError);
      return { padi: 0, palawija: 0 };
    }
    
    const { data: segmenAssignments, error: segmenError } = await supabase
      .from('wilayah_tugas_segmen')
      .select('segmen_id, segmen!inner(target_padi)')
      .eq('ppl_id', pplId);
      
    if (segmenError) {
      console.error("Error fetching Segmen assignments:", segmenError);
      return { padi: 0, palawija: 0 };
    }
    
    const padiTarget = segmenAssignments.reduce((sum, item) => {
      return sum + (item.segmen?.target_padi || 0);
    }, 0);
    
    const palawijaTarget = nksAssignments.reduce((sum, item) => {
      return sum + (item.nks?.target_palawija || 0);
    }, 0);
    
    return {
      padi: padiTarget,
      palawija: palawijaTarget
    };
  } catch (error) {
    console.error("Error in getPPLTargets:", error);
    return { padi: 0, palawija: 0 };
  }
}

export async function getPPLsByPML(pmlId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username')
      .eq('pml_id', pmlId)
      .eq('role', 'ppl');
      
    if (error) {
      console.error("Error fetching PPLs by PML:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getPPLsByPML:", error);
    return [];
  }
}

export async function filterUbinanBySubround(ubinanData: any[], subround: number) {
  if (subround === 0) return ubinanData;
  
  return ubinanData.filter(item => {
    const date = new Date(item.tanggal_ubinan);
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    
    if (subround === 1) return month >= 1 && month <= 4;
    if (subround === 2) return month >= 5 && month <= 8;
    if (subround === 3) return month >= 9 && month <= 12;
    
    return true;
  });
}

export async function getPPLProgressByMonth(pplId: string, year: number = new Date().getFullYear()): Promise<DetailProgressData[]> {
  try {
    const targets = await getPPLTargets(pplId);
    const { data, error } = await supabase
      .from('ubinan_data')
      .select('*')
      .eq('ppl_id', pplId)
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (error) {
      console.error("Error fetching PPL progress:", error);
      return [];
    }
    
    return createProgressDataFromUbinan(data, targets.padi, targets.palawija);
  } catch (error) {
    console.error("Error in getPPLProgressByMonth:", error);
    return [];
  }
}

export async function getPMLProgressByMonth(pmlId: string, year: number = new Date().getFullYear()): Promise<DetailProgressData[]> {
  try {
    const ppls = await getPPLsByPML(pmlId);
    
    if (!ppls.length) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('ubinan_data')
      .select('*')
      .in('ppl_id', ppls.map(ppl => ppl.id))
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (error) {
      console.error("Error fetching PML progress:", error);
      return [];
    }
    
    let totalPadiTarget = 0;
    let totalPalawijaTarget = 0;
    
    for (const ppl of ppls) {
      const targets = await getPPLTargets(ppl.id);
      totalPadiTarget += targets.padi;
      totalPalawijaTarget += targets.palawija;
    }
    
    return createProgressDataFromUbinan(data, totalPadiTarget, totalPalawijaTarget);
  } catch (error) {
    console.error("Error in getPMLProgressByMonth:", error);
    return [];
  }
}

export async function getProgressByPML(pmlId: string) {
  try {
    const ppls = await getPPLsByPML(pmlId);
    
    if (!ppls.length) {
      return {
        totalPadi: 0,
        totalPalawija: 0,
        pendingVerification: 0,
        verified: 0,
        rejected: 0
      };
    }
    
    const { data: ubinanData, error } = await supabase
      .from('ubinan_data')
      .select('id, ppl_id, komoditas, status, tanggal_ubinan')
      .in('ppl_id', ppls.map(ppl => ppl.id));
      
    if (error) {
      console.error("Error fetching PML progress:", error);
      return {
        totalPadi: 0,
        totalPalawija: 0,
        pendingVerification: 0,
        verified: 0,
        rejected: 0
      };
    }
    
    const pendingVerification = ubinanData.filter(item => item.status === 'sudah_diisi').length;
    const verified = ubinanData.filter(item => item.status === 'dikonfirmasi').length;
    const rejected = ubinanData.filter(item => item.status === 'ditolak').length;
    const totalPadi = ubinanData.filter(item => item.komoditas === 'padi' && item.status === 'dikonfirmasi').length;
    const totalPalawija = ubinanData.filter(item => item.komoditas !== 'padi' && item.status === 'dikonfirmasi').length;
    
    return {
      totalPadi,
      totalPalawija,
      pendingVerification,
      verified,
      rejected
    };
  } catch (error) {
    console.error("Error in getProgressByPML:", error);
    return {
      totalPadi: 0,
      totalPalawija: 0,
      pendingVerification: 0,
      verified: 0,
      rejected: 0
    };
  }
}

export async function getUbinanDataByPML(pmlId: string) {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(
          id, code,
          desa:desa_id(
            id, name,
            kecamatan:kecamatan_id(id, name)
          )
        ),
        segmen:segmen_id(
          id, code,
          desa:desa_id(
            id, name,
            kecamatan:kecamatan_id(id, name)
          )
        ),
        ppl:ppl_id(id, name, username)
      `)
      .eq('pml_id', pmlId);
      
    if (error) {
      console.error("Error fetching ubinan data by PML:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUbinanDataByPML:", error);
    return [];
  }
}
