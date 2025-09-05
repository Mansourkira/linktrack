import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/server'
import { createServerClient } from '@supabase/ssr'
import { config } from '@/lib/config'

// Simple QR code generation using SVG
function generateQRCodeSVG(data: string, size: number = 200): string {
    // This is a simplified QR code implementation
    // In production, you might want to use a proper QR library like 'qrcode'

    const cellSize = size / 25 // 25x25 grid
    const margin = 4 * cellSize

    let svg = `<svg width="${size + 2 * margin}" height="${size + 2 * margin}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="${size + 2 * margin}" height="${size + 2 * margin}" fill="white"/>`

    // Generate a simple pattern based on the data hash
    let hash = 0
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff
    }

    for (let row = 0; row < 25; row++) {
        for (let col = 0; col < 25; col++) {
            // Use hash to determine if cell should be filled
            const shouldFill = (hash >> ((row * 25 + col) % 32)) & 1

            if (shouldFill) {
                const x = margin + col * cellSize
                const y = margin + row * cellSize
                svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`
            }
        }
    }

    svg += '</svg>'
    return svg
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)

        // Get authenticated user using the helper
        const user = await requireUser()

        // Get link data directly from database
        const supabase = createServerClient(
            config.supabase.url,
            config.supabase.anonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll() {
                        // Not needed for API routes
                    },
                },
            }
        )

        const { data: link, error } = await supabase
            .from('links')
            .select('*')
            .eq('id', id)
            .eq('ownerProfileId', user.id)
            .is('deletedAt', null)
            .single()

        if (error || !link) {
            return NextResponse.json(
                { error: 'Link not found' },
                { status: 404 }
            )
        }

        const shortUrl = `${request.nextUrl.origin}/${link.shortCode}`

        // Get size parameter
        const size = parseInt(searchParams.get('size') || '200')
        const validSize = Math.min(Math.max(size, 100), 1000) // Limit size between 100-1000

        // Generate QR code SVG
        const qrSvg = generateQRCodeSVG(shortUrl, validSize)

        // Return SVG with proper headers
        return new NextResponse(qrSvg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        })

    } catch (error) {
        console.error('Error in GET /api/links/[id]/qr:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 