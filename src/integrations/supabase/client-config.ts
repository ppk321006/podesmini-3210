
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase-db';

const SUPABASE_URL = "https://nqrqpzynzxknnmvihptw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcnFwenluenhrbm5tdmlocHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjM4NTYsImV4cCI6MjA1OTU5OTg1Nn0.GzLbNKvXG_3CgUkdbHDS9vE7mslderFg0CWmRSK6Uds";

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
