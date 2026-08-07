import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://geggxyegbwelmvhtxqbp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZ2d4eWVnYndlbG12aHR4cWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzk5ODAsImV4cCI6MjEwMTY1NTk4MH0.crkC4ze8mbA0tYirvs_68MtNDPqiiT4kyQeqO4Thu40';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
