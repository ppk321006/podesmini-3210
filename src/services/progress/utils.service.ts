
import { DetailProgressData } from "@/types/database-schema";

export function createProgressDataFromUbinan(
  ubinanData: any[],
  padiTarget: number,
  palawijaTarget: number
): DetailProgressData[] {
  const monthlyData: DetailProgressData[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const monthItems = ubinanData.filter(item => {
      const itemDate = new Date(item.tanggal_ubinan);
      return itemDate.getMonth() + 1 === i;
    });
    
    const padiCount = monthItems.filter(item => item.komoditas === 'padi' && item.status === 'dikonfirmasi').length;
    const palawijaCount = monthItems.filter(item => item.komoditas !== 'padi' && item.status === 'dikonfirmasi').length;
    
    let monthlyPadiTarget = 0;
    let monthlyPalawijaTarget = 0;
    
    // Determine which subround the month belongs to
    const subroundNum = getSubroundFromMonth(i);
    
    // Allocate targets based on the subround
    if (subroundNum === 1) {
      monthlyPadiTarget = Math.ceil(padiTarget / 4);
      monthlyPalawijaTarget = Math.ceil(palawijaTarget / 4);
    } else if (subroundNum === 2) {
      monthlyPadiTarget = Math.ceil(padiTarget / 4);
      monthlyPalawijaTarget = Math.ceil(palawijaTarget / 4);
    } else if (subroundNum === 3) {
      monthlyPadiTarget = Math.ceil(padiTarget / 4);
      monthlyPalawijaTarget = Math.ceil(palawijaTarget / 4);
    }
    
    const padiPercentage = monthlyPadiTarget > 0 ? (padiCount / monthlyPadiTarget) * 100 : 0;
    const palawijaPercentage = monthlyPalawijaTarget > 0 ? (palawijaCount / monthlyPalawijaTarget) * 100 : 0;
    
    monthlyData.push({
      month: i,
      padi_count: padiCount,
      palawija_count: palawijaCount,
      padi_target: monthlyPadiTarget,
      palawija_target: monthlyPalawijaTarget,
      padi_percentage: padiPercentage,
      palawija_percentage: palawijaPercentage
    });
  }
  
  return monthlyData;
}

// Helper function to determine which subround a month belongs to
export function getSubroundFromMonth(month: number): number {
  if (month >= 1 && month <= 4) return 1;
  if (month >= 5 && month <= 8) return 2;
  return 3;
}

/**
 * Groups ubinan data by month and extracts counts for PPL activity summary
 */
export function createPPLActivitySummary(data: any[]) {
  if (!data || data.length === 0) return [];

  // Group by PPL ID and Month
  const activityByMonthAndPPL = data.reduce((acc: any, item: any) => {
    const date = new Date(item.tanggal_ubinan);
    const month = date.getMonth() + 1; // 1-12
    const pplId = item.ppl_id;
    const pplName = item.ppl?.name || 'Unknown';
    const pmlId = item.pml_id;
    const pmlName = item.pml?.name || 'Unknown';
    
    const key = `${pplId}:${month}`;
    
    if (!acc[key]) {
      acc[key] = {
        ppl_id: pplId,
        ppl_name: pplName,
        pml_id: pmlId,
        pml_name: pmlName,
        month: month,
        total_count: 0,
        padi_count: 0,
        palawija_count: 0,
        confirmed_count: 0,
        pending_count: 0,
        rejected_count: 0,
      };
    }
    
    acc[key].total_count++;
    
    if (item.komoditas === 'padi') {
      acc[key].padi_count++;
    } else {
      acc[key].palawija_count++;
    }
    
    if (item.status === 'dikonfirmasi') {
      acc[key].confirmed_count++;
    } else if (item.status === 'sudah_diisi') {
      acc[key].pending_count++;
    } else if (item.status === 'ditolak') {
      acc[key].rejected_count++;
    }
    
    return acc;
  }, {});
  
  return Object.values(activityByMonthAndPPL).sort((a: any, b: any) => {
    if (a.ppl_name === b.ppl_name) {
      return a.month - b.month;
    }
    return a.ppl_name.localeCompare(b.ppl_name);
  });
}

/**
 * Creates Supabase RPC parameters for getting PPL activity
 */
export function getActivityParams(year: number, month: number, subround: number, status: string, pplId?: string, pmlId?: string) {
  const params: any = {
    year_param: year
  };
  
  if (month > 0) {
    params.month_param = month;
  } else if (subround > 0) {
    params.subround_param = subround;
  }
  
  if (status !== "all") {
    params.status_param = status;
  }
  
  if (pplId && pplId !== "all") {
    params.ppl_id_param = pplId;
  }
  
  if (pmlId && pmlId !== "all") {
    params.pml_id_param = pmlId;
  }
  
  return params;
}
