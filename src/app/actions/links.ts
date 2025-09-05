"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
    createLinkSchema,
    updateLinkSchema,
    linkFiltersSchema,
    type CreateLinkInput,
    type UpdateLinkInput,
    type LinkFilters
} from "@/lib/schemas/link"

// Helper function to get authenticated user
async function getAuthenticatedUser() {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error("Unauthorized")
    }

    return user
}

// Helper function to check if user owns the link
async function checkLinkOwnership(linkId: string, userId: string) {
    const supabase = await createSupabaseServerClient()
    const { data: link, error } = await supabase
        .from('links')
        .select('*')
        .eq('id', linkId)
        .eq('ownerProfileId', userId)
        .is('deletedAt', null)
        .single()

    if (error || !link) {
        throw new Error("Link not found or access denied")
    }

    return link
}

// Create a new link
export async function createLink(input: CreateLinkInput) {
    try {
        // Validate input
        const validatedInput = createLinkSchema.parse(input)

        // Get authenticated user
        const user = await getAuthenticatedUser()

        const supabase = await createSupabaseServerClient()

        // Check if shortCode is unique
        const { data: existingLink, error: checkError } = await supabase
            .from('links')
            .select('id')
            .eq('shortCode', validatedInput.shortCode)
            .is('deletedAt', null)
            .single()

        if (existingLink) {
            throw new Error("Short code already exists")
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
            throw new Error(`Failed to create link: ${error.message}`)
        }

        revalidatePath('/dashboard/links')
        return { success: true, data: link }

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create link"
        }
    }
}

// Get all links for the authenticated user
export async function getLinks(filters: Partial<LinkFilters> = {}) {
    try {
        // Validate filters with defaults
        const validatedFilters = linkFiltersSchema.parse({
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            ...filters
        })

        // Get authenticated user
        const user = await getAuthenticatedUser()

        const supabase = await createSupabaseServerClient()

        // Build query
        let query = supabase
            .from('links')
            .select('*', { count: 'exact' })
            .eq('ownerProfileId', user.id)
            .is('deletedAt', null)

        // Apply filters
        if (validatedFilters.search) {
            query = query.or(`shortCode.ilike.%${validatedFilters.search}%,originalUrl.ilike.%${validatedFilters.search}%`)
        }

        if (validatedFilters.isActive !== undefined) {
            query = query.eq('isActive', validatedFilters.isActive)
        }

        if (validatedFilters.isPasswordProtected !== undefined) {
            query = query.eq('isPasswordProtected', validatedFilters.isPasswordProtected)
        }

        // Apply sorting - use correct column names from your database
        let sortColumn: string
        if (validatedFilters.sortBy === 'createdAt') {
            sortColumn = 'createdAt'  // Your database uses camelCase
        } else if (validatedFilters.sortBy === 'clickCount') {
            sortColumn = 'clickCount'  // Your database uses camelCase
        } else {
            sortColumn = 'shortCode'  // Your database uses camelCase
        }

        query = query.order(sortColumn, { ascending: validatedFilters.sortOrder === 'asc' })

        // Apply pagination
        const offset = (validatedFilters.page - 1) * validatedFilters.limit
        query = query.range(offset, offset + validatedFilters.limit - 1)

        const { data: links, error, count } = await query

        if (error) {
            console.error('Database error in getLinks:', error)
            throw new Error(`Failed to fetch links: ${error.message}`)
        }

        const total = count || 0
        const totalPages = Math.ceil(total / validatedFilters.limit)

        console.log('getLinks result:', {
            linksCount: links?.length || 0,
            total,
            error: error ? 'Database error occurred' : null
        })

        return {
            success: true,
            data: {
                links: links || [],
                total,
                page: validatedFilters.page,
                limit: validatedFilters.limit,
                totalPages,
            }
        }

    } catch (error) {
        console.error('Error in getLinks:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch links"
        }
    }
}

