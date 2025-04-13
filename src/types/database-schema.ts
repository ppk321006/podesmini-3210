
import { Database } from "@/integrations/supabase/types";

export type UbinanData = Database['public']['Tables']['ubinan_data']['Row'] & {
  desa_name?: string;
  kecamatan_name?: string;
  location_code?: string;
  ppl_name?: string;
  pml_name?: string;
};

export type Petugas = {
  id: string;
  username: string;
  name: string;
  role: string;
  pml_id?: string;
  created_at?: string;
};
