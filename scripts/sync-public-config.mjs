import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
process.loadEnvFile && await readFile('.env.local').then(() => process.loadEnvFile('.env.local'), () => {});
const defaults = require('../lib/supabase-defaults.json');
const config = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || defaults.url,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaults.key,
};
const url = new URL(config.url);
if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
  throw new Error('Use a Supabase project origin for NEXT_PUBLIC_SUPABASE_URL.');
}
if (!config.key.startsWith('sb_publishable_') && !config.key.startsWith('eyJ')) throw new Error('Use a public Supabase key.');
if (config.key.startsWith('eyJ')) {
  const claims = JSON.parse(Buffer.from(config.key.split('.')[1], 'base64url').toString());
  if (claims.role !== 'anon') throw new Error('Only the anonymous Supabase JWT is public.');
}
await mkdir('public/assets', { recursive: true });
const serialized = JSON.stringify(config);
await Promise.all([
  writeFile('lib/public-config.json', serialized + '\n'),
  writeFile('public/assets/auth-config.js', 'window.MONSELA_AUTH = ' + serialized + ';\n'),
]);
