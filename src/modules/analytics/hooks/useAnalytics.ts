"use client"

import { useState, useEffect, useCallback } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { AnalyticsData, AnalyticsFilters, AnalyticsState } from "../types"
import { useRouter } from "next/navigation"

export function useAnalytics() {
    const router = useRouter()
    const [state, setState] = useState<AnalyticsState>({
        data: null,
        isLoading: true,
        filters: {
            dateRange: '30d',
            deviceType: 'all'
        },
        error: null
    })

    const fetchAnalytics = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))

            // Get current user
            const supabase = createSupabaseBrowserClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // redirect to login
                router.push('/auth')
                return
            }

            // Fetch basic stats
            const { data: linksData, error: linksError } = await supabase
                .from('links')
                .select('*')
                .eq('ownerProfileId', user.id)

            if (linksError) throw linksError

            const totalLinks = linksData?.length || 0
            const activeLinks = linksData?.filter(link => link.isActive).length || 0
            const totalClicks = linksData?.reduce((sum, link) => sum + link.clickCount, 0) || 0
            const averageClicksPerLink = totalLinks > 0 ? totalClicks / totalLinks : 0

            // Get top performing links
            const topPerformingLinks = linksData
                ?.filter(link => link.clickCount > 0)
                .sort((a, b) => b.clickCount - a.clickCount)
                .slice(0, 10)
                .map(link => ({
                    id: link.id,
                    shortCode: link.shortCode,
                    originalUrl: link.originalUrl,
                    clickCount: link.clickCount,
                    clickPercentage: totalClicks > 0 ? (link.clickCount / totalClicks) * 100 : 0,
                    lastClicked: link.createdAt // TODO: Add lastClicked field to links table
                })) || []

            // Generate mock click trends for now (contributors can enhance this)
            const clickTrends = generateMockClickTrends(30)

            // Generate mock recent activity
            const recentActivity = generateMockRecentActivity(linksData || [])

            // Generate mock device stats
            const deviceStats = {
                desktop: Math.floor(Math.random() * 60) + 20,
                mobile: Math.floor(Math.random() * 30) + 10,
                tablet: Math.floor(Math.random() * 10) + 5,
                unknown: Math.floor(Math.random() * 5) + 1
            }

            // Generate mock referrer stats
            const referrerStats = generateMockReferrerStats()

            const analyticsData: AnalyticsData = {
                totalLinks,
                totalClicks,
                activeLinks,
                averageClicksPerLink: Math.round(averageClicksPerLink * 100) / 100,
                topPerformingLinks,
                clickTrends,
                recentActivity,
                deviceStats,
                referrerStats
            }

            setState(prev => ({ ...prev, data: analyticsData }))
        } catch (error) {
            console.error('Error fetching analytics:', error)
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to fetch analytics'
            }))
        } finally {
            setState(prev => ({ ...prev, isLoading: false }))
        }
    }, [])

    const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, ...newFilters }
        }))
    }, [])

    const refreshData = useCallback(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    return {
        ...state,
        updateFilters,
        refreshData
    }
}

// Mock data generators - contributors can replace these with real implementations
function generateMockClickTrends(days: number) {
    const trends = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        trends.push({
            date: date.toISOString().split('T')[0],
            clicks: Math.floor(Math.random() * 50) + 5,
            links: Math.floor(Math.random() * 10) + 1
        })
    }

    return trends
}

function generateMockRecentActivity(links: Array<{ id: string; shortCode: string; originalUrl: string }>) {
    const activities = []
    const actions = ['click', 'created', 'deleted', 'updated'] as const

    for (let i = 0; i < 10; i++) {
        const link = links[Math.floor(Math.random() * links.length)] || { shortCode: 'demo' }
        const action = actions[Math.floor(Math.random() * actions.length)]

        activities.push({
            id: `activity-${i}`,
            shortCode: link.shortCode,
            action,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            details: getActionDescription(action, link.shortCode)
        })
    }

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generateMockReferrerStats() {
    const referrers = [
        { name: 'Direct', clicks: Math.floor(Math.random() * 100) + 50 },
        { name: 'Google', clicks: Math.floor(Math.random() * 80) + 30 },
        { name: 'Social Media', clicks: Math.floor(Math.random() * 60) + 20 },
        { name: 'Email', clicks: Math.floor(Math.random() * 40) + 15 },
        { name: 'Other', clicks: Math.floor(Math.random() * 30) + 10 }
    ]

    const totalClicks = referrers.reduce((sum, ref) => sum + ref.clicks, 0)

    return referrers.map(ref => ({
        referrer: ref.name,
        clicks: ref.clicks,
        percentage: Math.round((ref.clicks / totalClicks) * 100)
    }))
}

function getActionDescription(action: string, shortCode: string) {
    switch (action) {
        case 'click': return `Link ${shortCode} was clicked`
        case 'created': return `New link ${shortCode} was created`
        case 'deleted': return `Link ${shortCode} was deleted`
        case 'updated': return `Link ${shortCode} was updated`
        default: return `Action performed on ${shortCode}`
    }
}
