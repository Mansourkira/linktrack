import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createLinkSchema } from '@/lib/schemas/link'
import { hashPassword, validatePassword } from '@/lib/utils/password'

export async function GET(request: NextRequest) {
    try {
        console.log('=== API Route Debug ===')

        // Get authenticated user using new server-side utility
        const user = await requireUser()
        console.log('user', user)
        console.log('user.id:', user.id)

        const { searchParams } = new URL(request.url)

        const filters = {
            search: searchParams.get('search') || undefined,
            isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
            isPasswordProtected: searchParams.get('isPasswordProtected') ? searchParams.get('isPasswordProtected') === 'true' : undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
            sortBy: searchParams.get('sortBy') as 'createdAt' | 'clickCount' | 'shortCode' || 'createdAt',
            sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
        }

        // Build query using new server client
        const supabase = await createSupabaseServerClient()

        console.log('Building query with user ID:', user.id)
        console.log('User ID type:', typeof user.id)
        console.log('User ID valid UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id))

        let query = supabase
            .from('links')
            .select('*', { count: 'exact' })
            .eq('ownerProfileId', user.id)
            .is('deletedAt', null)

        // Apply filters
        if (filters.search) {
            query = query.or(`shortCode.ilike.%${filters.search}%,originalUrl.ilike.%${filters.search}%`)
        }

        if (filters.isActive !== undefined) {
            query = query.eq('isActive', filters.isActive)
        }

        if (filters.isPasswordProtected !== undefined) {
            query = query.eq('isPasswordProtected', filters.isPasswordProtected)
        }

        // Apply sorting - use correct column names from your database
        let sortColumn: string
        if (filters.sortBy === 'createdAt') {
            sortColumn = 'createdAt'  // Your database uses camelCase
        } else if (filters.sortBy === 'clickCount') {
            sortColumn = 'clickCount'  // Your database uses camelCase
        } else {
            sortColumn = 'shortCode'  // Your database uses camelCase
        }

        query = query.order(sortColumn, { ascending: filters.sortOrder === 'asc' })

        // Apply pagination
        const offset = (filters.page - 1) * filters.limit
        query = query.range(offset, offset + filters.limit - 1)

        const { data: links, error, count } = await query

        if (error) {
            console.error('Database error in GET /api/links:', error)
            return NextResponse.json(
                { error: `Failed to fetch links: ${error.message}` },
                { status: 500 }
            )
        }

        const total = count || 0
        const totalPages = Math.ceil(total / filters.limit)

        console.log('GET /api/links result:', {
            linksCount: links?.length || 0,
            total,
            userId: user.id
        })

        return NextResponse.json({
            links: links || [],
            total,
            page: filters.page,
            limit: filters.limit,
            totalPages,
        })

    } catch (error) {
        console.error('Error in GET /api/links:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user using new server-side utility
        const user = await requireUser()

        const body = await request.json()
        console.log('Link creation request body:', body)

        // Validate input
        const validatedInput = createLinkSchema.parse(body)
        console.log('Validated input:', validatedInput)

        // Validate password if password protection is enabled
        if (validatedInput.isPasswordProtected) {
            console.log('Password protection enabled, validating password...')
            console.log('Password provided:', !!validatedInput.password)
            console.log('Password value:', validatedInput.password ? '[REDACTED]' : 'undefined')

            if (!validatedInput.password) {
                console.log('Error: Password is required but not provided')
                return NextResponse.json(
                    { error: 'Password is required when password protection is enabled' },
                    { status: 400 }
                )
            }

            const passwordValidation = validatePassword(validatedInput.password)
            if (!passwordValidation.isValid) {
                console.log('Password validation failed:', passwordValidation.message)
                return NextResponse.json(
                    { error: passwordValidation.message },
                    { status: 400 }
                )
            }
            console.log('Password validation passed')
        }

        // Check if shortCode is unique
        const supabase = await createSupabaseServerClient()

        console.log('Checking short code uniqueness for:', validatedInput.shortCode)
        const { data: existingLink, error: checkError } = await supabase
            .from('links')
            .select('id')
            .eq('shortCode', validatedInput.shortCode)
            .is('deletedAt', null)
            .maybeSingle()

        console.log('Short code check result:', { existingLink, checkError })

        if (checkError) {
            console.error('Error checking short code uniqueness:', checkError)
            return NextResponse.json(
                { error: 'Failed to validate short code' },
                { status: 500 }
            )
        }

        if (existingLink) {
            console.log('Short code already exists, returning error')
            return NextResponse.json(
                { error: 'Short code already exists. Please choose a different one.' },
                { status: 400 }
            )
        }

        // Create the link
        console.log('Creating link with data:', {
            shortCode: validatedInput.shortCode,
            originalUrl: validatedInput.originalUrl,
            isPasswordProtected: validatedInput.isPasswordProtected,
            isActive: validatedInput.isActive,
            ownerProfileId: user.id
        })

        const { data: link, error } = await supabase
            .from('links')
            .insert({
                shortCode: validatedInput.shortCode,
                originalUrl: validatedInput.originalUrl,
                isPasswordProtected: validatedInput.isPasswordProtected,
                isActive: validatedInput.isActive,
                ownerProfileId: user.id,
                clickCount: 0,
                createdAt: new Date().toISOString(),
            })
            .select()
            .single()

        if (error) {
            console.error('Database error in POST /api/links:', error)

            // Handle specific database errors
            if (error.code === '23505' && error.constraint === 'links_shortcode_unique') {
                console.log('Duplicate short code detected by database constraint')
                return NextResponse.json(
                    { error: 'Short code already exists. Please choose a different one.' },
                    { status: 400 }
                )
            }

            return NextResponse.json(
                { error: `Failed to create link: ${error.message}` },
                { status: 500 }
            )
        }

        console.log('Link created successfully:', link.id)

        // If password protection is enabled, store the hashed password
        if (validatedInput.isPasswordProtected && validatedInput.password) {
            console.log('Storing password hash for link:', link.id)
            const passwordHash = await hashPassword(validatedInput.password)
            console.log('Password hash generated successfully')

            const { data: passwordData, error: passwordError } = await supabase
                .from('link_passwords')
                .insert({
                    link_id: link.id,
                    password_hash: passwordHash,
                    is_active: true,
                    created_at: new Date().toISOString(),
                })
                .select()

            if (passwordError) {
                console.error('Error storing password hash:', passwordError)
                console.error('Password error details:', {
                    code: passwordError.code,
                    message: passwordError.message,
                    details: passwordError.details,
                    hint: passwordError.hint
                })
                // Clean up the link if password storage fails
                await supabase.from('links').delete().eq('id', link.id)
                return NextResponse.json(
                    { error: 'Failed to store password' },
                    { status: 500 }
                )
            }
            console.log('Password hash stored successfully:', passwordData)
        }

        console.log('POST /api/links success:', { linkId: link.id, userId: user.id })
        return NextResponse.json(link, { status: 201 })

    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation error', details: error.message },
                { status: 400 }
            )
        }

        console.error('Error in POST /api/links:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 