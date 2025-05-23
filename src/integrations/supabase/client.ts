
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { ExtendedDatabase } from '@/types/supabase-custom';

const SUPABASE_URL = "https://apdmbwlzicaxtfyusgwh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZG1id2x6aWNheHRmeXVzZ3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1MDksImV4cCI6MjA2MzYxNTUwOX0.U1uOV8dXpvXLOBA9xWiFPHYqziiMcz1V_xqxbLRZjk8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create a Supabase client with the proper types
export const supabase = createClient<ExtendedDatabase>(
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
