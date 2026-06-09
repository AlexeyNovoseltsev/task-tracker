import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const schemaPath = resolve(__dirname, 'schema.sql');

console.log('TaskFlow DB schema file:', schemaPath);
console.log('');
console.log('Схема применяется через:');
console.log('  1) Supabase MCP: apply_migration');
console.log('  2) Supabase Dashboard → SQL Editor → вставить schema.sql');
console.log('');
console.log('После миграции: npm run db:seed-admin');

const sql = readFileSync(schemaPath, 'utf8');
console.log(`\nSchema size: ${sql.length} chars, ${sql.split('\n').length} lines`);
