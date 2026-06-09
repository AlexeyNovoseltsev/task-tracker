import 'dotenv/config';
import bcrypt from 'bcryptjs';

import { supabaseAdmin } from '@/config/supabase';

const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD || 'Tfp!Demo2026#Xk9';

type GlobalRole = 'admin' | 'user' | 'viewer';
type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer';

interface SeedUser {
  email: string;
  name: string;
  role: GlobalRole;
  projects?: Array<{ key: string; role: ProjectRole }>;
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'maria@taskflow.pro',
    name: 'Мария Иванова',
    role: 'user',
    projects: [
      { key: 'DEMO', role: 'member' },
      { key: 'TST', role: 'member' },
    ],
  },
  {
    email: 'sergey@taskflow.pro',
    name: 'Сергей Смирнов',
    role: 'user',
    projects: [{ key: 'DEMO', role: 'admin' }],
  },
  {
    email: 'elena@taskflow.pro',
    name: 'Елена Кузнецова',
    role: 'viewer',
    projects: [{ key: 'DEMO', role: 'viewer' }],
  },
  {
    email: 'dmitry@taskflow.pro',
    name: 'Дмитрий Волков',
    role: 'user',
    projects: [{ key: 'TST', role: 'admin' }],
  },
  {
    email: 'anna@taskflow.pro',
    name: 'Анна Соколова',
    role: 'admin',
    projects: [{ key: 'TST', role: 'owner' }],
  },
];

async function upsertUser(user: SeedUser, passwordHash: string): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', user.email)
    .maybeSingle();

  let userId = existing?.id;

  if (!userId) {
    const { data: created, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: user.email,
        name: user.name,
        role: user.role,
        email_verified: true,
        is_active: true,
        last_active_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error || !created) {
      throw new Error(`Failed to create ${user.email}: ${error?.message}`);
    }
    userId = created.id;
    console.log(`  + created ${user.email} (${user.role})`);
  } else {
    await supabaseAdmin
      .from('users')
      .update({ name: user.name, role: user.role, is_active: true })
      .eq('id', userId);
    console.log(`  ~ updated ${user.email} (${user.role})`);
  }

  const { error: credError } = await supabaseAdmin
    .from('user_credentials')
    .upsert({
      user_id: userId,
      password_hash: passwordHash,
      password_changed_at: new Date().toISOString(),
    });

  if (credError) {
    throw new Error(`Credentials failed for ${user.email}: ${credError.message}`);
  }

  await supabaseAdmin
    .from('user_settings')
    .upsert({ user_id: userId }, { onConflict: 'user_id' });

  return userId;
}

async function main() {
  const { data: projects, error: projectsError } = await supabaseAdmin
    .from('projects')
    .select('id, key');

  if (projectsError || !projects) {
    throw new Error(`Failed to load projects: ${projectsError?.message}`);
  }

  const projectByKey = new Map(projects.map((p) => [p.key, p.id]));
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const { data: adminUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', 'admin@taskflow.pro')
    .maybeSingle();

  console.log('Seeding users...\n');

  for (const user of SEED_USERS) {
    const userId = await upsertUser(user, passwordHash);

    for (const membership of user.projects || []) {
      const projectId = projectByKey.get(membership.key);
      if (!projectId) {
        console.warn(`  ! project ${membership.key} not found, skip membership for ${user.email}`);
        continue;
      }

      const { error } = await supabaseAdmin
        .from('project_members')
        .upsert(
          {
            project_id: projectId,
            user_id: userId,
            role: membership.role,
            invited_by: adminUser?.id ?? userId,
          },
          { onConflict: 'project_id,user_id' }
        );

      if (error) {
        console.warn(`  ! membership ${user.email}@${membership.key}: ${error.message}`);
      } else {
        console.log(`    → ${membership.key} as ${membership.role}`);
      }
    }
  }

  console.log('\nГотово. Пароль для всех новых пользователей:', DEFAULT_PASSWORD);
  console.log('\n| Email | Роль |');
  console.log('|-------|------|');
  for (const u of SEED_USERS) {
    console.log(`| ${u.email} | ${u.role} |`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
