
export interface PendataanDataItem {
  id: string;
  desa_id: string;
  ppl_id: string;
  jumlah_keluarga?: number;
  jumlah_lahan_pertanian?: number;
  status_infrastruktur?: string;
  potensi_ekonomi?: string;
  catatan_khusus?: string;
  persentase_selesai?: number;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  status: 'belum' | 'proses' | 'selesai' | 'ditolak' | 'approved';
  verification_status?: 'belum_verifikasi' | 'approved' | 'rejected';
  rejection_reason?: string;
  desa?: {
    id: string;
    name: string;
    kecamatan?: {
      id: string;
      name: string;
    }
  };
  ppl?: {
    id: string;
    name: string;
    username: string;
  };
}
