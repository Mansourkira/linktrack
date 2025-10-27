import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { verifyDomainDNS } from '@/lib/utils/dns-verification'

interface RouteContext {
    params: Promise<{ domainId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
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
            .select('id, domain, status, user_id')
            .eq('id', domainId)
            .eq('user_id', user.id)
            .single()

        if (error || !domain) {
            return NextResponse.json(
                { error: 'Domain not found or access denied' },
                { status: 404 }
            )
        }

        // Verify DNS records
        const verificationResult = await verifyDomainDNS(domain.domain)

        // Update domain status based on verification
        const updateData: any = {
            status: verificationResult.isVerified ? 'verified' : 'failed',
        }

        if (verificationResult.isVerified) {
            updateData.verified_at = new Date().toISOString()
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
                { error: 'Failed to update domain status' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            domain: updatedDomain,
            verification: verificationResult
        })
    } catch (error) {
        console.error('Error in POST /api/domains/[domainId]/verify:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

