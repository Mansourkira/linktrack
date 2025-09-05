'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type AuthCtx = { user: User | null; session: Session | null; loading: boolean; };
const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return;
            setSession(data.session ?? null);
            setUser(data.session?.user ?? null);
            setLoading(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
            setSession(s);
            setUser(s?.user ?? null);
        });
        return () => { mounted = false; sub.subscription.unsubscribe(); };
    }, [supabase]);

    return <Ctx.Provider value={{ user, session, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
