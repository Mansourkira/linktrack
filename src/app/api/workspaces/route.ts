import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/workspaces - Get user's workspaces
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

        // Get workspaces where user is a member
        const { data: workspaces, error } = await supabase
            .from('workspace_members')
            .select(`
                workspace_id,
                role,
                joined_at,
                workspaces (
                    id,
                    name,
                    slug,
                    owner_profile_id,
                    created_at,
                    updated_at
                )
            `)
            .eq('profile_id', user.id)
            .order('joined_at', { ascending: false })

        if (error) {
            console.error('Error fetching workspaces:', error)
            return NextResponse.json(
                { error: 'Failed to fetch workspaces' },
                { status: 500 }
            )
        }

        // Transform the data to a cleaner format
        const formattedWorkspaces = workspaces?.map((wm: any) => ({
            id: wm.workspaces.id,
            name: wm.workspaces.name,
            slug: wm.workspaces.slug,
            ownerProfileId: wm.workspaces.owner_profile_id,
            role: wm.role,
            joinedAt: wm.joined_at,
            createdAt: wm.workspaces.created_at,
            updatedAt: wm.workspaces.updated_at,
            isOwner: wm.workspaces.owner_profile_id === user.id,
        })) || []

        return NextResponse.json({ workspaces: formattedWorkspaces })
    } catch (error) {
        console.error('Error in GET /api/workspaces:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

