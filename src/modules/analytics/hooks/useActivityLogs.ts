"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { ActivityLog, ActivityLogFilters, ActivityLogsState, ActivityAction } from "../types"

export function useActivityLogs() {
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
                throw new Error('User not authenticated')
            }

            // For now, we'll use mock data since activity logs table doesn't exist yet
            // Contributors can implement the actual database integration
            const mockLogs = generateMockActivityLogs(user.id, state.filters)

            setState(prev => ({
                ...prev,
                logs: refresh ? mockLogs : [...prev.logs, ...mockLogs],
                totalCount: mockLogs.length,
                hasMore: mockLogs.length >= 50, // Mock pagination
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
    }, [state.filters])

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

    // Filter logs based on current filters
    const filteredLogs = useMemo(() => {
        let logs = state.logs

        // Filter by action
        if (state.filters.action !== 'all') {
            logs = logs.filter(log => log.action === state.filters.action)
        }

        // Filter by device type
        if (state.filters.deviceType !== 'all') {
            logs = logs.filter(log => log.metadata.deviceType === state.filters.deviceType)
        }

        // Filter by short code
        if (state.filters.shortCode) {
            logs = logs.filter(log =>
                log.shortCode.toLowerCase().includes(state.filters.shortCode!.toLowerCase())
            )
        }

        // Filter by search query
        if (state.filters.searchQuery) {
            const query = state.filters.searchQuery.toLowerCase()
            logs = logs.filter(log =>
                log.shortCode.toLowerCase().includes(query) ||
                log.details.toLowerCase().includes(query) ||
                log.metadata.browser?.toLowerCase().includes(query) ||
                log.metadata.os?.toLowerCase().includes(query)
            )
        }

        return logs
    }, [state.logs, state.filters])

    // Get unique actions for filter dropdown
    const availableActions = useMemo(() => {
        const actions = new Set<ActivityAction>()
        state.logs.forEach(log => actions.add(log.action))
        return Array.from(actions).sort()
    }, [state.logs])

    // Get unique device types for filter dropdown
    const availableDeviceTypes = useMemo(() => {
        const types = new Set<string>()
        state.logs.forEach(log => {
            if (log.metadata.deviceType) {
                types.add(log.metadata.deviceType)
            }
        })
        return Array.from(types).sort()
    }, [state.logs])

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

// Mock data generators - contributors can replace these with real implementations
function generateMockActivityLogs(userId: string, filters: ActivityLogFilters): ActivityLog[] {
    const actions: ActivityAction[] = [
        'link_created', 'link_updated', 'link_deleted', 'link_clicked',
        'link_activated', 'link_deactivated', 'domain_added', 'domain_verified',
        'profile_updated', 'login', 'logout'
    ]

    const deviceTypes = ['desktop', 'mobile', 'tablet', 'unknown']
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
    const os = ['Windows', 'macOS', 'Linux', 'iOS', 'Android']
    const countries = ['US', 'CA', 'UK', 'DE', 'FR', 'JP', 'AU']
    const cities = ['New York', 'London', 'Berlin', 'Paris', 'Tokyo', 'Sydney']

    const logs: ActivityLog[] = []
    const now = new Date()

    for (let i = 0; i < 50; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)]
        const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)] as any
        const timestamp = new Date(now.getTime() - Math.random() * getTimeRange(filters.dateRange))

        logs.push({
            id: `log-${Date.now()}-${i}`,
            shortCode: generateRandomShortCode(),
            action,
            timestamp: timestamp.toISOString(),
            details: getActionDescription(action),
            metadata: {
                linkId: Math.random() > 0.3 ? `link-${Math.random().toString(36).substr(2, 9)}` : undefined,
                deviceType,
                browser: browsers[Math.floor(Math.random() * browsers.length)],
                os: os[Math.floor(Math.random() * os.length)],
                country: countries[Math.floor(Math.random() * countries.length)],
                city: cities[Math.floor(Math.random() * cities.length)],
                clickCount: action === 'link_clicked' ? Math.floor(Math.random() * 100) + 1 : undefined
            },
            userId,
            ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            referrer: Math.random() > 0.5 ? 'https://google.com' : undefined
        })
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generateRandomShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

function getTimeRange(dateRange: string): number {
    switch (dateRange) {
        case '1h': return 60 * 60 * 1000
        case '24h': return 24 * 60 * 60 * 1000
        case '7d': return 7 * 24 * 60 * 60 * 1000
        case '30d': return 30 * 24 * 60 * 60 * 1000
        case '90d': return 90 * 24 * 60 * 60 * 1000
        case 'all': return 365 * 24 * 60 * 60 * 1000
        default: return 24 * 60 * 60 * 1000
    }
}

function getActionDescription(action: ActivityAction): string {
    switch (action) {
        case 'link_created': return 'New link was created'
        case 'link_updated': return 'Link was updated'
        case 'link_deleted': return 'Link was deleted'
        case 'link_clicked': return 'Link was clicked'
        case 'link_activated': return 'Link was activated'
        case 'link_deactivated': return 'Link was deactivated'
        case 'domain_added': return 'New domain was added'
        case 'domain_verified': return 'Domain was verified'
        case 'domain_deleted': return 'Domain was deleted'
        case 'profile_updated': return 'Profile was updated'
        case 'login': return 'User logged in'
        case 'logout': return 'User logged out'
        default: return 'Action performed'
    }
}
