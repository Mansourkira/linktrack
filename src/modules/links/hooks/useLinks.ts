"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import type { CreateLinkFormData, LinksState } from "../types"

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
        password: "",
        isActive: true,
    })

    // Delete confirmation dialog state
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean
        link: any | null
    }>({
        isOpen: false,
        link: null
    })

    // Fetch links using API route
    const fetchLinks = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }))

            const response = await fetch('/api/links')
            const result = await response.json()

            if (response.ok) {
                setState(prev => ({ ...prev, links: result.links || [] }))
            } else {
                toast.error(result.error || 'Failed to fetch links')
                setState(prev => ({ ...prev, links: [] }))
            }
        } catch (error) {
            console.error('Error fetching links:', error)
            toast.error('Failed to fetch links')
            setState(prev => ({ ...prev, links: [] }))
        } finally {
            setState(prev => ({ ...prev, isLoading: false }))
        }
    }, [])

    // Generate short code using API route
    const generateShortCode = useCallback(async () => {
        try {
            // For now, use client-side generation
            // TODO: Implement server-side generation via API
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            let result = ''
            for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            return result
        } catch (error) {
            console.error('Error generating short code:', error)
            // Fallback to client-side generation
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            let result = ''
            for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            return result
        }
    }, [])

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({
            originalUrl: "",
            shortCode: "",
            isPasswordProtected: false,
            password: "",
            isActive: true,
        })
    }, [])

    // Create link using API route
    const createLink = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.originalUrl) {
            toast.error("Original URL is required")
            return
        }

        try {
            setState(prev => ({ ...prev, isOperationLoading: true }))

            // Generate short code if not provided
            let shortCode = formData.shortCode
            if (!shortCode) {
                shortCode = await generateShortCode()
            }

            // Prepare the request body
            const requestBody: any = {
                shortCode,
                originalUrl: formData.originalUrl,
                isPasswordProtected: formData.isPasswordProtected,
                isActive: formData.isActive
            }

            // Only include password if password protection is enabled
            if (formData.isPasswordProtected && formData.password) {
                requestBody.password = formData.password
            }

            // Create the link using API route
            const response = await fetch('/api/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })

            const result = await response.json()

            if (response.ok) {
                // Assuming the API response for a successful link creation includes the shortCode
                toast.success('Link created successfully!', {
                    action: {
                        label: 'View Link',
                        onClick: () => {
                            if (result.shortCode) {
                                // Construct the full absolute URL using the current origin
                                const fullShortUrl = `${window.location.origin}/${result.shortCode}`;
                                window.open(fullShortUrl, '_blank');
                            } else {
                                console.warn('Short code not found in the response for the created link.');
                                toast.error('Link created, but short URL could not be displayed.');
                            }
                        },
                    },
                });
                resetForm();
                setState(prev => ({ ...prev, isCreateDialogOpen: false }));
                fetchLinks(); // Refresh the list
            } else {
                toast.error(result.error || 'Failed to create link')
            }
        } catch (error) {
            console.error('Error creating link:', error)
            toast.error('Failed to create link')
        } finally {
            setState(prev => ({ ...prev, isOperationLoading: false }))
        }
    }, [formData, generateShortCode, fetchLinks, resetForm])

    // Show delete confirmation dialog
    const showDeleteDialog = useCallback((link: any) => {
        setDeleteDialog({
            isOpen: true,
            link
        })
    }, [])

    // Close delete confirmation dialog
    const closeDeleteDialog = useCallback(() => {
        setDeleteDialog({
            isOpen: false,
            link: null
        })
    }, [])

    // Delete link using API route (called from confirmation dialog)
    const deleteLink = useCallback(async (id: string) => {
        try {
            setState(prev => ({ ...prev, isOperationLoading: true }))

            const response = await fetch(`/api/links/${id}`, {
                method: 'DELETE',
            })

            const result = await response.json()

            if (response.ok) {
                toast.success('Link deleted successfully')
                // Optimistically update the UI instead of refetching
                setState(prev => ({
                    ...prev,
                    links: prev.links.filter(link => link.id !== id)
                }))
            } else {
                toast.error(result.error || 'Failed to delete link')
            }
        } catch (error) {
            console.error('Error deleting link:', error)
            toast.error('Failed to delete link')
        } finally {
            setState(prev => ({ ...prev, isOperationLoading: false }))
        }
    }, [])

    // Toggle link status using API route
    const toggleLinkStatus = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/links/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'toggleStatus' })
            })

            const result = await response.json()

            if (response.ok) {
                toast.success(`Link ${result.isActive ? 'activated' : 'deactivated'} successfully`)
                fetchLinks() // Refresh the list
            } else {
                toast.error(result.error || 'Failed to toggle link status')
            }
        } catch (error) {
            console.error('Error toggling link status:', error)
            toast.error('Failed to toggle link status')
        }
    }, [fetchLinks])

    // Copy to clipboard
    const copyToClipboard = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success('Copied to clipboard')
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            toast.error('Failed to copy to clipboard')
        }
    }, [])

    // Update form data
    const updateFormData = useCallback((field: keyof CreateLinkFormData, value: string | boolean) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value }

            // Clear password when password protection is disabled
            if (field === 'isPasswordProtected' && value === false) {
                newData.password = ''
            }

            return newData
        })
    }, [])

    // Toggle create dialog
    const toggleCreateDialog = useCallback((open: boolean) => {
        setState(prev => ({ ...prev, isCreateDialogOpen: open }))
    }, [])

    // Memoized values for better performance
    const memoizedState = useMemo(() => state, [state])
    const memoizedFormData = useMemo(() => formData, [formData])

    // Load links on mount
    useEffect(() => {
        fetchLinks()
    }, [fetchLinks])

    return {
        // State
        ...memoizedState,
        formData: memoizedFormData,
        deleteDialog,

        // Actions
        createLink,
        deleteLink,
        showDeleteDialog,
        closeDeleteDialog,
        toggleLinkStatus,
        copyToClipboard,
        resetForm,
        updateFormData,
        toggleCreateDialog,
        fetchLinks,
        generateShortCode,
    }
}
