'use client';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

export function useLogout() {
    const router = useRouter();
    return async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.replace('/auth');
    };
}
