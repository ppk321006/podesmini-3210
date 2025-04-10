
import { supabase } from "@/integrations/supabase/client";
import { UbinanData, Petugas } from "@/types/database-schema";
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { toPng } from 'html-to-image';

// Function to fetch ubinan data with filter
export const getUbinanDataForExport = async (
  startDate: string,
  endDate: string,
  komoditas: string = 'all'
): Promise<any[]> => {
  let query = supabase
    .from('ubinan_data')
    .select(`
      *,
      nks:nks_id(*),
      segmen:segmen_id(*),
      ppl:ppl_id(id, name),
      pml:pml_id(id, name)
    `)
    .gte('tanggal_ubinan', startDate)
    .lte('tanggal_ubinan', endDate);

  if (komoditas !== 'all') {
    query = query.eq('komoditas', komoditas);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching ubinan data for export:', error);
    throw error;
  }

  return data || [];
};

// Function to export data to Excel
export const exportUbinanDataToExcel = async (
  startDate: string,
  endDate: string,
  komoditas: string = 'all'
): Promise<Blob> => {
  const data = await getUbinanDataForExport(startDate, endDate, komoditas);

  // Transform data for Excel format
  const excelData = data.map(item => {
    const allocationType = item.nks_id ? 'NKS' : 'Segmen';
    const allocationCode = item.nks_id ? item.nks?.code : item.segmen?.code;

    return {
      'Kode': allocationCode || '-',
      'Jenis Alokasi': allocationType,
      'Nama Responden': item.responden_name,
      'Status Sampel': item.sample_status || '-',
      'Komoditas': item.komoditas.replace('_', ' '),
      'Tanggal Ubinan': item.tanggal_ubinan,
      'Berat Hasil (kg)': item.berat_hasil,
      'Status': item.status,
      'Dokumen Diterima': item.dokumen_diterima ? 'Ya' : 'Tidak',
      'PPL': item.ppl?.name || '-',
      'PML': item.pml?.name || '-',
      'Komentar': item.komentar || '-',
      'Tanggal Input': new Date(item.created_at).toLocaleDateString('id-ID'),
      'Tanggal Update': new Date(item.updated_at).toLocaleDateString('id-ID')
    };
  });

  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 10 }, // Kode
    { wch: 12 }, // Jenis Alokasi
    { wch: 20 }, // Nama Responden
    { wch: 12 }, // Status Sampel
    { wch: 15 }, // Komoditas
    { wch: 15 }, // Tanggal Ubinan
    { wch: 10 }, // Berat Hasil
    { wch: 15 }, // Status
    { wch: 15 }, // Dokumen Diterima
    { wch: 20 }, // PPL
    { wch: 20 }, // PML
    { wch: 25 }, // Komentar
    { wch: 15 }, // Tanggal Input
    { wch: 15 }, // Tanggal Update
  ];

  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data Ubinan');

  // Write to buffer
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  // Convert to Blob
  return new Blob([wbout], { type: 'application/octet-stream' });
};

