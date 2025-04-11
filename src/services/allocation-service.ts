
import { supabase } from "@/integrations/supabase/client";
import { AllocationStatus } from "@/types/database-schema";

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
    
    // Cast the data to the correct type
    return (data || []) as AllocationStatus[];
  } catch (error) {
    console.error("Error in getAllocationStatus:", error);
    return [];
  }
}

export async function getUnassignedAllocations(): Promise<AllocationStatus[]> {
  try {
    const { data, error } = await supabase
      .from('allocation_status')
      .select('*')
      .eq('is_allocated', false)
      .order('type')
      .order('code');
      
    if (error) {
      console.error("Error fetching unassigned allocations:", error);
      throw error;
    }
    
    // Cast the data to the correct type
    return (data || []) as AllocationStatus[];
  } catch (error) {
    console.error("Error in getUnassignedAllocations:", error);
    return [];
  }
}

export async function assignPPLToNKS(nksId: string, pplId: string, pmlId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('wilayah_tugas')
      .insert([
        { nks_id: nksId, ppl_id: pplId, pml_id: pmlId }
      ]);
      
    if (error) {
      console.error("Error assigning PPL to NKS:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in assignPPLToNKS:", error);
    return false;
  }
}

export async function assignPPLToSegmen(segmenId: string, pplId: string, pmlId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('wilayah_tugas_segmen')
      .insert([
        { segmen_id: segmenId, ppl_id: pplId, pml_id: pmlId }
      ]);
      
    if (error) {
      console.error("Error assigning PPL to Segmen:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in assignPPLToSegmen:", error);
    return false;
  }
}

export async function removePPLFromNKS(nksId: string, pplId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('wilayah_tugas')
      .delete()
      .match({ nks_id: nksId, ppl_id: pplId });
      
    if (error) {
      console.error("Error removing PPL from NKS:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removePPLFromNKS:", error);
    return false;
  }
}

export async function removePPLFromSegmen(segmenId: string, pplId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('wilayah_tugas_segmen')
      .delete()
      .match({ segmen_id: segmenId, ppl_id: pplId });
      
    if (error) {
      console.error("Error removing PPL from Segmen:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removePPLFromSegmen:", error);
    return false;
  }
}

export async function getPPLAllocations(pplId: string) {
  try {
    // Get NKS allocations
    const { data: nksData, error: nksError } = await supabase
      .from('wilayah_tugas')
      .select(`
        id,
        nks:nks_id(id, code, desa_id, desa:desa_id(id, name, kecamatan_id, kecamatan:kecamatan_id(id, name))),
        pml:pml_id(id, name)
      `)
      .eq('ppl_id', pplId);
      
    if (nksError) {
      console.error("Error fetching NKS allocations:", nksError);
      throw nksError;
    }
    
    // Get Segmen allocations
    const { data: segmenData, error: segmenError } = await supabase
      .from('wilayah_tugas_segmen')
      .select(`
        id,
        segmen:segmen_id(id, code, desa_id, desa:desa_id(id, name, kecamatan_id, kecamatan:kecamatan_id(id, name))),
        pml:pml_id(id, name)
      `)
      .eq('ppl_id', pplId);
      
    if (segmenError) {
      console.error("Error fetching Segmen allocations:", segmenError);
      throw segmenError;
    }
    
    return {
      nks: nksData || [],
      segmen: segmenData || []
    };
  } catch (error) {
    console.error("Error in getPPLAllocations:", error);
    return {
      nks: [],
      segmen: []
    };
  }
}
