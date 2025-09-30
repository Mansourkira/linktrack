"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { ActivityLog, ActivityLogFilters, ActivityLogsState, ActivityAction } from "../types"
import { useRouter } from "next/navigation"

export function useActivityLogs() {
    const router = useRouter()
    const [state, setState] = useState<ActivityLogsState>({
        logs: [],
        isLoading: true,
        filters: {
            dateRange: '24h',
            action: 'all',
            deviceType: 'all'
        },
        error: null,
        totalCount: 0,
        hasMore: false
    })

    const fetchActivityLogs = useCallback(async (refresh = false) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))

            // Get current user
            const supabase = createSupabaseBrowserClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // redirect to auth
                router.push('/auth')
                return
            }

            // Build query with filters
            let query = supabase
                .from('activity_logs')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            // Apply date range filter
            if (state.filters.dateRange !== 'all') {
                const dateRange = getDateRange(state.filters.dateRange)
                query = query.gte('created_at', dateRange.toISOString())
            }

            // Apply action filter
            if (state.filters.action !== 'all') {
                query = query.eq('action', state.filters.action)
            }


            // Apply short code filter
            if (state.filters.shortCode) {
                query = query.ilike('short_code', `%${state.filters.shortCode}%`)
            }

            // Apply search query filter
            if (state.filters.searchQuery) {
                query = query.or(`details.ilike.%${state.filters.searchQuery}%,short_code.ilike.%${state.filters.searchQuery}%`)
            }

            // Add pagination
            const pageSize = 50
            const offset = refresh ? 0 : state.logs.length
            query = query.range(offset, offset + pageSize - 1)

            const { data: logs, error: fetchError, count } = await query

            if (fetchError) {
                throw new Error(fetchError.message)
            }

            // Transform the data to match our interface
            const transformedLogs = (logs || []).map(log => ({
                id: log.id,
                shortCode: log.short_code || '',
                action: log.action as ActivityAction,
                timestamp: log.created_at,
                details: log.details,
                metadata: log.metadata || {},
                userId: log.user_id,
                ipAddress: log.ip_address,
                userAgent: log.user_agent || '',
                referrer: log.referrer
            }))

            setState(prev => ({
                ...prev,
                logs: refresh ? transformedLogs : [...prev.logs, ...transformedLogs],
                totalCount: count || 0,
                hasMore: (logs?.length || 0) >= pageSize,
                isLoading: false
            }))
        } catch (error) {
            console.error('Error fetching activity logs:', error)
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to fetch activity logs',
                isLoading: false
            }))
        }
    }, [state.filters, state.logs.length])

    const updateFilters = useCallback((newFilters: Partial<ActivityLogFilters>) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, ...newFilters }
        }))
    }, [])

    const resetFilters = useCallback(() => {
        setState(prev => ({
            ...prev,
            filters: {
                dateRange: '24h',
                action: 'all',
                deviceType: 'all'
            }
        }))
    }, [])

    const loadMore = useCallback(() => {
        if (!state.hasMore || state.isLoading) return
        fetchActivityLogs(false)
    }, [state.hasMore, state.isLoading, fetchActivityLogs])

    const refreshLogs = useCallback(() => {
        fetchActivityLogs(true)
    }, [fetchActivityLogs])

    // Since we're filtering in the database query, filteredLogs is just the current logs
    const filteredLogs = state.logs

    // Get unique actions for filter dropdown
    const availableActions = useMemo(() => {
        const actions = new Set<ActivityAction>()
        state.logs.forEach(log => actions.add(log.action))
        return Array.from(actions).sort()
    }, [state.logs])

    // Get unique device types for filter dropdown (keeping for compatibility but not used)
    const availableDeviceTypes = useMemo(() => {
        return []
    }, [])

    useEffect(() => {
        fetchActivityLogs(true)
    }, [fetchActivityLogs])

    return {
        ...state,
        filteredLogs,
        availableActions,
        availableDeviceTypes,
        updateFilters,
        resetFilters,
        loadMore,
        refreshLogs
    }
}

// Helper function to get date range for filtering
function getDateRange(dateRange: string): Date {
    const now = new Date()
    switch (dateRange) {
        case '1h':
            return new Date(now.getTime() - 60 * 60 * 1000)
        case '24h':
            return new Date(now.getTime() - 24 * 60 * 60 * 1000)
        case '7d':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case '30d':
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        case '90d':
            return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        case 'all':
            return new Date(0) // Beginning of time
        default:
            return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }
}
