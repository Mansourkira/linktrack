import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabasePublicEnv } from '@/lib/supabase/env';

function isProtectedPath(path: string) {
  return path.startsWith('/dashboard') || path.startsWith('/links');
}

function isAuthPath(path: string) {
  return path.startsWith('/auth');
}

function isMainAppHost(host: string) {
  return (
    host.includes('linktrack.app') ||
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('vercel.app') ||
    host.endsWith('.workers.dev')
  );
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const host = req.headers.get('host') || '';

  try {
    const supabaseEnv = getSupabasePublicEnv();

    if (!supabaseEnv) {
      if (isProtectedPath(path)) {
        return NextResponse.redirect(new URL('/auth', req.url));
      }
      return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({ request: req });

    const supabase = createServerClient(
      supabaseEnv.url,
      supabaseEnv.key,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              req.cookies.set(name, value);
            });
            supabaseResponse = NextResponse.next({ request: req });
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    if (!isMainAppHost(host) && !path.startsWith('/api') && !path.startsWith('/_next')) {
      const { data: domain } = await supabase
        .from('domains')
        .select('id, status')
        .eq('domain', host)
        .single();

      if (domain && domain.status === 'verified') {
        return supabaseResponse;
      }

      if (domain && domain.status !== 'verified') {
        return new NextResponse(
          '<html><body><h1>Domain Not Verified</h1><p>This domain has not been verified yet. Please verify your DNS settings.</p></body></html>',
          {
            status: 403,
            headers: { 'content-type': 'text/html' },
          }
        );
      }

      return new NextResponse(
        '<html><body><h1>Domain Not Found</h1><p>This domain is not registered with our service.</p></body></html>',
        {
          status: 404,
          headers: { 'content-type': 'text/html' },
        }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && isProtectedPath(path)) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    if (user && isAuthPath(path)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return supabaseResponse;
  } catch (error) {
    console.error('Middleware error:', error);

    if (isProtectedPath(path)) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
