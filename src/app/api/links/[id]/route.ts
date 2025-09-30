import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/server'
import { createServerClient } from '@supabase/ssr'
import { config } from '@/lib/config'
import { updateLinkSchema } from '@/lib/schemas/link'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get authenticated user using the helper
        const user = await requireUser()

        const supabase = createServerClient(
            config.supabase.url,
            config.supabase.anonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll() {
                        // Not needed for API routes
                    },
                },
            }
        )

        const { data: link, error } = await supabase
            .from('links')
            .select('*')
            .eq('id', id)
            .eq('ownerProfileId', user.id)
            .is('deletedAt', null)
            .single()

        if (error || !link) {
            return NextResponse.json(
                { error: 'Link not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(link)

    } catch (error) {
        console.error('Error in GET /api/links/[id]:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Get authenticated user using the helper
        const user = await requireUser()

        // Validate input
        const validatedInput = updateLinkSchema.parse(body)

        // Check ownership
        const supabase = createServerClient(
            config.supabase.url,
            config.supabase.anonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll() {
                        // Not needed for API routes
                    },
                },
            }
        )

        const { data: existingLink, error: ownershipError } = await supabase
            .from('links')
            .select('id')
            .eq('id', id)
            .eq('ownerProfileId', user.id)
            .is('deletedAt', null)
            .single()

        if (ownershipError || !existingLink) {
            return NextResponse.json(
                { error: 'Link not found or access denied' },
                { status: 404 }
            )
        }

        // If updating shortCode, check uniqueness
        if (validatedInput.shortCode) {
            const { data: duplicateLink, error: checkError } = await supabase
                .from('links')
                .select('id')
                .eq('shortCode', validatedInput.shortCode)
                .neq('id', id)
                .is('deletedAt', null)
                .single()

            if (duplicateLink) {
                return NextResponse.json(
                    { error: 'Short code already exists' },
                    { status: 400 }
                )
            }
        }

        // Update the link
        const { data: link, error } = await supabase
            .from('links')
            .update({
                ...validatedInput,
                updatedAt: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Database error in PUT /api/links/[id]:', error)
            return NextResponse.json(
                { error: `Failed to update link: ${error.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json(link)

    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation error', details: error.message },
                { status: 400 }
            )
        }

        console.error('Error in PUT /api/links/[id]:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get authenticated user using the helper
        const user = await requireUser()

        // Check ownership
        const supabase = createServerClient(
            config.supabase.url,
            config.supabase.anonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll() {
                        // Not needed for API routes
                    },
                },
            }
        )

        const { data: existingLink, error: ownershipError } = await supabase
            .from('links')
            .select('id')
            .eq('id', id)
            .eq('ownerProfileId', user.id)
            .is('deletedAt', null)
            .single()

        if (ownershipError || !existingLink) {
            return NextResponse.json(
                { error: 'Link not found or access denied' },
                { status: 404 }
            )
        }

        // First, check if the link has password protection
        const { data: linkData, error: linkError } = await supabase
            .from('links')
            .select('isPasswordProtected')
            .eq('id', id)
            .single()

        if (linkError) {
            console.error('Error fetching link data:', linkError)
            return NextResponse.json(
                { error: `Failed to fetch link data: ${linkError.message}` },
                { status: 500 }
            )
        }

        // If password protected, delete the password record first
        if (linkData.isPasswordProtected) {
            const { error: passwordError } = await supabase
                .from('link_passwords')
                .delete()
                .eq('link_id', id)

            if (passwordError) {
                console.error('Error deleting password record:', passwordError)
                return NextResponse.json(
                    { error: `Failed to delete password record: ${passwordError.message}` },
                    { status: 500 }
                )
            }
        }

        // Soft delete by setting deletedAt
        const { error } = await supabase
            .from('links')
            .update({
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .eq('id', id)

        if (error) {
            console.error('Database error in DELETE /api/links/[id]:', error)
            return NextResponse.json(
                { error: `Failed to delete link: ${error.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error in DELETE /api/links/[id]:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Get authenticated user using the helper
        const user = await requireUser()

        // Handle different patch operations
        if (body.action === 'toggleStatus') {
            // Check ownership
            const supabase = createServerClient(
                config.supabase.url,
                config.supabase.anonKey,
                {
                    cookies: {
                        getAll() {
                            return request.cookies.getAll()
                        },
                        setAll() {
                            // Not needed for API routes
                        },
                    },
                }
            )

            const { data: existingLink, error: ownershipError } = await supabase
                .from('links')
                .select('*')
                .eq('id', id)
                .eq('ownerProfileId', user.id)
                .is('deletedAt', null)
                .single()

            if (ownershipError || !existingLink) {
                return NextResponse.json(
                    { error: 'Link not found or access denied' },
                    { status: 404 }
                )
            }

            // Toggle the status
            const { data: updatedLink, error } = await supabase
                .from('links')
                .update({
                    isActive: !existingLink.isActive,
                    updatedAt: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single()

            if (error) {
                console.error('Database error in PATCH /api/links/[id]:', error)
                return NextResponse.json(
                    { error: `Failed to toggle link status: ${error.message}` },
                    { status: 500 }
                )
            }

            return NextResponse.json(updatedLink)
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Error in PATCH /api/links/[id]:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 