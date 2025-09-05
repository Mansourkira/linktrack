import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => req.cookies.get(name)?.value,
                set: (name, value, options) => { res.cookies.set({ name, value, ...options }); },
                remove: (name, options) => { res.cookies.set({ name, value: '', ...options, maxAge: 0 }); },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    const path = req.nextUrl.pathname;

    const isAuthPage = path.startsWith('/auth');
    const isProtected = path.startsWith('/dashboard') || path.startsWith('/links');

    if (!user && isProtected) {
        const url = new URL('/auth', req.url);
        return NextResponse.redirect(url);
    }
    if (user && isAuthPage) {
        const url = new URL('/dashboard', req.url);
        return NextResponse.redirect(url);
    }
    return res;
}

export const config = {
    matcher: ['/auth/:path*', '/dashboard/:path*', '/links/:path*'],
};
