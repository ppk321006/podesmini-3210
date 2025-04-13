
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
    
    const subroundNum = i <= 4 ? 1 : (i <= 8 ? 2 : 3);
    
    if (subroundNum === 1) {
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
