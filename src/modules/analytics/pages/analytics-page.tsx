"use client"

import { IconRefresh, IconFilter, IconArrowLeft } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useAnalytics } from "../hooks/useAnalytics"
import { StatsCards } from "../components/stats-cards"
import { TopPerformingLinks } from "../components/top-performing-links"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import Link from "next/link"

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
                    <div className="grid gap-4 md:grid-cols-3"> {/* Changed to grid for full width distribution */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <Select
                                value={filters.dateRange}
                                onValueChange={(value: '7d' | '30d' | '90d' | '1y' | 'all') => updateFilters({ dateRange: value })}
                            >
                                <SelectTrigger> {/* Removed w-40 to allow full width */}
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
                                onValueChange={(value: 'all' | 'desktop' | 'mobile' | 'tablet') => updateFilters({ deviceType: value })}
                            >
                                <SelectTrigger> {/* Removed w-40 to allow full width */}
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Filter by Link</label>
                            <Select
                                value={filters.linkId || "all"}
                                onValueChange={(value: string) => updateFilters({ linkId: value === "all" ? null : value })}
                            >
                                <SelectTrigger> {/* Removed w-40 to allow full width */}
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All links</SelectItem>
                                    {data?.topPerformingLinks.map((link) => (
                                        <SelectItem key={link.id} value={link.id}>
                                            {link.shortCode}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            {/*     <StatsCards data={data} /> */}

            {/* Analytics Chart */}
            <ChartAreaInteractive
                filters={filters}
                onTimeRangeChange={(timeRange) => updateFilters({ dateRange: timeRange as any })}
            />

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

        </div>
    )
}
