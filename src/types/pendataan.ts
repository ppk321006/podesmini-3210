
export interface Kecamatan {
  id: string;
  nama: string;
  jumlah_desa: number;
  target: number;
  selesai: number;
  proses: number;
  ditolak: number;
}

export interface Desa {
  id: string;
  kecamatan_id: string;
  nama: string;
  status: "selesai" | "proses" | "belum" | "ditolak";
  ppl_id?: string;
  pml_id?: string;
  last_updated?: string;
}

export interface DataPendataanDesa {
  id: string;
  desa_id: string;
  ppl_id: string;
  jumlah_penduduk: number;
  luas_wilayah: number;
  potensi_ekonomi: string;
  infrastruktur: string;
  catatan: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  alasan_penolakan?: string;
  created_at: string;
  updated_at: string;
}

export interface DokumenPendataan {
  id: string;
  pendataan_id: string;
  nama_file: string;
  jenis_file: "foto" | "dokumen";
  tipe_file: string; // mime type
  ukuran: number; // in bytes
  url: string;
  created_at: string;
}

export interface Notifikasi {
  id: string;
  user_id: string;
  judul: string;
  pesan: string;
  tipe: "info" | "warning" | "success" | "error";
  dibaca: boolean;
  created_at: string;
  data?: {
    pendataan_id?: string;
    desa_id?: string;
  };
}

export interface StatusPendataan {
  total: number;
  selesai: number;
  proses: number;
  belum: number;
  ditolak: number;
  persentase_selesai: number;
}

// For file upload functionality
export interface FileUpload {
  file: File;
  progress: number;
  error?: string;
  url?: string;
  id?: string;
}
