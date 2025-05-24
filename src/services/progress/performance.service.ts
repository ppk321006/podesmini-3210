
import { supabase } from "@/integrations/supabase/client";
import { PerformanceData } from "@/types/database-schema";

export async function getAllPPLPerformance(year: number, subround: number): Promise<PerformanceData[]> {
  try {
    // Since the RPC function doesn't exist, let's query the data directly
    const { data: ubinanData, error } = await supabase
      .from('ubinan_data')
      .select(`
        id,
        status,
        komoditas,
        created_at,
        ppl_id,
        ppl:ppl_id (
          id,
          name
        )
      `);

    if (error) {
      console.error("Error fetching ubinan data:", error);
      return [];
    }

    // Group by PPL and calculate metrics
    const pplMetrics = new Map();
    
    (ubinanData || []).forEach((item: any) => {
      const pplId = item.ppl_id;
      const pplName = item.ppl?.name || 'Unknown';
      
      if (!pplId) return;
      
      if (!pplMetrics.has(pplId)) {
        pplMetrics.set(pplId, {
          id: pplId,
          name: pplName,
          role: 'ppl',
          totalPadi: 0,
          totalPalawija: 0,
          pendingVerification: 0,
          verified: 0,
          rejected: 0,
          createdAt: new Date().toISOString()
        });
      }
      
      const metrics = pplMetrics.get(pplId);
      
      if (item.komoditas === 'padi') {
        metrics.totalPadi++;
      } else {
        metrics.totalPalawija++;
      }
      
      switch (item.status) {
        case 'dikonfirmasi':
          metrics.verified++;
          break;
        case 'sudah_diisi':
          metrics.pendingVerification++;
          break;
        case 'ditolak':
          metrics.rejected++;
          break;
      }
    });

    return Array.from(pplMetrics.values());
  } catch (error) {
    console.error("Error in getAllPPLPerformance:", error);
    return [];
  }
}
