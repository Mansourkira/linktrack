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

    const path = req.nextUrl.pathname;
    const host = req.headers.get('host') || '';

    // Handle custom domain routing
    // If it's not the main app domain, check if it's a custom domain
    const isMainDomain = host.includes('linktrack.app') ||
        host.includes('localhost') ||
        host.includes('vercel.app');

    if (!isMainDomain && !path.startsWith('/api') && !path.startsWith('/_next')) {
        // This is a custom domain request
        // Check if the domain is verified
        const { data: domain } = await supabase
            .from('domains')
            .select('id, status')
            .eq('domain', host)
            .single();

        if (domain && domain.status === 'verified') {
            // Custom domain is verified, allow the request to proceed
            // The [slug]/page.tsx will handle the link resolution
            return res;
        } else if (domain && domain.status !== 'verified') {
            // Domain exists but not verified
            return new NextResponse(
                `<html><body><h1>Domain Not Verified</h1><p>This domain has not been verified yet. Please verify your DNS settings.</p></body></html>`,
                {
                    status: 403,
                    headers: { 'content-type': 'text/html' },
                }
            );
        } else {
            // Unknown domain
            return new NextResponse(
                `<html><body><h1>Domain Not Found</h1><p>This domain is not registered with our service.</p></body></html>`,
                {
                    status: 404,
                    headers: { 'content-type': 'text/html' },
                }
            );
        }
    }

    // Regular auth middleware for main domain
    const { data: { user } } = await supabase.auth.getUser();

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
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};
