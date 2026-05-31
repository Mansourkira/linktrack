import { config } from "@/lib/config";

export type SupabasePublicEnv = {
  url: string;
  key: string;
};

declare global {
  interface Window {
    __LINKTRACK_SUPABASE__?: SupabasePublicEnv;
  }
}

function readProcessEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    return { url, key };
  }

  return null;
}

function readConfigFallback(): SupabasePublicEnv | null {
  const { url, anonKey } = config.supabase;

  if (url && anonKey) {
    return { url, key: anonKey };
  }

  return null;
}

/** Resolves Supabase URL + anon key for browser and server. */
export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  if (typeof window !== "undefined" && window.__LINKTRACK_SUPABASE__) {
    return window.__LINKTRACK_SUPABASE__;
  }

  return readProcessEnv() ?? readConfigFallback();
}

export function hasSupabaseConfig(): boolean {
  return getSupabasePublicEnv() !== null;
}
