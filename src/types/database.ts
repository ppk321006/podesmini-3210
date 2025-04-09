
export type KomoditasType = 'padi' | 'jagung' | 'kedelai' | 'kacang_tanah' | 'ubi_kayu' | 'ubi_jalar';
export type VerificationStatus = 'belum_diisi' | 'sudah_diisi' | 'dikonfirmasi' | 'ditolak';

export interface DatabaseUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'pml' | 'ppl' | 'viewer';
  pml_id: string | null;
}

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
}

export interface WilayahTugas {
  id: string;
  nks_id: string;
  pml_id: string;
  ppl_id: string;
  created_at: string;
}

export interface UbinanData {
  id: string;
  nks_id: string;
  ppl_id: string;
  responden_name: string;
  komoditas: KomoditasType;
  tanggal_ubinan: string;
  berat_hasil: number;
  status: VerificationStatus;
  pml_id: string | null;
  dokumen_diterima: boolean;
  komentar: string | null;
  created_at: string;
  updated_at: string;
}
