
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

export interface Petugas {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'pml' | 'ppl' | 'viewer';
  pml_id: string | null;
  created_at: string | null;
}
