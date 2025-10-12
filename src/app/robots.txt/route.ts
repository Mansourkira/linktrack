import { NextResponse } from 'next/server'

export async function GET() {
    const robotsContent = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/

User-agent: Mediapartners-Google
Allow: /

Sitemap: https://www.linktrack.app/sitemap.xml`

    return new NextResponse(robotsContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=3600',
        },
    })
}

