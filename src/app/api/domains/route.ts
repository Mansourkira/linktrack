import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch domains directly by user
        // When workspaces are implemented, user_id will be changed to workspace_id
        const { data: domains, error } = await supabase
            .from('domains')
            .select('id, domain, status, verified_at, created_at, user_id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching domains:', error)
            return NextResponse.json(
                { error: 'Failed to fetch domains' },
                { status: 500 }
            )
        }

        return NextResponse.json({ domains })
    } catch (error) {
        console.error('Error in GET /api/domains:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { domain } = body

        if (!domain) {
            return NextResponse.json(
                { error: 'Domain is required' },
                { status: 400 }
            )
        }

        // Validate domain format
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        if (!domainRegex.test(domain)) {
            return NextResponse.json(
                { error: 'Invalid domain format' },
                { status: 400 }
            )
        }

        // Check if domain already exists
        const { data: existingDomain } = await supabase
            .from('domains')
            .select('id')
            .eq('domain', domain)
            .single()

        if (existingDomain) {
            return NextResponse.json(
                { error: 'Domain already exists' },
                { status: 409 }
            )
        }

        // Create the domain
        const { data: newDomain, error: createError } = await supabase
            .from('domains')
            .insert({
                user_id: user.id,
                domain,
                status: 'unverified'
            })
            .select()
            .single()

        if (createError) {
            console.error('Error creating domain:', createError)
            return NextResponse.json(
                { error: 'Failed to create domain' },
                { status: 500 }
            )
        }

        return NextResponse.json({ domain: newDomain }, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/domains:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

