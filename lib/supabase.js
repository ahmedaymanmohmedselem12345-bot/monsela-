import core from '@/public/assets/store-core';
import { createClient } from '@supabase/supabase-js';
import config from './public-config.json';

let client;
export function storeClient() {
  client ??= createClient(config.url, config.key, { global: { fetch: core.fetchTimed } });
  return client;
}
