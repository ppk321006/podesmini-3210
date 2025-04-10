
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
  komoditas_palawija?: string | null;
}

export interface Segmen {
  id: string;
  code: string;
  desa_id: string;
  target_padi: number;
  created_at: string;
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
