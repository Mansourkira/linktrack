"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Domain, CreateDomainData, DomainsState, DomainVerificationResult, DNSRecord } from "../types"

export function useDomains() {
    const [state, setState] = useState<DomainsState>({
        domains: [],
        isLoading: true,
        isOperationLoading: false,
        isCreateDialogOpen: false,
        selectedDomain: null,
        error: null
    })

    const [formData, setFormData] = useState<CreateDomainData>({
        domain: "",
        isActive: true
    })

    const fetchDomains = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))

            // Fetch domains from API
            const response = await fetch('/api/domains')

            if (!response.ok) {
                throw new Error('Failed to fetch domains')
            }

            const { domains: fetchedDomains } = await response.json()

            // Transform domains to match our Domain interface
            const transformedDomains: Domain[] = await Promise.all(
                (fetchedDomains || []).map(async (d: any) => {
                    // Fetch linked links for this domain
                    const supabase = createSupabaseBrowserClient()
                    const { data: links } = await supabase
                        .from('links')
                        .select('id, shortCode, originalUrl, isActive')
                        .eq('domainId', d.id)
                        .eq('isActive', true)
                        .is('deletedAt', null)

                    return {
                        id: d.id,
                        domain: d.domain,
                        isVerified: d.status === 'verified',
                        isActive: d.status === 'verified',
                        verificationStatus: d.status === 'verified' ? 'verified' as const :
                            d.status === 'failed' ? 'failed' as const :
                                'pending' as const,
                        dnsRecords: generateDefaultDNSRecords(d.domain),
                        linkedLinks: (links || []).map(link => ({
                            id: link.id,
                            shortCode: link.shortCode,
                            originalUrl: link.originalUrl,
                            customDomain: d.domain,
                            isActive: link.isActive
                        })),
                        createdAt: d.created_at || d.createdAt,  // Handle both snake_case and camelCase
                        updatedAt: d.created_at || d.createdAt,
                        ownerProfileId: d.user_id || ''  // Using user_id (will be workspace_id when workspaces are implemented)
                    }
                })
            )

            setState(prev => ({ ...prev, domains: transformedDomains }))
        } catch (error) {
            console.error('Error fetching domains:', error)
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to fetch domains'
            }))
        } finally {
            setState(prev => ({ ...prev, isLoading: false }))
        }
    }, [])

    const createDomain = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.domain) {
            toast.error("Domain is required")
            return
        }

        try {
            setState(prev => ({ ...prev, isOperationLoading: true }))

            // Validate domain format
            if (!isValidDomain(formData.domain)) {
                toast.error("Please enter a valid domain")
                return
            }

            // Create domain via API
            const response = await fetch('/api/domains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    domain: formData.domain
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create domain')
            }

            const { domain: newDomain } = await response.json()

            // Add to local state
            const transformedDomain: Domain = {
                id: newDomain.id,
                domain: newDomain.domain,
                isVerified: false,
                isActive: false,
                verificationStatus: 'pending',
                dnsRecords: generateDefaultDNSRecords(newDomain.domain),
                linkedLinks: [],
                createdAt: newDomain.createdAt,
                updatedAt: newDomain.createdAt,
                ownerProfileId: ''
            }

            setState(prev => ({
                ...prev,
                domains: [...prev.domains, transformedDomain],
                isCreateDialogOpen: false
            }))

            resetForm()
            toast.success("Domain created successfully! Please configure your DNS settings and verify.")
        } catch (err) {
            console.error('Error creating domain:', err)
            toast.error(err instanceof Error ? err.message : 'Failed to create domain')
        } finally {
            setState(prev => ({ ...prev, isOperationLoading: false }))
        }
    }, [formData])

    const verifyDomain = useCallback(async (domainId: string): Promise<DomainVerificationResult> => {
        try {
            setState(prev => ({ ...prev, isOperationLoading: true }))

            toast.info("Verifying DNS records...")

            // Call verification API
            const response = await fetch(`/api/domains/${domainId}/verify`, {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error('Failed to verify domain')
            }

            const { domain: updatedDomain, verification } = await response.json()

            // Update domain status in local state
            setState(prev => ({
                ...prev,
                domains: prev.domains.map(d =>
                    d.id === domainId
                        ? {
                            ...d,
                            isVerified: verification.isVerified,
                            isActive: verification.isVerified,
                            verificationStatus: verification.isVerified ? 'verified' : 'failed',
                            dnsRecords: verification.records.map((r: any) => ({
                                type: r.type,
                                name: r.name,
                                value: r.value,
                                ttl: 3600,
                                isVerified: r.found
                            })),
                            updatedAt: new Date().toISOString()
                        }
                        : d
                )
            }))

            if (verification.isVerified) {
                toast.success("Domain verified successfully!")
            } else {
                toast.error("Domain verification failed. Please check your DNS settings.")
            }

            const verificationResult: DomainVerificationResult = {
                isVerified: verification.isVerified,
                errors: verification.errors || [],
                warnings: verification.warnings || [],
                dnsRecords: verification.records.map((r: any) => ({
                    type: r.type,
                    name: r.name,
                    value: r.value,
                    ttl: 3600,
                    isVerified: r.found
                }))
            }

            return verificationResult
        } catch (error) {
            console.error('Error verifying domain:', error)
            toast.error('Failed to verify domain')
            throw error
        } finally {
            setState(prev => ({ ...prev, isOperationLoading: false }))
        }
    }, [])

    const deleteDomain = useCallback(async (domainId: string) => {
        try {
            setState(prev => ({ ...prev, isOperationLoading: true }))

            const response = await fetch(`/api/domains/${domainId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete domain')
            }

            setState(prev => ({
                ...prev,
                domains: prev.domains.filter(d => d.id !== domainId)
            }))

            toast.success('Domain deleted successfully')
        } catch (err) {
            console.error('Error deleting domain:', err)
            toast.error(err instanceof Error ? err.message : 'Failed to delete domain')
        } finally {
            setState(prev => ({ ...prev, isOperationLoading: false }))
        }
    }, [])

    const toggleDomainStatus = useCallback(async (domainId: string) => {
        try {
            setState(prev => ({
                ...prev,
                domains: prev.domains.map(d =>
                    d.id === domainId
                        ? { ...d, isActive: !d.isActive, updatedAt: new Date().toISOString() }
                        : d
                )
            }))

            toast.success('Domain status updated')
        } catch (err) {
            console.error('Error updating domain status:', err)
            toast.error('Failed to update domain status')
        }
    }, [])

    const resetForm = useCallback(() => {
        setFormData({
            domain: "",
            isActive: true
        })
    }, [])

    const updateFormData = useCallback((field: keyof CreateDomainData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const toggleCreateDialog = useCallback((open: boolean) => {
        setState(prev => ({ ...prev, isCreateDialogOpen: open }))
    }, [])

    const selectDomain = useCallback((domain: Domain | null) => {
        setState(prev => ({ ...prev, selectedDomain: domain }))
    }, [])

    useEffect(() => {
        fetchDomains()
    }, [fetchDomains])

    return {
        ...state,
        formData,
        createDomain,
        verifyDomain,
        deleteDomain,
        toggleDomainStatus,
        resetForm,
        updateFormData,
        toggleCreateDialog,
        selectDomain,
        fetchDomains
    }
}

// Helper functions
function isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return domainRegex.test(domain)
}

function generateDefaultDNSRecords(_domain: string): DNSRecord[] {
    return [
        {
            type: 'CNAME',
            name: '@',
            value: 'linktrack.app',
            ttl: 3600,
            isVerified: false
        },
        {
            type: 'TXT',
            name: '@',
            value: 'linktrack-verification',
            ttl: 3600,
            isVerified: false
        }
    ]
}
