
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { ExtendedDatabase } from '@/types/supabase-custom';

const SUPABASE_URL = "https://apdmbwlzicaxtfyusgwh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZG1id2x6aWNheHRmeXVzZ3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1MDksImV4cCI6MjA2MzYxNTUwOX0.U1uOV8dXpvXLOBA9xWiFPHYqziiMcz1V_xqxbLRZjk8";

// Export a typed Supabase client
export const supabaseClient = createClient<ExtendedDatabase>(
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
