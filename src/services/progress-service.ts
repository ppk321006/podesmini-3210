
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";

export async function getProgressDetailBySubround(subround: number, year: number, userRole?: UserRole, userId?: string) {
  try {
    let query = supabase
      .from('ubinan_progress_monthly')
      .select('*')
      .eq('subround', subround)
      .eq('year', year);
      
    // Apply filters based on user role
    if (userRole && userId) {
      if (userRole === UserRole.PPL) {
        query = query.eq('ppl_id', userId);
      } else if (userRole === UserRole.PML) {
        // For PML, get data from PPLs under their supervision
        const { data: pplIds } = await supabase
          .from('users')
          .select('id')
          .eq('pml_id', userId);
          
        if (pplIds && pplIds.length > 0) {
          const ids = pplIds.map(item => item.id);
          query = query.in('ppl_id', ids);
        }
      }
    }

    const { data, error } = await query.order('month');
    
    if (error) {
      console.error("Error fetching monthly progress data:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getProgressDetailBySubround:", error);
    return [];
  }
}

export async function getUbinanTotalsBySubround(subround: number, year: number, userRole?: UserRole, userId?: string) {
  try {
    let query = supabase
      .from('ubinan_totals')
      .select('*')
      .eq('subround', subround)
      .eq('year', year);
      
    // Apply filters based on user role
    if (userRole && userId) {
      if (userRole === UserRole.PPL) {
        query = query.eq('ppl_id', userId);
      } else if (userRole === UserRole.PML) {
        // For PML, get data from PPLs under their supervision
        const { data: pplIds } = await supabase
          .from('users')
          .select('id')
          .eq('pml_id', userId);
          
        if (pplIds && pplIds.length > 0) {
          const ids = pplIds.map(item => item.id);
          query = query.in('ppl_id', ids);
        }
      }
    }

    const { data, error } = await query.single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching ubinan totals:", error);
      throw error;
    }
    
    // Return default values if no data found
    if (!data) {
      return {
        padi_target: 0,
        palawija_target: 0,
        total_padi: 0,
        total_palawija: 0
      };
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUbinanTotalsBySubround:", error);
    return {
      padi_target: 0,
      palawija_target: 0,
      total_padi: 0,
      total_palawija: 0
    };
  }
}
