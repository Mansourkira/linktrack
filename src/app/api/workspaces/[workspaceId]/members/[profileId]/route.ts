import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// PATCH /api/workspaces/[workspaceId]/members/[profileId] - Update member role
export async function PATCH(
    request: NextRequest,
    { params }: { params: { workspaceId: string; profileId: string } }
) {
    try {
        const supabase = await createSupabaseServerClient()
        const { workspaceId, profileId } = params

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
                { error: 'Access denied: Only owners and admins can update member roles' },
                { status: 403 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { role } = body

        if (!role) {
            return NextResponse.json(
                { error: 'role is required' },
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

        // Check if target member exists
        const { data: targetMember, error: targetError } = await supabase
            .from('workspace_members')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('profile_id', profileId)
            .single()

        if (targetError || !targetMember) {
            return NextResponse.json(
                { error: 'Member not found in workspace' },
                { status: 404 }
            )
        }

        // Only owner can change owner role or assign owner role
        if (targetMember.role === 'owner' || role === 'owner') {
            // Check if workspace is owned by current user
            const { data: workspace, error: workspaceError } = await supabase
                .from('workspaces')
                .select('owner_profile_id')
                .eq('id', workspaceId)
                .single()

            if (workspaceError || !workspace) {
                return NextResponse.json(
                    { error: 'Workspace not found' },
                    { status: 404 }
                )
            }

            if (workspace.owner_profile_id !== user.id) {
                return NextResponse.json(
                    { error: 'Access denied: Only workspace owner can manage owner role' },
                    { status: 403 }
                )
            }
        }

        // Prevent removing the last owner
        if (targetMember.role === 'owner' && role !== 'owner') {
            const { data: ownerCount } = await supabase
                .from('workspace_members')
                .select('profile_id', { count: 'exact', head: true })
                .eq('workspace_id', workspaceId)
                .eq('role', 'owner')

            if (ownerCount === 1) {
                return NextResponse.json(
                    { error: 'Cannot remove the last owner from workspace' },
                    { status: 400 }
                )
            }
        }

        // Update member role
        const { data: updatedMember, error: updateError } = await supabase
            .from('workspace_members')
            .update({ role: role })
            .eq('workspace_id', workspaceId)
            .eq('profile_id', profileId)
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

        if (updateError) {
            console.error('Error updating workspace member:', updateError)
            return NextResponse.json(
                { error: 'Failed to update member role' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            member: {
                profileId: updatedMember.profile_id,
                workspaceId: updatedMember.workspace_id,
                role: updatedMember.role,
                joinedAt: updatedMember.joined_at,
                profile: {
                    id: updatedMember.profiles.id,
                    username: updatedMember.profiles.username,
                    email: updatedMember.profiles.email,
                    fullName: updatedMember.profiles.full_name,
                    avatarUrl: updatedMember.profiles.avatar_url,
                },
            },
        })
    } catch (error) {
        console.error('Error in PATCH /api/workspaces/[workspaceId]/members/[profileId]:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspaces/[workspaceId]/members/[profileId] - Remove member from workspace
export async function DELETE(
    request: NextRequest,
    { params }: { params: { workspaceId: string; profileId: string } }
) {
    try {
        const supabase = await createSupabaseServerClient()
        const { workspaceId, profileId } = params

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify user has permission (owner or admin, or self-removal)
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

        // Check if target member exists
        const { data: targetMember, error: targetError } = await supabase
            .from('workspace_members')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('profile_id', profileId)
            .single()

        if (targetError || !targetMember) {
            return NextResponse.json(
                { error: 'Member not found in workspace' },
                { status: 404 }
            )
        }

        // Allow self-removal, or require owner/admin for others
        const isSelfRemoval = profileId === user.id
        const canRemove = isSelfRemoval || membership.role === 'owner' || membership.role === 'admin'

        if (!canRemove) {
            return NextResponse.json(
                { error: 'Access denied: Only owners and admins can remove members' },
                { status: 403 }
            )
        }

        // Prevent removing the last owner
        if (targetMember.role === 'owner') {
            const { data: ownerCount } = await supabase
                .from('workspace_members')
                .select('profile_id', { count: 'exact', head: true })
                .eq('workspace_id', workspaceId)
                .eq('role', 'owner')

            if (ownerCount === 1) {
                return NextResponse.json(
                    { error: 'Cannot remove the last owner from workspace' },
                    { status: 400 }
                )
            }
        }

        // Remove member
        const { error: deleteError } = await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', workspaceId)
            .eq('profile_id', profileId)

        if (deleteError) {
            console.error('Error removing workspace member:', deleteError)
            return NextResponse.json(
                { error: 'Failed to remove member from workspace' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in DELETE /api/workspaces/[workspaceId]/members/[profileId]:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

