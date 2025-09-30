import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/utils/password'

// Edge runtime for ultra-fast responses
// Note: Edge runtime doesn't support bcrypt, so we'll use Node.js runtime for password verification
// export const runtime = 'edge'


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const host = request.headers.get('host') || ''

    try {
        const supabase = await createSupabaseServerClient()

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

        // If password protected, return JSON response indicating password is required
        if (link.isPasswordProtected) {
            return NextResponse.json({
                error: 'password_required',
                message: 'This link is password protected',
                slug: slug
            }, { status: 401 })
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
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const host = request.headers.get('host') || ''
    console.log('POST /api/redirect/' + slug + ' - Password verification request')
    console.log('Host:', host)
    try {
        const supabase = await createSupabaseServerClient()

        const formData = await request.formData()
        const password = formData.get('password') as string
        const domain = formData.get('domain') as string

        console.log('POST /api/redirect/' + slug + ' - Password verification request')
        console.log('Domain:', domain)
        console.log('Password provided:', !!password)

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

        console.log('Link lookup result:', { link: !!link, error })

        if (error || !link) {
            console.error('Link not found or error:', error)
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

        // Verify password if password protected
        if (link.isPasswordProtected) {
            console.log('Link is password protected, verifying password...')
            if (!password) {
                console.log('No password provided')
                // No password provided, return JSON error
                return NextResponse.json({
                    error: 'Password is required'
                }, { status: 400 })
            }

            // Get the password hash from link_passwords table
            console.log('Looking up password hash for link ID:', link.id)
            console.log('Link ID type:', typeof link.id)
            console.log('Link ID valid UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(link.id))

            // First, let's check if any password records exist for this link
            const { data: allPasswords, error: allPasswordsError } = await supabase
                .from('link_passwords')
                .select('*')
                .eq('link_id', link.id)

            console.log('All password records for link:', { allPasswords, allPasswordsError })

            const { data: passwordData, error: passwordError } = await supabase
                .from('link_passwords')
                .select('password_hash')
                .eq('link_id', link.id)
                .eq('is_active', true)
                .single()

            console.log('Password hash lookup result:', { passwordData: !!passwordData, error: passwordError })

            if (passwordError || !passwordData) {
                console.error('Error fetching password hash:', passwordError)
                return NextResponse.json({
                    error: 'Password verification failed. Please try again.'
                }, { status: 500 })
            }

            // Verify the password using bcrypt
            console.log('Verifying password with bcrypt...')
            const isValidPassword = await verifyPassword(password, passwordData.password_hash)
            console.log('Password verification result:', isValidPassword)

            if (!isValidPassword) {
                console.log('Password verification failed')
                // Password incorrect, return JSON error
                return NextResponse.json({
                    error: 'Invalid password. Please try again.'
                }, { status: 401 })
            }

            console.log('Password verification successful!')
        }

        // Password correct or not required, process the link
        console.log('Password verification successful, processing link...')
        return await processLink(link, request)

    } catch (error) {
        console.error('Error processing password verification:', error)
        return NextResponse.redirect(new URL('/404', request.url))
    }
}

async function processLink(link: any, request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        // Increment click count using regular update
        const { error: incrementError } = await supabase
            .from('links')
            .update({ clickCount: link.clickCount + 1 })
            .eq('id', link.id)

        if (incrementError) {
            console.error('Error incrementing clicks:', incrementError)
            // Continue with redirect even if click tracking fails
        }

        // Return the target URL as JSON instead of redirecting
        console.log('Password correct, returning target URL:', link.originalUrl)
        return NextResponse.json({
            success: true,
            redirectUrl: link.originalUrl
        })

    } catch (error) {
        console.error('Error processing link:', error)
        return NextResponse.redirect(new URL('/404', request.url))
    }
}
