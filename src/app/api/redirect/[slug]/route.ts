import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

// Edge runtime for ultra-fast responses
export const runtime = 'edge'


export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const slug = params.slug
    const host = request.headers.get('host') || ''

    try {
        const supabase = createSupabaseBrowserClient()

        // Check if this is a custom domain or primary domain
        let domainId: string | null = null

        // First, check if host matches a custom domain
        if (host !== 'linktrack.app' && host !== 'localhost:3000') {
            const { data: domain } = await supabase
                .from('domains')
                .select('id')
                .eq('domain', host)
                .single()

            if (domain) {
                domainId = domain.id
            }
        }

        // Look up the link by slug and domain using correct column names
        const { data: link, error } = await supabase
            .from('links')
            .select('*')
            .eq('shortCode', slug)  // Using camelCase as per your database
            //   .eq('domainId', domainId)
            .eq('isActive', true)   // Using camelCase as per your database
            .single()

        if (error || !link) {
            // Try fallback to primary domain (domainId IS NULL)
            if (domainId !== null) {
                const { data: fallbackLink } = await supabase
                    .from('links')
                    .select('*')
                    .eq('shortCode', slug)  // Using camelCase as per your database
                    // .is('domainId', null)
                    .eq('isActive', true)   // Using camelCase as per your database
                    .single()

                if (fallbackLink) {
                    return await processLink(fallbackLink, request)
                }
            }

            // Link not found
            return NextResponse.redirect(new URL('/404', request.url))
        }

        // Check if link is expired
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
            return NextResponse.redirect(new URL('/expired', request.url))
        }

        // Check if max clicks reached
        if (link.maxClicks && link.clickCount >= link.maxClicks) {
            return NextResponse.redirect(new URL('/expired', request.url))
        }

        // If password protected, redirect to verification page
        if (link.isPasswordProtected) {
            const verifyUrl = new URL(`/verify/${slug}`, request.url)
            verifyUrl.searchParams.set('domain', host)
            return NextResponse.redirect(verifyUrl)
        }

        // Process the link (increment clicks and redirect)
        return await processLink(link, request)

    } catch (error) {
        console.error('Error processing redirect:', error)
        return NextResponse.redirect(new URL('/404', request.url))
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const slug = params.slug
    const host = request.headers.get('host') || ''

    try {
        const supabase = createSupabaseBrowserClient()

        const formData = await request.formData()
        const password = formData.get('password') as string
        const domain = formData.get('domain') as string

        // Look up the link
        let domainId: string | null = null

        if (domain && domain !== 'linktrack.app' && domain !== 'localhost:3000') {
            const { data: domainRecord } = await supabase
                .from('domains')
                .select('id')
                .eq('domain', domain)
                .single()

            if (domainRecord) {
                domainId = domainRecord.id
            }
        }

        const { data: link, error } = await supabase
            .from('links')
            .select('*')
            .eq('shortCode', slug)  // Using camelCase as per your database
            // .eq('domainId', domainId)
            .eq('isActive', true)   // Using camelCase as per your database
            .single()

        if (error || !link) {
            return NextResponse.redirect(new URL('/404', request.url))
        }

        // Check if link is expired
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
            return NextResponse.redirect(new URL('/expired', request.url))
        }

        // Check if max clicks reached
        if (link.maxClicks && link.clickCount >= link.maxClicks) {
            return NextResponse.redirect(new URL('/expired', request.url))
        }

        // Verify password
        if (link.isPasswordProtected && link.password !== password) {
            // Password incorrect, redirect back to verification with error
            const verifyUrl = new URL(`/verify/${slug}`, request.url)
            verifyUrl.searchParams.set('domain', domain)
            verifyUrl.searchParams.set('error', 'invalid_password')
            return NextResponse.redirect(verifyUrl)
        }

        // Password correct or not required, process the link
        return await processLink(link, request)

    } catch (error) {
        console.error('Error processing password verification:', error)
        return NextResponse.redirect(new URL('/404', request.url))
    }
}

async function processLink(link: any, request: NextRequest) {
    try {
        const supabase = createSupabaseBrowserClient()

        // Atomically increment click count using RPC
        const { error: incrementError } = await supabase.rpc('increment_link_clicks', {
            link_id: link.id
        })

        if (incrementError) {
            console.error('Error incrementing clicks:', incrementError)
            // Continue with redirect even if click tracking fails
        }

        // Redirect to target URL using correct column name
        return NextResponse.redirect(link.originalUrl, 302)  // Using camelCase as per your database

    } catch (error) {
        console.error('Error processing link:', error)
        return NextResponse.redirect(new URL('/404', request.url))
    }
}
