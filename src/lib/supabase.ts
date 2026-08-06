import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dckkzkjradchewjuodac.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRja2t6a2pyYWRjaGV3anVvZGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODU0NTMsImV4cCI6MjEwMTA2MTQ1M30.RYgJyHcf6p5U25tstXeL-507hBHOScXElHBzwdTl7wg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
