import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as htmlToImage from 'html-to-image';

// Function to export data to Excel
export function downloadToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Convert to Blob and save
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

export async function exportUbinanDataToExcel(startDate: string, endDate: string): Promise<Blob> {
  try {
    // Fetch ubinan data with proper joins
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(id, code, desa_id),
        segmen:segmen_id(id, code, desa_id),
        ppl:ppl_id(id, name)
      `)
      .gte('tanggal_ubinan', startDate)
      .lte('tanggal_ubinan', endDate)
      .order('tanggal_ubinan');
    
    if (error) {
      throw error;
    }
    
    // Get desa information for NKS and Segmen
    const desaIds = new Set<string>();
    data?.forEach((item: any) => {
      if (item.nks && item.nks.desa_id) desaIds.add(item.nks.desa_id);
      if (item.segmen && item.segmen.desa_id) desaIds.add(item.segmen.desa_id);
    });
    
    const { data: desaData, error: desaError } = await supabase
      .from('desa')
      .select('id, name, kecamatan:kecamatan_id(id, name)')
      .in('id', Array.from(desaIds));
      
    if (desaError) {
      throw desaError;
    }
    
    // Create a map of desa info with proper typing
    const desaMap = new Map<string, {name: string, kecamatan_name: string}>();
    desaData?.forEach((desa: any) => {
      desaMap.set(desa.id, {
        name: desa.name || '',
        kecamatan_name: desa.kecamatan ? desa.kecamatan.name || '' : ''
      });
    });
    
    // Transform data for Excel export
    const exportData = data?.map((item: any) => {
      const formattedDate = new Date(item.tanggal_ubinan).toLocaleDateString('id-ID');
      const allocationType = item.nks_id ? 'NKS' : 'Segmen';
      const allocationCode = item.nks_id ? item.nks?.code : item.segmen?.code;
      
      const desaId = item.nks_id ? item.nks?.desa_id : item.segmen?.desa_id;
      const desaInfo = desaMap.get(desaId) || { name: '-', kecamatan_name: '-' };
      const desaName = desaInfo.name;
      const kecamatanName = desaInfo.kecamatan_name;
      
      const komoditas = item.komoditas.replace('_', ' ');
      const responden = item.responden_name;
      const sampleStatus = item.sample_status;
      const beratHasil = item.berat_hasil;
      const pplName = item.ppl ? item.ppl.name : '-';
      const statusVerifikasi = item.status === 'dikonfirmasi' ? 'Terverifikasi' : 
                               item.status === 'sudah_diisi' ? 'Menunggu Verifikasi' : 
                               item.status === 'ditolak' ? 'Ditolak' : 'Belum Diisi';
      const dokumenDiterima = item.dokumen_diterima ? 'Ya' : 'Tidak';
      const komentar = item.komentar || '-';
      
      return {
        'Tanggal': formattedDate,
        'Tipe Alokasi': allocationType,
        'Kode Alokasi': allocationCode,
        'Desa': desaName,
        'Kecamatan': kecamatanName,
        'Komoditas': komoditas,
        'Responden': responden,
        'Status Sampel': sampleStatus,
        'Berat Hasil (kg)': beratHasil,
        'Petugas (PPL)': pplName,
        'Status Verifikasi': statusVerifikasi,
        'Dokumen Diterima': dokumenDiterima,
        'Komentar': komentar
      };
    });
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Ubinan');
    
    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Tanggal
      { wch: 12 }, // Tipe Alokasi
      { wch: 15 }, // Kode Alokasi
      { wch: 20 }, // Desa
      { wch: 20 }, // Kecamatan
      { wch: 15 }, // Komoditas
      { wch: 20 }, // Responden
      { wch: 15 }, // Status Sampel
      { wch: 15 }, // Berat Hasil
      { wch: 20 }, // Petugas
      { wch: 20 }, // Status Verifikasi
      { wch: 15 }, // Dokumen Diterima
      { wch: 30 }  // Komentar
    ];
    worksheet['!cols'] = columnWidths;
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Convert to Blob
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    throw error;
  }
}

export async function exportUbinanReportToJpeg(startDate: string, endDate: string): Promise<Blob> {
  try {
    // Create an element to render the report
    const reportElement = document.createElement('div');
    reportElement.style.fontFamily = 'Arial, sans-serif';
    reportElement.style.padding = '30px';
    reportElement.style.backgroundColor = 'white';
    reportElement.style.width = '1000px';
    reportElement.style.position = 'absolute';
    reportElement.style.left = '-9999px';
    
    // Fetch data
    const { data: ubinanData, error: ubinanError } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(id, code, desa_id),
        segmen:segmen_id(id, code, desa_id),
        ppl:ppl_id(id, name)
      `)
      .gte('tanggal_ubinan', startDate)
      .lte('tanggal_ubinan', endDate)
      .order('tanggal_ubinan');
    
    if (ubinanError) {
      throw ubinanError;
    }
    
    // Generate statistics
    const totalEntries = ubinanData?.length || 0;
    const padiCount = ubinanData?.filter(item => item.komoditas === 'padi').length || 0;
    const palawijaCount = totalEntries - padiCount;
    const verifiedCount = ubinanData?.filter(item => item.status === 'dikonfirmasi').length || 0;
    const pendingCount = ubinanData?.filter(item => item.status === 'sudah_diisi').length || 0;
    const rejectedCount = ubinanData?.filter(item => item.status === 'ditolak').length || 0;
    
    // Build the report HTML
    reportElement.innerHTML = `
      <div style="border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 5px;">Laporan Data Ubinan</h1>
        <p style="color: #666; margin: 0;">Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}</p>
      </div>
      
      <div style="display: flex; margin-bottom: 30px;">
        <div style="flex: 1; background-color: #f0f9ff; border-radius: 10px; padding: 20px; margin-right: 10px;">
          <h3 style="color: #333; font-size: 18px; margin-top: 0;">Ringkasan</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;">Total Data</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${totalEntries}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Padi</td>
              <td style="padding: 8px 0; text-align: right;">${padiCount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Palawija</td>
              <td style="padding: 8px 0; text-align: right;">${palawijaCount}</td>
            </tr>
          </table>
        </div>
        
        <div style="flex: 1; background-color: #f0f9ff; border-radius: 10px; padding: 20px; margin-left: 10px;">
          <h3 style="color: #333; font-size: 18px; margin-top: 0;">Status Verifikasi</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;">Terverifikasi</td>
              <td style="padding: 8px 0; text-align: right; color: green; font-weight: bold;">${verifiedCount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Menunggu Verifikasi</td>
              <td style="padding: 8px 0; text-align: right; color: orange;">${pendingCount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Ditolak</td>
              <td style="padding: 8px 0; text-align: right; color: red;">${rejectedCount}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <h3 style="color: #333; font-size: 18px; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Data Ubinan Terakhir</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Tanggal</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Alokasi</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Komoditas</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Responden</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Berat Hasil</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${ubinanData?.slice(0, 10).map(item => {
            const tanggal = new Date(item.tanggal_ubinan).toLocaleDateString('id-ID');
            const alokasi = item.nks_id ? `NKS: ${item.nks?.code}` : `Segmen: ${item.segmen?.code}`;
            const komoditas = item.komoditas.replace('_', ' ');
            const responden = item.responden_name;
            const beratHasil = `${item.berat_hasil} kg`;
            const status = item.status === 'dikonfirmasi' ? 'Terverifikasi' : 
                          item.status === 'sudah_diisi' ? 'Menunggu' : 
                          item.status === 'ditolak' ? 'Ditolak' : 'Belum Diisi';
            const statusColor = item.status === 'dikonfirmasi' ? 'green' : 
                               item.status === 'sudah_diisi' ? 'orange' : 
                               item.status === 'ditolak' ? 'red' : 'gray';
            
            return `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${tanggal}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${alokasi}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-transform: capitalize;">${komoditas}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${responden}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${beratHasil}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: ${statusColor};">${status}</td>
              </tr>
            `;
          }).join('') || '<tr><td colspan="6" style="text-align: center; padding: 20px;">Tidak ada data</td></tr>'}
        </tbody>
      </table>
      
      <div style="margin-top: 40px; text-align: right; font-style: italic; color: #666;">
        <p>Laporan dibuat pada: ${new Date().toLocaleString('id-ID')}</p>
      </div>
    `;
    
    // Add to document to render
    document.body.appendChild(reportElement);
    
    // Convert to image and return as blob
    try {
      const dataUrl = await htmlToImage.toJpeg(reportElement, { quality: 0.95 });
      document.body.removeChild(reportElement);
      
      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      document.body.removeChild(reportElement);
      throw error;
    }
  } catch (error) {
    console.error('Error exporting report to JPEG:', error);
    throw error;
  }
}
