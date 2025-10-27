import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface RouteContext {
    params: Promise<{ domainId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { domainId } = await context.params
        const supabase = await createSupabaseServerClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get domain with ownership verification
        const { data: domain, error } = await supabase
            .from('domains')
            .select('id, domain, status, verified_at, created_at, user_id')
            .eq('id', domainId)
            .eq('user_id', user.id)
            .single()

        if (error || !domain) {
            return NextResponse.json(
                { error: 'Domain not found' },
                { status: 404 }
            )
        }

        // Get linked links count
        const { count: linksCount } = await supabase
            .from('links')
            .select('*', { count: 'exact', head: true })
            .eq('"domainId"', domainId)  // Using camelCase column name from links table

        return NextResponse.json({
            domain: {
                ...domain,
                linkedLinksCount: linksCount || 0
            }
        })
    } catch (error) {
        console.error('Error in GET /api/domains/[domainId]:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const { domainId } = await context.params
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
        const { status } = body

        // Verify ownership
        const { data: domain } = await supabase
            .from('domains')
            .select('id, user_id')
            .eq('id', domainId)
            .eq('user_id', user.id)
            .single()

        if (!domain) {
            return NextResponse.json(
                { error: 'Domain not found or access denied' },
                { status: 404 }
            )
        }

        // Update domain
        const updateData: any = {}
        if (status) {
            updateData.status = status
            if (status === 'verified') {
                updateData.verified_at = new Date().toISOString()
            }
        }

        const { data: updatedDomain, error: updateError } = await supabase
            .from('domains')
            .update(updateData)
            .eq('id', domainId)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating domain:', updateError)
            return NextResponse.json(
                { error: 'Failed to update domain' },
                { status: 500 }
            )
        }

        return NextResponse.json({ domain: updatedDomain })
    } catch (error) {
        console.error('Error in PATCH /api/domains/[domainId]:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { domainId } = await context.params
        const supabase = await createSupabaseServerClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify ownership
        const { data: domain } = await supabase
            .from('domains')
            .select('id, user_id')
            .eq('id', domainId)
            .eq('user_id', user.id)
            .single()

        if (!domain) {
            return NextResponse.json(
                { error: 'Domain not found or access denied' },
                { status: 404 }
            )
        }

        // Check if domain has linked links
        const { count: linksCount } = await supabase
            .from('links')
            .select('*', { count: 'exact', head: true })
            .eq('"domainId"', domainId)  // Using camelCase column name from links table

        if (linksCount && linksCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete domain with ${linksCount} linked links. Please remove or reassign them first.` },
                { status: 400 }
            )
        }

        // Delete domain
        const { error: deleteError } = await supabase
            .from('domains')
            .delete()
            .eq('id', domainId)

        if (deleteError) {
            console.error('Error deleting domain:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete domain' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in DELETE /api/domains/[domainId]:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

