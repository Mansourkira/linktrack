import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getServerUser() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return { user: null, error: error ?? new Error('No user') };
    return { user: data.user, error: null };
}

export async function requireUser() {
    const { user, error } = await getServerUser();
    if (error || !user) throw new Error('UNAUTHORIZED');
    return user;
}
