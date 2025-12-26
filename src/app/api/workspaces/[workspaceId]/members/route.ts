import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/workspaces/[workspaceId]/members - Get workspace members
export async function GET(
    request: NextRequest,
    { params }: { params: { workspaceId: string } }
) {
    try {
        const supabase = await createSupabaseServerClient()
        const { workspaceId } = params

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify user is a member of the workspace
        const { data: membership, error: membershipError } = await supabase
            .from('workspace_members')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('profile_id', user.id)
            .single()

        if (membershipError || !membership) {
            return NextResponse.json(
                { error: 'Access denied: Not a member of this workspace' },
                { status: 403 }
            )
        }

        // Get all members of the workspace with their profile details
        const { data: members, error } = await supabase
            .from('workspace_members')
            .select(`
                workspace_id,
                profile_id,
                role,
                joined_at,
                profiles (
                    id,
                    username,
                    email,
                    full_name,
                    avatar_url
                ),
                workspaces!inner (
                    owner_profile_id
                )
            `)
            .eq('workspace_id', workspaceId)
            .order('joined_at', { ascending: true })

        if (error) {
            console.error('Error fetching workspace members:', error)
            return NextResponse.json(
                { error: 'Failed to fetch workspace members' },
                { status: 500 }
            )
        }

        // Transform the data
        const formattedMembers = members?.map((member: any) => ({
            profileId: member.profile_id,
            workspaceId: member.workspace_id,
            role: member.role,
            joinedAt: member.joined_at,
            profile: {
                id: member.profiles.id,
                username: member.profiles.username,
                email: member.profiles.email,
                fullName: member.profiles.full_name,
                avatarUrl: member.profiles.avatar_url,
            },
            isOwner: member.workspaces.owner_profile_id === member.profile_id,
        })) || []

        return NextResponse.json({ members: formattedMembers })
    } catch (error) {
        console.error('Error in GET /api/workspaces/[workspaceId]/members:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/workspaces/[workspaceId]/members - Add a member to workspace
export async function POST(
    request: NextRequest,
    { params }: { params: { workspaceId: string } }
) {
    try {
        const supabase = await createSupabaseServerClient()
        const { workspaceId } = params

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify user has permission (owner or admin)
        const { data: membership, error: membershipError } = await supabase
            .from('workspace_members')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('profile_id', user.id)
            .single()

        if (membershipError || !membership) {
            return NextResponse.json(
                { error: 'Access denied: Not a member of this workspace' },
                { status: 403 }
            )
        }

        if (membership.role !== 'owner' && membership.role !== 'admin') {
            return NextResponse.json(
                { error: 'Access denied: Only owners and admins can add members' },
                { status: 403 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { profileId, role = 'viewer' } = body

        if (!profileId) {
            return NextResponse.json(
                { error: 'profileId is required' },
                { status: 400 }
            )
        }

        // Validate role
        const validRoles = ['owner', 'admin', 'editor', 'viewer']
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
                { status: 400 }
            )
        }

        // Prevent adding owner role (owner can only be set via workspace creation)
        if (role === 'owner') {
            return NextResponse.json(
                { error: 'Cannot assign owner role. Owner is set when workspace is created.' },
                { status: 400 }
            )
        }

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', profileId)
            .single()

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            )
        }

        // Check if member already exists
        const { data: existingMember } = await supabase
            .from('workspace_members')
            .select('profile_id')
            .eq('workspace_id', workspaceId)
            .eq('profile_id', profileId)
            .single()

        if (existingMember) {
            return NextResponse.json(
                { error: 'User is already a member of this workspace' },
                { status: 409 }
            )
        }

        // Add member
        const { data: newMember, error: insertError } = await supabase
            .from('workspace_members')
            .insert({
                workspace_id: workspaceId,
                profile_id: profileId,
                role: role,
                joined_at: new Date().toISOString(),
            })
            .select(`
                workspace_id,
                profile_id,
                role,
                joined_at,
                profiles (
                    id,
                    username,
                    email,
                    full_name,
                    avatar_url
                )
            `)
            .single()

        if (insertError) {
            console.error('Error adding workspace member:', insertError)
            return NextResponse.json(
                { error: 'Failed to add member to workspace' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            member: {
                profileId: newMember.profile_id,
                workspaceId: newMember.workspace_id,
                role: newMember.role,
                joinedAt: newMember.joined_at,
                profile: {
                    id: newMember.profiles.id,
                    username: newMember.profiles.username,
                    email: newMember.profiles.email,
                    fullName: newMember.profiles.full_name,
                    avatarUrl: newMember.profiles.avatar_url,
                },
            },
        }, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/workspaces/[workspaceId]/members:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

