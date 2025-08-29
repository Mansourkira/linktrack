"use client"

import { IconArrowLeft, IconRefresh, IconFilter, IconActivity } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

import { useAnalytics } from "../hooks/useAnalytics"
import { StatsCards } from "../components/stats-cards"
import { TopPerformingLinks } from "../components/top-performing-links"

export function AnalyticsPage() {
    const { data, isLoading, error, filters, updateFilters, refreshData } = useAnalytics()

    if (isLoading) {
        return (
            <div className="space-y-6 p-6 w-full">
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-lg">Loading analytics...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="space-y-6 p-6 w-full">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                        <h2 className="text-xl font-semibold text-destructive">Failed to Load Analytics</h2>
                        <p className="text-muted-foreground">{error || 'Unknown error occurred'}</p>
                        <Button onClick={refreshData}>Try Again</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <IconArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
                        <p className="text-muted-foreground">Track your link performance and insights</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/analytics/activity-logs">
                        <Button variant="outline" size="sm">
                            <IconActivity className="mr-2 h-4 w-4" />
                            Activity Logs
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={refreshData}>
                        <IconRefresh className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconFilter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <Select
                                value={filters.dateRange}
                                onValueChange={(value: any) => updateFilters({ dateRange: value })}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">Last 7 days</SelectItem>
                                    <SelectItem value="30d">Last 30 days</SelectItem>
                                    <SelectItem value="90d">Last 90 days</SelectItem>
                                    <SelectItem value="1y">Last year</SelectItem>
                                    <SelectItem value="all">All time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Device Type</label>
                            <Select
                                value={filters.deviceType}
                                onValueChange={(value: any) => updateFilters({ deviceType: value })}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All devices</SelectItem>
                                    <SelectItem value="desktop">Desktop</SelectItem>
                                    <SelectItem value="mobile">Mobile</SelectItem>
                                    <SelectItem value="tablet">Tablet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <StatsCards data={data} />

            {/* Charts and Data */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Performing Links */}
                <TopPerformingLinks links={data.topPerformingLinks} />

                {/* Device Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Device Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(data.deviceStats).map(([device, clicks]) => (
                                <div key={device} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-primary" />
                                        <span className="text-sm capitalize">{device}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{clicks}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {Math.round((clicks / Object.values(data.deviceStats).reduce((a, b) => a + b, 0)) * 100)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Recent Activity</CardTitle>
                        <Link href="/dashboard/analytics/activity-logs">
                            <Button variant="outline" size="sm">
                                <IconActivity className="mr-2 h-4 w-4" />
                                View All Logs
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data.recentActivity.slice(0, 5).map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                                    <span className="text-xs font-medium">
                                        {activity.action.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{activity.details}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {new Date(activity.timestamp).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(activity.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Contributing Section */}
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-center">🚀 Open Source Project</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        This analytics dashboard is designed for contributors to enhance and extend.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="outline">Real-time tracking</Badge>
                        <Badge variant="outline">Advanced charts</Badge>
                        <Badge variant="outline">Export data</Badge>
                        <Badge variant="outline">Custom metrics</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Consider adding: Geographic data, A/B testing, conversion tracking, and more!
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
