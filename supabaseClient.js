// This file tells your app WHERE your database is located.
import { createClient } from '@supabase/supabase-api-js';

// Replace these two lines with the actual keys from your Supabase dashboard
const supabaseUrl = 'https://wnxpybhtdfiqgnmxpnkr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueHB5Ymh0ZGZpcWdubXhwbmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTg1NDgsImV4cCI6MjA4NjMzNDU0OH0.ubGTzI1Q6xfHI49nENjGIf8uDFvgA-qVxGz168IH_t8';

export const supabase = createClient(supabaseUrl, supabaseKey);
