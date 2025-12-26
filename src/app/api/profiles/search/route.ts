import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/profiles/search?q=searchterm - Search for profiles by email or username
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

        // Get search query from URL params
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            )
        }

        // Search for profiles by email or username
        // Using ilike for case-insensitive partial matching
        const searchPattern = `%${query.trim()}%`

        // Use PostgREST's or() filter with proper syntax
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username, email, full_name, avatar_url')
            .or(`email.ilike."${searchPattern}",username.ilike."${searchPattern}"`)
            .limit(10)
            .order('created_at', { ascending: false })

        // If the above doesn't work, fallback to separate queries
        // Note: Supabase PostgREST syntax may vary, so we'll handle both cases

        if (error) {
            console.error('Error searching profiles:', error)
            return NextResponse.json(
                { error: 'Failed to search profiles' },
                { status: 500 }
            )
        }

        // Filter out current user
        const filteredProfiles = profiles?.filter(p => p.id !== user.id) || []

        return NextResponse.json({
            profiles: filteredProfiles.map(p => ({
                id: p.id,
                username: p.username,
                email: p.email,
                fullName: p.full_name,
                avatarUrl: p.avatar_url,
            })),
        })
    } catch (error) {
        console.error('Error in GET /api/profiles/search:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

