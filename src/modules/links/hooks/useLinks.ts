"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import type { Link, CreateLinkFormData, LinksState } from "../types"

export function useLinks() {
    const [state, setState] = useState<LinksState>({
        links: [],
        isLoading: true,
        isOperationLoading: false,
        isCreateDialogOpen: false,
    })

    const [formData, setFormData] = useState<CreateLinkFormData>({
        originalUrl: "",
        shortCode: "",
        isPasswordProtected: false,
        isActive: true,
    })

    // Fetch links
    const fetchLinks = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }))
            const { data, error } = await supabase
                .from('links')
                .select('*')
                .order('createdAt', { ascending: false })

            if (error) throw error
            setState(prev => ({ ...prev, links: data || [] }))
        } catch (error) {
            console.error('Error fetching links:', error)
            toast.error('Failed to fetch links')
        } finally {
            setState(prev => ({ ...prev, isLoading: false }))
        }
    }, [])

    // Generate short code
    const generateShortCode = useCallback(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }, [])

    // Create link
    const createLink = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.originalUrl) {
            toast.error("Original URL is required")
            return
        }

        try {
            setState(prev => ({ ...prev, isOperationLoading: true }))

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("You must be logged in to create links")
                return
            }

            // Generate short code if not provided
            let shortCode = formData.shortCode
            if (!shortCode) {
                shortCode = generateShortCode()
            }

            // Check if short code already exists
            const { data: existingLink } = await supabase
                .from('links')
                .select('id')
                .eq('shortCode', shortCode)
                .single()

            if (existingLink) {
                toast.error("Short code already exists. Please choose a different one.")
                return
            }

            // Create the link
            const { error } = await supabase
                .from('links')
                .insert({
                    originalUrl: formData.originalUrl,
                    shortCode,
                    isPasswordProtected: formData.isPasswordProtected,
                    isActive: formData.isActive,
                    ownerProfileId: user.id,
                })

            if (error) throw error

            toast.success("Link created successfully!")
            setState(prev => ({ ...prev, isCreateDialogOpen: false }))
            resetForm()
            fetchLinks()
        } catch (err) {
            console.error('Error creating link:', err)
            toast.error('Failed to create link')
        } finally {
            setState(prev => ({ ...prev, isOperationLoading: false }))
        }
    }, [formData, generateShortCode, fetchLinks])

    // Delete link
    const deleteLink = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from('links')
                .delete()
                .eq('id', id)

            if (error) throw error

            toast.success('Link deleted successfully')
            fetchLinks()
        } catch (err) {
            console.error('Error deleting link:', err)
            toast.error('Failed to delete link')
        }
    }, [fetchLinks])

    // Copy to clipboard
    const copyToClipboard = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success('Copied to clipboard')
        } catch (err) {
            toast.error('Failed to copy to clipboard')
        }
    }, [])

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({
            originalUrl: "",
            shortCode: "",
            isPasswordProtected: false,
            isActive: true,
        })
    }, [])

    // Update form data
    const updateFormData = useCallback((field: keyof CreateLinkFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    // Toggle create dialog
    const toggleCreateDialog = useCallback((open: boolean) => {
        setState(prev => ({ ...prev, isCreateDialogOpen: open }))
    }, [])

    // Load links on mount
    useEffect(() => {
        fetchLinks()
    }, [fetchLinks])

    return {
        // State
        ...state,
        formData,

        // Actions
        createLink,
        deleteLink,
        copyToClipboard,
        resetForm,
        updateFormData,
        toggleCreateDialog,
        fetchLinks,
    }
}
