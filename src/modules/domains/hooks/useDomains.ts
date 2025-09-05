"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"
import type { Domain, CreateDomainData, DomainsState, DomainVerificationResult } from "../types"

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

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('User not authenticated')
            }

            // For now, we'll use mock data since domains table doesn't exist yet
            // Contributors can implement the actual database integration
            const mockDomains: Domain[] = [
                {
                    id: '1',
                    domain: 'example.com',
                    isVerified: true,
                    isActive: true,
                    verificationStatus: 'verified',
                    dnsRecords: [
                        {
                            type: 'CNAME',
                            name: '@',
                            value: 'linktrack.app',
                            ttl: 3600,
                            isVerified: true
                        }
                    ],
                    linkedLinks: [
                        {
                            id: '1',
                            shortCode: 'demo',
                            originalUrl: 'https://example.com/demo',
                            customDomain: 'example.com',
                            isActive: true
                        }
                    ],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ownerProfileId: user.id
                },
                {
                    id: '2',
                    domain: 'mylinks.com',
                    isVerified: false,
                    isActive: false,
                    verificationStatus: 'pending',
                    dnsRecords: [
                        {
                            type: 'A',
                            name: '@',
                            value: '192.168.1.1',
                            ttl: 3600,
                            isVerified: false
                        }
                    ],
                    linkedLinks: [],
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    ownerProfileId: user.id
                }
            ]

            setState(prev => ({ ...prev, domains: mockDomains }))
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

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("You must be logged in to create domains")
                return
            }

            // Validate domain format
            if (!isValidDomain(formData.domain)) {
                toast.error("Please enter a valid domain")
                return
            }

            // Check if domain already exists
            const existingDomain = state.domains.find(d => d.domain === formData.domain)
            if (existingDomain) {
                toast.error("Domain already exists")
                return
            }

            // Create new domain (mock implementation)
            const newDomain: Domain = {
                id: Date.now().toString(),
                domain: formData.domain,
                isVerified: false,
                isActive: formData.isActive,
                verificationStatus: 'pending',
                dnsRecords: generateDefaultDNSRecords(formData.domain),
                linkedLinks: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ownerProfileId: user.id
            }

            setState(prev => ({
                ...prev,
                domains: [...prev.domains, newDomain],
                isCreateDialogOpen: false
            }))

            resetForm()
            toast.success("Domain created successfully! Please verify your DNS settings.")
        } catch (err) {
            console.error('Error creating domain:', err)
            toast.error('Failed to create domain')
        } finally {
            setState(prev => ({ ...prev, isOperationLoading: false }))
        }
    }, [formData, state.domains])

    const verifyDomain = useCallback(async (domainId: string): Promise<DomainVerificationResult> => {
        try {
            setState(prev => ({ ...prev, isOperationLoading: true }))

            // Mock verification process
            await new Promise(resolve => setTimeout(resolve, 2000))

            const domain = state.domains.find(d => d.id === domainId)
            if (!domain) {
                throw new Error('Domain not found')
            }

            // Simulate verification (contributors can implement real DNS checking)
            const isVerified = Math.random() > 0.3 // 70% success rate for demo
            const verificationResult: DomainVerificationResult = {
                isVerified,
                errors: isVerified ? [] : ['DNS records not found or incorrect'],
                warnings: [],
                dnsRecords: domain.dnsRecords.map(record => ({
                    ...record,
                    isVerified: isVerified
                }))
            }

            // Update domain status
            setState(prev => ({
                ...prev,
                domains: prev.domains.map(d =>
                    d.id === domainId
                        ? {
                            ...d,
                            isVerified: isVerified,
                            verificationStatus: isVerified ? 'verified' : 'failed',
                            dnsRecords: verificationResult.dnsRecords,
                            updatedAt: new Date().toISOString()
                        }
                        : d
                )
            }))

            return verificationResult
        } catch (error) {
            console.error('Error verifying domain:', error)
            throw error
        } finally {
            setState(prev => ({ ...prev, isOperationLoading: false }))
        }
    }, [state.domains])

    const deleteDomain = useCallback(async (domainId: string) => {
        try {
            const { error } = await supabase
                .from('domains')
                .delete()
                .eq('id', domainId)

            if (error) throw error

            setState(prev => ({
                ...prev,
                domains: prev.domains.filter(d => d.id !== domainId)
            }))

            toast.success('Domain deleted successfully')
        } catch (err) {
            console.error('Error deleting domain:', err)
            toast.error('Failed to delete domain')
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

    const updateFormData = useCallback((field: keyof CreateDomainData, value: any) => {
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

function generateDefaultDNSRecords(domain: string): any[] {
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
