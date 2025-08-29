export interface AnalyticsData {
    totalLinks: number
    totalClicks: number
    activeLinks: number
    averageClicksPerLink: number
    topPerformingLinks: TopPerformingLink[]
    clickTrends: ClickTrend[]
    recentActivity: RecentActivity[]
    deviceStats: DeviceStats
    referrerStats: ReferrerStats[]
}

export interface TopPerformingLink {
    id: string
    shortCode: string
    originalUrl: string
    clickCount: number
    clickPercentage: number
    lastClicked: string
}

export interface ClickTrend {
    date: string
    clicks: number
    links: number
}

export interface RecentActivity {
    id: string
    shortCode: string
    action: 'click' | 'created' | 'deleted' | 'updated'
    timestamp: string
    details: string
}

export interface DeviceStats {
    desktop: number
    mobile: number
    tablet: number
    unknown: number
}

export interface ReferrerStats {
    referrer: string
    clicks: number
    percentage: number
}

export interface AnalyticsFilters {
    dateRange: '7d' | '30d' | '90d' | '1y' | 'all'
    linkId?: string
    deviceType?: 'desktop' | 'mobile' | 'tablet' | 'all'
}

export interface AnalyticsState {
    data: AnalyticsData | null
    isLoading: boolean
    filters: AnalyticsFilters
    error: string | null
}

// Activity Logs Types
export interface ActivityLog {
    id: string
    shortCode: string
    action: ActivityAction
    timestamp: string
    details: string
    metadata: ActivityMetadata
    userId: string
    ipAddress?: string
    userAgent?: string
    referrer?: string
}

export type ActivityAction =
    | 'link_created'
    | 'link_updated'
    | 'link_deleted'
    | 'link_clicked'
    | 'link_activated'
    | 'link_deactivated'
    | 'domain_added'
    | 'domain_verified'
    | 'domain_deleted'
    | 'profile_updated'
    | 'login'
    | 'logout'

export interface ActivityMetadata {
    linkId?: string
    domainId?: string
    oldValue?: string
    newValue?: string
    clickCount?: number
    deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown'
    browser?: string
    os?: string
    country?: string
    city?: string
}

export interface ActivityLogFilters {
    dateRange: '1h' | '24h' | '7d' | '30d' | '90d' | 'all'
    action: ActivityAction | 'all'
    shortCode?: string
    deviceType: 'all' | 'desktop' | 'mobile' | 'tablet' | 'unknown'
    searchQuery?: string
}

export interface ActivityLogsState {
    logs: ActivityLog[]
    isLoading: boolean
    filters: ActivityLogFilters
    error: string | null
    totalCount: number
    hasMore: boolean
}
