import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createLinkSchema } from '@/lib/schemas/link'

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

        // Validate input
        const validatedInput = createLinkSchema.parse(body)

        // Check if shortCode is unique
        const supabase = await createSupabaseServerClient()

        const { data: existingLink, error: checkError } = await supabase
            .from('links')
            .select('id')
            .eq('shortCode', validatedInput.shortCode)
            .is('deletedAt', null)
            .single()

        if (existingLink) {
            return NextResponse.json(
                { error: 'Short code already exists' },
                { status: 400 }
            )
        }

        // Create the link
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
            return NextResponse.json(
                { error: `Failed to create link: ${error.message}` },
                { status: 500 }
            )
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