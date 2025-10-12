import { NextResponse } from 'next/server'

export async function GET() {
    // Replace with your actual AdSense publisher ID
    const adsContent = `google.com, pub-2878731516544158, DIRECT, f08c47fec0942fa0`

    return new NextResponse(adsContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=3600',
        },
    })
}