// Function to export PDF report
export const exportUbinanReportToPdf = async (
  startDate: string,
  endDate: string,
  komoditas: string = 'all'
): Promise<Blob> => {
  const data = await getUbinanDataForExport(startDate, endDate, komoditas);

  // Create PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Laporan Data Ubinan', 105, 15, { align: 'center' });
  
  // Add period
  const startDateFormatted = new Date(startDate).toLocaleDateString('id-ID');
  const endDateFormatted = new Date(endDate).toLocaleDateString('id-ID');
  doc.setFontSize(12);
  doc.text(`Periode: ${startDateFormatted} - ${endDateFormatted}`, 105, 25, { align: 'center' });
  
  // Add komoditas filter info
  doc.text(`Komoditas: ${komoditas === 'all' ? 'Semua' : komoditas.replace('_', ' ')}`, 105, 32, { align: 'center' });

  // Add summary statistics
  const totalCount = data.length;
  const verifiedCount = data.filter(item => item.status === 'dikonfirmasi').length;
  const rejectedCount = data.filter(item => item.status === 'ditolak').length;
  const pendingCount = data.filter(item => item.status === 'sudah_diisi').length;
  
  doc.text(`Total Data: ${totalCount}`, 20, 45);
  doc.text(`Terverifikasi: ${verifiedCount}`, 20, 52);
  doc.text(`Ditolak: ${rejectedCount}`, 20, 59);
  doc.text(`Menunggu Verifikasi: ${pendingCount}`, 20, 66);

  // Group by komoditas
  const komoditasGroups = data.reduce((acc, item) => {
    const komoditasName = item.komoditas.replace('_', ' ');
    if (!acc[komoditasName]) {
      acc[komoditasName] = [];
    }
    acc[komoditasName].push(item);
    return acc;
  }, {});

  // Add table to PDF
  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    startY: 75,
    head: [['Komoditas', 'Jumlah', 'Rata-rata Berat (kg)']],
    body: Object.entries(komoditasGroups).map(([komoditas, items]) => {
      const avgWeight = items.reduce((sum, item) => sum + Number(item.berat_hasil), 0) / items.length;
      return [
        komoditas,
        items.length,
        avgWeight.toFixed(2)
      ];
    }),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }
  });

  // Extract PPL performance
  const pplPerformance = data.reduce((acc, item) => {
    const pplName = item.ppl?.name || 'Unknown';
    if (!acc[pplName]) {
      acc[pplName] = { total: 0, verified: 0, rejected: 0 };
    }
    acc[pplName].total++;
    if (item.status === 'dikonfirmasi') acc[pplName].verified++;
    if (item.status === 'ditolak') acc[pplName].rejected++;
    return acc;
  }, {});

  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    startY: doc.previousAutoTable.finalY + 15,
    head: [['PPL', 'Total', 'Terverifikasi', 'Ditolak', 'Persentase Verifikasi']],
    body: Object.entries(pplPerformance).map(([ppl, stats]) => {
      const verificationRate = stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(1) : '0';
      return [
        ppl,
        stats.total,
        stats.verified,
        stats.rejected,
        `${verificationRate}%`
      ];
    }),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }
  });

  // Add timestamp
  const timestamp = new Date().toLocaleString('id-ID');
  doc.setFontSize(10);
  doc.text(`Laporan dibuat pada: ${timestamp}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });

  // Convert to Blob
  return doc.output('blob');
};

// Function to export chart as image
export const exportUbinanChartToImage = async (
  startDate: string,
  endDate: string,
  komoditas: string = 'all'
): Promise<Blob> => {
  // Get data
  const data = await getUbinanDataForExport(startDate, endDate, komoditas);
  
  // Create a temporary div for chart rendering
  const chartDiv = document.createElement('div');
  chartDiv.style.width = '800px';
  chartDiv.style.height = '600px';
  chartDiv.style.backgroundColor = 'white';
  chartDiv.style.padding = '20px';
  chartDiv.style.position = 'absolute';
  chartDiv.style.left = '-9999px';
  
  document.body.appendChild(chartDiv);
  
  // Set chart title and period info
  const titleDiv = document.createElement('div');
  titleDiv.style.textAlign = 'center';
  titleDiv.style.fontSize = '18px';
  titleDiv.style.fontWeight = 'bold';
  titleDiv.style.marginBottom = '10px';
  titleDiv.textContent = 'Grafik Data Ubinan';
  chartDiv.appendChild(titleDiv);
  
  const periodDiv = document.createElement('div');
  periodDiv.style.textAlign = 'center';
  periodDiv.style.fontSize = '14px';
  periodDiv.style.marginBottom = '20px';
  periodDiv.textContent = `Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`;
  chartDiv.appendChild(periodDiv);
  
  // Create simple chart using HTML/CSS
  const chartContent = document.createElement('div');
  chartContent.style.display = 'flex';
  chartContent.style.height = '400px';
  chartContent.style.alignItems = 'flex-end';
  chartContent.style.gap = '20px';
  chartContent.style.padding = '20px 0';
  chartContent.style.borderBottom = '2px solid black';
  
  // Group by komoditas
  const komoditasGroups = data.reduce((acc, item) => {
    const komoditasName = item.komoditas.replace('_', ' ');
    if (!acc[komoditasName]) {
      acc[komoditasName] = [];
    }
    acc[komoditasName].push(item);
    return acc;
  }, {});
  
  // Define colors
  const barColors = ['#4299E1', '#48BB78', '#ED8936', '#9F7AEA', '#F56565', '#ED64A6'];
  
  // Create bar chart
  let colorIndex = 0;
  Object.entries(komoditasGroups).forEach(([komoditas, items]: [string, any[]]) => {
    const barWrapper = document.createElement('div');
    barWrapper.style.display = 'flex';
    barWrapper.style.flexDirection = 'column';
    barWrapper.style.alignItems = 'center';
    barWrapper.style.flex = '1';
    
    const count = items.length;
    const maxCount = Math.max(...Object.values(komoditasGroups).map((items: any[]) => items.length));
    const barHeight = Math.max(10, (count / maxCount) * 350);
    
    const bar = document.createElement('div');
    bar.style.width = '60px';
    bar.style.height = `${barHeight}px`;
    bar.style.backgroundColor = barColors[colorIndex % barColors.length];
    bar.style.borderTopLeftRadius = '4px';
    bar.style.borderTopRightRadius = '4px';
    
    const label = document.createElement('div');
    label.style.marginTop = '10px';
    label.style.fontSize = '12px';
    label.style.textAlign = 'center';
    label.style.wordWrap = 'break-word';
    label.style.width = '80px';
    label.textContent = `${komoditas} (${count})`;
    
    barWrapper.appendChild(bar);
    barWrapper.appendChild(label);
    chartContent.appendChild(barWrapper);
    
    colorIndex++;
  });
  
  chartDiv.appendChild(chartContent);
  
  // Add legend for status
  const legendDiv = document.createElement('div');
  legendDiv.style.marginTop = '30px';
  legendDiv.style.display = 'flex';
  legendDiv.style.justifyContent = 'center';
  legendDiv.style.gap = '20px';
  
  const statusTypes = [
    { status: 'dikonfirmasi', label: 'Terverifikasi', color: '#48BB78' },
    { status: 'ditolak', label: 'Ditolak', color: '#F56565' },
    { status: 'sudah_diisi', label: 'Menunggu Verifikasi', color: '#ED8936' },
    { status: 'belum_diisi', label: 'Belum Diisi', color: '#A0AEC0' }
  ];
  
  statusTypes.forEach(({ status, label, color }) => {
    const count = data.filter(item => item.status === status).length;
    const statusItem = document.createElement('div');
    statusItem.style.display = 'flex';
    statusItem.style.alignItems = 'center';
    statusItem.style.gap = '5px';
    
    const colorBox = document.createElement('div');
    colorBox.style.width = '15px';
    colorBox.style.height = '15px';
    colorBox.style.backgroundColor = color;
    
    const statusLabel = document.createElement('span');
    statusLabel.textContent = `${label}: ${count}`;
    
    statusItem.appendChild(colorBox);
    statusItem.appendChild(statusLabel);
    legendDiv.appendChild(statusItem);
  });
  
  chartDiv.appendChild(legendDiv);
  
  try {
    // Convert the chart div to PNG
    const dataUrl = await toPng(chartDiv);
    
    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Clean up
    document.body.removeChild(chartDiv);
    
    return blob;
  } catch (error) {
    console.error('Error generating chart image:', error);
    document.body.removeChild(chartDiv);
    throw error;
  }
};
