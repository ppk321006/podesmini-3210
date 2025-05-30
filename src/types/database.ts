export interface Kecamatan {
  id: string;
  name: string;
}

export interface Desa {
  id: string;
  name: string;
  kecamatan_id: string;
  kecamatan?: {
    id: string;
    name: string;
  }
}

export interface NKS {
  id: string;
  code: string;
  desa_id: string;
  target_padi: number;
  target_palawija: number;
  created_at: string;
  subround?: number;
  desa?: {
    id: string;
    name: string;
    kecamatan_id: string;
    kecamatan?: {
      id: string;
      name: string;
    }
  };
  // Extended properties for joined data
  komoditas_list?: NKSKomoditas[];
  wilayah_tugas?: WilayahTugas[];
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
  desa?: {
    id: string;
    name: string;
    kecamatan_id: string;
    kecamatan?: {
      id: string;
      name: string;
    }
  };
  // Extended properties for joined data
  wilayah_tugas_segmen?: WilayahTugasSegmen[];
}

export interface SampelKRT {
  id: string;
  nama: string;
  status: string; // Changed from "Utama" | "Cadangan" to string to match database
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
  ppl?: Petugas;
  pml?: Petugas;
}

export interface WilayahTugasSegmen {
  id: string;
  segmen_id: string;
  pml_id: string;
  ppl_id: string;
  created_at: string;
  ppl?: Petugas;
  pml?: Petugas;
}

export interface Petugas {
  id: string;
  username: string;
  name: string;
  role: "admin" | "pml" | "ppl" | "viewer";
  pml_id: string | null;
  created_at: string | null;
}

export interface UbinanData {
  id: string;
  nks_id: string | null;
  segmen_id: string | null;
  ppl_id: string;
  responden_name: string;
  sample_status: string;
  komoditas: string;
  tanggal_ubinan: string;
  berat_hasil: number;
  status: string;
  pml_id: string | null; // Make sure pml_id is properly defined here
  dokumen_diterima: boolean;
  komentar: string | null;
  created_at: string;
  updated_at: string;
  nks?: {
    id: string;
    code: string;
    desa_id?: string;
    target_padi?: number;
    target_palawija?: number;
    created_at?: string;
    desa?: {
      id: string;
      name: string;
      kecamatan?: {
        id: string;
        name: string;
      }
    }
  };
  segmen?: {
    id: string;
    code: string;
    desa_id?: string;
    target_padi?: number;
    created_at?: string;
    desa?: {
      id: string;
      name: string;
      kecamatan?: {
        id: string;
        name: string;
      }
    }
  };
  ppl?: Petugas | null | any; // Added any to handle potential error responses
  pml?: Petugas;
  ppl_name?: string; // Fallback for PPL name when direct access to ppl object isn't available
  desa_name?: string;
  kecamatan_name?: string;
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
  target_padi: number;
  target_palawija: number;
}

export interface AllocationStatus {
  type: "nks" | "segmen";
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

export interface DetailProgressData {
  month: number;
  padi_count: number;
  palawija_count: number;
  padi_target: number;
  palawija_target: number;
  padi_percentage: number;
  palawija_percentage: number;
}

export interface SubroundProgressData {
  subround: number;
  subround_name: string;
  padi_count: number;
  palawija_count: number;
  padi_target: number;
  palawija_target: number;
  padi_percentage: number;
  palawija_percentage: number;
}

export interface VerificationStatusCount {
  status: string;
  count: number;
}

export interface PalawijaTypeCount {
  komoditas: string;
  count: number;
}

export interface UbinanTotals {
  total_padi: number;
  total_palawija: number;
  padi_target: number;
  palawija_target: number;
  pending_verification: number;
}

export interface PetugasPerformance {
  ppl_id: string;
  ppl_name: string;
  ppl_username: string;
  padi_target: number;
  palawija_target: number;
  padi_completed: number;
  palawija_completed: number;
  total_target: number;
  total_completed: number;
  completion_percentage: number;
  pending_verification: number;
  rejected: number;
}
