
export interface Kecamatan {
  id: string;
  name: string;
}

export interface Desa {
  id: string;
  name: string;
  kecamatan_id: string;
}

export interface NKS {
  id: string;
  code: string;
  desa_id: string;
  target_padi: number;
  target_palawija: number;
  created_at: string;
  subround?: number;
}

export interface NKSKomoditas {
  id: string;
  nks_id: string;
  komoditas: string;
  created_at: string;
}

export interface Segmen {
  id: string;
  code: string;
  desa_id: string;
  target_padi: number;
  created_at: string;
  bulan?: number;
}

export interface SampelKRT {
  id: string;
  nama: string;
  status: 'Utama' | 'Cadangan';
  nks_id: string | null;
  segmen_id: string | null;
  created_at: string;
}

export interface WilayahTugas {
  id: string;
  nks_id: string;
  pml_id: string;
  ppl_id: string;
  created_at: string;
}

export interface Petugas {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'pml' | 'ppl' | 'viewer';
  pml_id: string | null;
  created_at: string | null;
}

export interface UbinanData {
  id: string;
  nks_id: string;
  ppl_id: string;
  responden_name: string;
  komoditas: 'padi' | 'jagung' | 'kedelai' | 'kacang_tanah' | 'ubi_kayu' | 'ubi_jalar';
  tanggal_ubinan: string;
  berat_hasil: number;
  status: 'belum_diisi' | 'sudah_diisi' | 'dikonfirmasi' | 'ditolak';
  pml_id: string | null;
  dokumen_diterima: boolean;
  komentar: string | null;
  created_at: string;
  updated_at: string;
  nks?: NKS;
  ppl?: Petugas;
}

export interface ProgressReport {
  id: string;
  ppl_id: string;
  target_count: number;
  completed_count: number;
  verified_count: number;
  rejected_count: number;
  year: number;
  month: number;
  created_at: string;
  updated_at: string;
  ppl?: Petugas;
}

export interface AllocationStatus {
  type: 'nks' | 'segmen';
  id: string;
  code: string;
  desa_id: string;
  desa_name: string;
  kecamatan_name: string;
  kecamatan_id: string;
  is_allocated: boolean;
  ppl_id: string | null;
  pml_id: string | null;
}
