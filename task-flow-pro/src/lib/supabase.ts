import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholderUrl = (url?: string) => {
  if (!url) return true;
  const lowercase = url.toLowerCase();
  return lowercase.includes('your_project_id') || lowercase.includes('your-project-id') || lowercase.includes('your_project');
};

const isPlaceholderKey = (key?: string) => {
  if (!key) return true;
  const lowercase = key.toLowerCase();
  return lowercase.includes('your_supabase_anon_key') || lowercase.includes('your-anon-key');
};

if (!supabaseUrl || !supabaseKey || isPlaceholderUrl(supabaseUrl) || isPlaceholderKey(supabaseKey)) {
  console.warn('⚠️ Supabase credentials are missing or placeholders. Falling back to demo mode.');
}

export const supabase = createClient(
  (!isPlaceholderUrl(supabaseUrl) && supabaseUrl) || 'https://demo.supabase.co',
  (!isPlaceholderKey(supabaseKey) && supabaseKey) || 'demo-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseKey) return false;
  if (isPlaceholderUrl(supabaseUrl) || isPlaceholderKey(supabaseKey)) return false;
  const validUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl);
  const validKey = typeof supabaseKey === 'string' && supabaseKey.length > 20;
  return validUrl && validKey;
}
