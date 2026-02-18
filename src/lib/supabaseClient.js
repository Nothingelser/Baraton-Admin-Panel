import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'SUPABASE_KEY_REMOVED';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
