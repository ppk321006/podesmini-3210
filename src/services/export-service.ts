
import * as XLSX from 'xlsx';
import { Blob } from 'buffer';
import html2canvas from 'html-to-image';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

// Function to export Ubinan data to Excel
export async function exportUbinanDataToExcel(startDate: string, endDate: string): Promise<Blob> {
  try {
    // Fetch data from database
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        ppl:ppl_id(name),
        nks:nks_id(code, desa:desa_id(name, kecamatan:kecamatan_id(name))),
        segmen:segmen_id(code, desa:desa_id(name, kecamatan:kecamatan_id(name)))
      `)
      .gte('tanggal_ubinan', startDate)
      .lte('tanggal_ubinan', endDate);

    if (error) throw error;

    // Transform data for Excel format
    const excelData = data.map(item => ({
      'Tanggal Ubinan': new Date(item.tanggal_ubinan).toLocaleDateString('id-ID'),
      'Kode': item.nks ? item.nks.code : item.segmen ? item.segmen.code : '-',
      'Jenis': item.nks_id ? 'NKS' : 'Segmen',
      'Desa': item.nks ? item.nks.desa.name : item.segmen ? item.segmen.desa.name : '-',
      'Kecamatan': item.nks ? item.nks.desa.kecamatan.name : item.segmen ? item.segmen.desa.kecamatan.name : '-',
      'Komoditas': item.komoditas.replace('_', ' ').toUpperCase(),
      'Responden': item.responden_name,
      'Status Sampel': item.sample_status || '-',
      'Berat Hasil (kg)': item.berat_hasil,
      'PPL': item.ppl ? item.ppl.name : '-',
      'Status': item.status === 'dikonfirmasi' ? 'Terverifikasi' :
                item.status === 'sudah_diisi' ? 'Menunggu Verifikasi' :
                item.status === 'ditolak' ? 'Ditolak' : 'Belum Diisi',
      'Dokumen Diterima': item.dokumen_diterima ? 'Ya' : 'Tidak',
      'Komentar': item.komentar || '-'
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data Ubinan');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    throw error;
  }
}

// Function to export Ubinan report to JPEG
export async function exportUbinanReportToJpeg(startDate: string, endDate: string): Promise<Blob> {
  try {
    // Fetch data from database
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        ppl:ppl_id(name),
        nks:nks_id(code, desa:desa_id(name, kecamatan:kecamatan_id(name))),
        segmen:segmen_id(code, desa:desa_id(name, kecamatan:kecamatan_id(name)))
      `)
      .gte('tanggal_ubinan', startDate)
      .lte('tanggal_ubinan', endDate);

    if (error) throw error;

    // Create a temporary container for the report
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Add title
    const title = document.createElement('h1');
    title.textContent = `Laporan Ubinan (${startDate} - ${endDate})`;
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    container.appendChild(title);
    
    // Create summary section
    const summary = document.createElement('div');
    summary.style.marginBottom = '30px';
    
    const totalEntries = data.length;
    const padiCount = data.filter(item => item.komoditas === 'padi').length;
    const palawijaCount = data.filter(item => item.komoditas !== 'padi').length;
    const verifiedCount = data.filter(item => item.status === 'dikonfirmasi').length;
    
    summary.innerHTML = `
      <h2>Ringkasan</h2>
      <p>Total Data: ${totalEntries}</p>
      <p>Data Padi: ${padiCount}</p>
      <p>Data Palawija: ${palawijaCount}</p>
      <p>Data Terverifikasi: ${verifiedCount}</p>
    `;
    container.appendChild(summary);
    
    // Create table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '30px';
    
    // Add table header
    table.innerHTML = `
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Tanggal</th>
          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Alokasi</th>
          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Komoditas</th>
          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Responden</th>
          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Berat (kg)</th>
          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${new Date(item.tanggal_ubinan).toLocaleDateString('id-ID')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.nks_id ? `NKS: ${item.nks.code}` : `Segmen: ${item.segmen.code}`}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.komoditas.replace('_', ' ').toUpperCase()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.responden_name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.berat_hasil}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              item.status === 'dikonfirmasi' ? 'Terverifikasi' :
              item.status === 'sudah_diisi' ? 'Menunggu Verifikasi' :
              item.status === 'ditolak' ? 'Ditolak' : 'Belum Diisi'
            }</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    container.appendChild(table);
    
    // Add timestamp
    const footer = document.createElement('div');
    footer.style.textAlign = 'right';
    footer.style.fontSize = '12px';
    footer.style.color = '#666';
    footer.textContent = `Diekspor pada: ${new Date().toLocaleString('id-ID')}`;
    container.appendChild(footer);
    
    // Append container to document temporarily
    document.body.appendChild(container);
    
    // Convert to image
    const canvas = await html2canvas(container);
    
    // Remove container from document
    document.body.removeChild(container);
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob);
      }, 'image/jpeg', 0.95);
    });
  } catch (error) {
    console.error('Error exporting report to JPEG:', error);
    throw error;
  }
}

// Function to export Ubinan report to PDF (kept for reference)
export async function exportUbinanReportToPdf(startDate: string, endDate: string): Promise<Blob> {
  try {
    // Fetch data from database
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        ppl:ppl_id(name),
        nks:nks_id(code, desa:desa_id(name, kecamatan:kecamatan_id(name))),
        segmen:segmen_id(code, desa:desa_id(name, kecamatan:kecamatan_id(name)))
      `)
      .gte('tanggal_ubinan', startDate)
      .lte('tanggal_ubinan', endDate);

    if (error) throw error;

    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Laporan Ubinan (${startDate} - ${endDate})`, 105, 15, { align: 'center' });
    
    // Add summary information
    doc.setFontSize(12);
    const totalEntries = data.length;
    const padiCount = data.filter(item => item.komoditas === 'padi').length;
    const palawijaCount = data.filter(item => item.komoditas !== 'padi').length;
    const verifiedCount = data.filter(item => item.status === 'dikonfirmasi').length;
    
    doc.text(`Total Data: ${totalEntries}`, 14, 30);
    doc.text(`Data Padi: ${padiCount}`, 14, 37);
    doc.text(`Data Palawija: ${palawijaCount}`, 14, 44);
    doc.text(`Data Terverifikasi: ${verifiedCount}`, 14, 51);
    
    // Generate table data
    const tableData = data.map(item => [
      new Date(item.tanggal_ubinan).toLocaleDateString('id-ID'),
      item.nks_id ? `NKS: ${item.nks.code}` : `Segmen: ${item.segmen.code}`,
      item.komoditas.replace('_', ' ').toUpperCase(),
      item.responden_name,
      item.berat_hasil,
      item.status === 'dikonfirmasi' ? 'Terverifikasi' :
      item.status === 'sudah_diisi' ? 'Menunggu Verifikasi' :
      item.status === 'ditolak' ? 'Ditolak' : 'Belum Diisi'
    ]);
    
    // Add table
    autoTable(doc, {
      head: [['Tanggal', 'Alokasi', 'Komoditas', 'Responden', 'Berat (kg)', 'Status']],
      body: tableData,
      startY: 60,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 122, 183] }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Diekspor pada: ${new Date().toLocaleString('id-ID')}`, 190, 285, { align: 'right' });
      doc.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' });
    }
    
    // Return PDF as blob
    return doc.output('blob');
  } catch (error) {
    console.error('Error exporting report to PDF:', error);
    throw error;
  }
}
