"use client"

import { IconRefresh, IconDownload, IconActivity, IconArrowLeft } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { useActivityLogs } from "../hooks/useActivityLogs"
import { ActivityLogsFilters } from "../components/activity-logs-filters"
import { ActivityLogsTable } from "../components/activity-logs-table"
import Link from "next/link"

export function ActivityLogsPage() {
    const {
        filteredLogs,
        isLoading,
        error,
        filters,
        totalCount,
        hasMore,
        availableActions,
        availableDeviceTypes,
        updateFilters,
        resetFilters,
        loadMore,
        refreshLogs
    } = useActivityLogs()

    if (error) {
        return (
            <div className="space-y-6 p-6 w-full">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                        <h2 className="text-xl font-semibold text-destructive">Failed to Load Activity Logs</h2>
                        <p className="text-muted-foreground">{error}</p>
                        <Button onClick={refreshLogs}>Try Again</Button>
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
                        <h1 className="text-2xl font-semibold">Activity Logs</h1>
                        <p className="text-muted-foreground">Monitor all activities and user interactions</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                        <IconActivity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            All time activity records
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Filtered Logs</CardTitle>
                        <IconActivity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredLogs.length.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently visible logs
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Action Types</CardTitle>
                        <IconActivity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableActions.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Different action categories
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                        <IconActivity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {filteredLogs.length > 0 ?
                                new Date(filteredLogs[0].timestamp).toLocaleDateString() :
                                'N/A'
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Latest activity date
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <ActivityLogsFilters
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={resetFilters}
                availableActions={availableActions}
                availableDeviceTypes={availableDeviceTypes}
                totalCount={totalCount}
                filteredCount={filteredLogs.length}
            />

            {/* Activity Logs Table */}
            <ActivityLogsTable
                logs={filteredLogs}
                isLoading={isLoading}
                onLoadMore={loadMore}
                hasMore={hasMore}
            />

            {/* Contributing Section */}
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-center">🚀 Open Source Project</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        This activity logging system is designed for contributors to enhance and extend.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="outline">Real-time logging</Badge>
                        <Badge variant="outline">Advanced analytics</Badge>
                        <Badge variant="outline">Export capabilities</Badge>
                        <Badge variant="outline">Webhook integration</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Consider adding: Real-time notifications, advanced filtering, log retention policies, and more!
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
