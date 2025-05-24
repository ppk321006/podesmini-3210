
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://nxahrnpuooxbafyqixpa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54YWhybnB1b294YmFmeXFpeHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjUzNTUsImV4cCI6MjA2MzY0MTM1NX0.gP5HSbovIDgSE5HRsWBj7hEAqJtEDxEPrSuzAY7Pzwc";

// Export a typed Supabase client
export const supabaseClient = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage
    }
  }
);