// Get a single link by ID
export async function getLink(linkId: string) {
    try {
        // Get authenticated user
        const user = await getAuthenticatedUser()

        const supabase = await createSupabaseServerClient()

        const { data: link, error } = await supabase
            .from('links')
            .select('*')
            .eq('id', linkId)
            .eq('ownerProfileId', user.id)
            .is('deletedAt', null)
            .single()

        if (error || !link) {
            throw new Error("Link not found")
        }

        return { success: true, data: link }

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch link"
        }
    }
}

// Update a link
export async function updateLink(linkId: string, input: UpdateLinkInput) {
    try {
        // Validate input
        const validatedInput = updateLinkSchema.parse(input)

        // Get authenticated user
        const user = await getAuthenticatedUser()

        // Check ownership
        await checkLinkOwnership(linkId, user.id)

        const supabase = await createSupabaseServerClient()

        // If updating shortCode, check uniqueness
        if (validatedInput.shortCode) {
            const { data: existingLink, error: checkError } = await supabase
                .from('links')
                .select('id')
                .eq('shortCode', validatedInput.shortCode)
                .neq('id', linkId)
                .is('deletedAt', null)
                .single()

            if (existingLink) {
                throw new Error("Short code already exists")
            }
        }

        // Update the link
        const { data: link, error } = await supabase
            .from('links')
            .update({
                ...validatedInput,
                updatedAt: new Date().toISOString(),
            })
            .eq('id', linkId)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to update link: ${error.message}`)
        }

        revalidatePath('/dashboard/links')
        return { success: true, data: link }

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update link"
        }
    }
}

// Soft delete a link
export async function deleteLink(linkId: string) {
    try {
        // Get authenticated user
        const user = await getAuthenticatedUser()

        // Check ownership
        await checkLinkOwnership(linkId, user.id)

        const supabase = await createSupabaseServerClient()

        // Soft delete by setting deletedAt
        const { error } = await supabase
            .from('links')
            .update({
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .eq('id', linkId)

        if (error) {
            throw new Error(`Failed to delete link: ${error.message}`)
        }

        revalidatePath('/dashboard/links')
        return { success: true }

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete link"
        }
    }
}

// Hard delete a link (for admin purposes)
export async function hardDeleteLink(linkId: string) {
    try {
        // Get authenticated user
        const user = await getAuthenticatedUser()

        // Check ownership
        await checkLinkOwnership(linkId, user.id)

        const supabase = await createSupabaseServerClient()

        // Hard delete
        const { error } = await supabase
            .from('links')
            .delete()
            .eq('id', linkId)

        if (error) {
            throw new Error(`Failed to delete link: ${error.message}`)
        }

        revalidatePath('/dashboard/links')
        return { success: true }

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete link"
        }
    }
}

// Toggle link active status
export async function toggleLinkStatus(linkId: string) {
    try {
        // Get authenticated user
        const user = await getAuthenticatedUser()

        // Check ownership
        const link = await checkLinkOwnership(linkId, user.id)

        const supabase = await createSupabaseServerClient()

        // Toggle the status
        const { data: updatedLink, error } = await supabase
            .from('links')
            .update({
                isActive: !link.isActive,
                updatedAt: new Date().toISOString(),
            })
            .eq('id', linkId)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to toggle link status: ${error.message}`)
        }

        revalidatePath('/dashboard/links')
        return { success: true, data: updatedLink }

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to toggle link status"
        }
    }
}

// Generate a unique short code
export async function generateUniqueShortCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const length = 6

    const supabase = await createSupabaseServerClient()

    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
        let result = ''
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        // Check if it's unique
        const { data: existingLink, error } = await supabase
            .from('links')
            .select('id')
            .eq('shortCode', result)
            .is('deletedAt', null)
            .single()

        if (error && error.code === 'PGRST116') {
            // No rows found, code is unique
            return result
        }

        attempts++
    }

    throw new Error("Failed to generate unique short code after multiple attempts")
} 