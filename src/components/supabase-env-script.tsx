import { getSupabasePublicEnv } from "@/lib/supabase/env";

/** Injects public Supabase config for client bundles (Cloudflare runtime vars). */
export function SupabaseEnvScript() {
  const env = getSupabasePublicEnv();

  if (!env) {
    return null;
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__LINKTRACK_SUPABASE__=${JSON.stringify(env)};`,
      }}
    />
  );
}
