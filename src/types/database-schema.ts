
import { CustomTables } from "@/types/supabase-custom";

// Types from the Supabase database
export type UbinanData = CustomTables['ubinan_data']['Row'] & {
  desa_name?: string;
  kecamatan_name?: string;
  location_code?: string;
  ppl_name?: string;
  pml_name?: string;
  pml_id?: string;
  nks?: {
    id: string;
    code: string;
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
    desa?: {
      id: string;
      name: string;
      kecamatan?: {
        id: string;
        name: string;
      }
    }
  };
};

export type Petugas = {
  id: string;
  username: string;
  name: string;
  role: string;
  pml_id?: string;
  created_at?: string;
};

// Updated DetailProgressData type to match database structure
export type DetailProgressData = {
  month: number;
  padi_count: number;
  palawija_count: number;
  pending_verification: number;
  verified: number;
  rejected: number;
  padi_target: number;
  palawija_target: number;
  padi_percentage: number;
  palawija_percentage: number;
  // Legacy properties for backward compatibility
  totalPadi?: number;
  totalPalawija?: number;
  pendingVerification?: number;
  padiTarget?: number;
  palawijaTarget?: number;
};

export type SubroundProgressData = {
  subround: number;
  subround_name: string;
  padi_count: number;
  palawija_count: number;
  padi_target: number;
  palawija_target: number;
  padi_percentage: number;
  palawija_percentage: number;
};

export type VerificationStatusCount = {
  status: string;
  count: number;
};

export type PalawijaTypeCount = {
  komoditas: string;
  count: number;
};

export type UbinanTotals = {
  total_padi: number;
  total_palawija: number;
  padi_target: number;
  palawija_target: number;
  pending_verification: number;
};

export type PetugasPerformance = {
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
};

export type AllocationStatus = {
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
  padi_target?: number;
  palawija_target?: number;
  komoditas?: string[];
  pml_name?: string;
};

export type NKS = {
  id: string;
  code: string;
  desa_id: string;
  target_padi: number;
  target_palawija: number;
  created_at: string;
  subround?: number;
};

export type PPLActivitySummary = {
  ppl_id: string;
  ppl_name: string;
  pml_id: string;
  pml_name: string;
  month: number;
  total_count: number;
  padi_count: number;
  palawija_count: number;
  confirmed_count: number;
  pending_count: number;
  rejected_count: number;
};

export type PerformanceData = {
  id: string;
  name: string;
  role: string;
  pml?: {
    id: string;
    name: string;
  };
  totalPadi: number;
  totalPalawija: number;
  pendingVerification: number;
  verified: number;
  rejected: number;
  month?: number;
  createdAt: string;
};
