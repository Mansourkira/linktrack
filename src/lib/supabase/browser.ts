import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublicEnv, hasSupabaseConfig } from './env';

export { hasSupabaseConfig };

export function createSupabaseBrowserClient() {
    const env = getSupabasePublicEnv();

    if (!env) {
        throw new Error(
            '@supabase/ssr: Your project\'s URL and API key are required to create a Supabase client!'
        );
    }

    return createBrowserClient(env.url, env.key);
}
