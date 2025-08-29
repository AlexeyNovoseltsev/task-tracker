import 'dotenv/config';
import { supabaseAdmin } from '@/config/supabase';

async function main() {
  const email = process.env.SEED_USER_EMAIL || 'demo@taskflow.pro';
  const name = process.env.SEED_USER_NAME || 'Demo User';
  const role = (process.env.SEED_USER_ROLE as 'admin' | 'user' | 'viewer') || 'admin';

  // Проверяем, существует ли пользователь
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (checkError) {
    console.error('Failed to check user existence:', checkError);
    process.exit(1);
  }

  if (existing) {
    console.log(`User already exists: ${existing.email} (id: ${existing.id})`);
    return;
  }

  const { data: created, error } = await supabaseAdmin
    .from('users')
    .insert({
      email,
      name,
      role,
      last_active_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create user:', error);
    process.exit(1);
  }

  console.log('Seed user created:', created);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


