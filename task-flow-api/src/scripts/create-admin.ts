import 'dotenv/config';
import bcrypt from 'bcryptjs';

import { supabaseAdmin } from '@/config/supabase';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@taskflow.pro';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Tfp!Admin2026#Xk9';

async function main() {
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('email', ADMIN_EMAIL)
    .maybeSingle();

  let userId = existing?.id;

  if (!userId) {
    const { data: created, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: 'admin',
        email_verified: true,
        last_active_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error || !created) {
      console.error('Failed to create admin user:', error);
      process.exit(1);
    }
    userId = created.id;
    console.log('Created admin user:', ADMIN_EMAIL);
  } else {
    await supabaseAdmin.from('users').update({ role: 'admin', name: ADMIN_NAME }).eq('id', userId);
    console.log('Admin user already exists, updated role:', ADMIN_EMAIL);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const { error: credError } = await supabaseAdmin
    .from('user_credentials')
    .upsert({
      user_id: userId,
      password_hash: passwordHash,
      password_changed_at: new Date().toISOString(),
    });

  if (credError) {
    console.error('Failed to save credentials:', credError);
    process.exit(1);
  }

  await supabaseAdmin
    .from('user_settings')
    .upsert({ user_id: userId }, { onConflict: 'user_id' });

  console.log('\nAdmin ready:');
  console.log('  Email:   ', ADMIN_EMAIL);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('  User ID: ', userId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
