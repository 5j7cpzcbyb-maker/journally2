import { createClient } from '@supabase/supabase-js';

// These lines tell the app to look at your Vercel/Supabase settings
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
