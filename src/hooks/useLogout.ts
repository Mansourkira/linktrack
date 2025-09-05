'use client';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

export function useLogout() {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();
    return async () => {
        await supabase.auth.signOut();
        router.replace('/auth');
    };
}
