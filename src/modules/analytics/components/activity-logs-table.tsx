"use client"

import { useState } from "react"
import { IconChevronDown, IconChevronRight, IconCopy, IconExternalLink, IconGlobe, IconClock, IconUser, IconLink } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ActivityLog } from "../types"
import { getShortUrl } from "@/modules/links/config"

interface ActivityLogsTableProps {
    logs: ActivityLog[]
    isLoading: boolean
    onLoadMore: () => void
    hasMore: boolean
}

export function ActivityLogsTable({ logs, isLoading, onLoadMore, hasMore }: ActivityLogsTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const toggleRow = (logId: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(logId)) {
            newExpanded.delete(logId)
        } else {
            newExpanded.add(logId)
        }
        setExpandedRows(newExpanded)
    }

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleOpenLink = (shortCode: string) => {
        const shortUrl = getShortUrl(shortCode)
        window.open(shortUrl, '_blank')
    }

    const getActionIcon = (action: string) => {
        let icon = null
        let bgColor = 'bg-muted'

        if (action.includes('created')) {
            bgColor = 'bg-green-100 dark:bg-green-900'
            icon = <IconLink className="h-4 w-4" />
        } else if (action.includes('deleted')) {
            bgColor = 'bg-red-100 dark:bg-red-900'
            icon = <IconLink className="h-4 w-4" />
        } else if (action.includes('clicked')) {
            bgColor = 'bg-blue-100 dark:bg-blue-900'
            icon = <IconGlobe className="h-4 w-4" />
        } else if (action.includes('updated')) {
            bgColor = 'bg-yellow-100 dark:bg-yellow-900'
            icon = <IconLink className="h-4 w-4" />
        } else if (action.includes('verified')) {
            bgColor = 'bg-purple-100 dark:bg-purple-900'
            icon = <IconGlobe className="h-4 w-4" />
        } else if (action.includes('login') || action.includes('logout')) {
            bgColor = 'bg-indigo-100 dark:bg-indigo-900'
            icon = <IconUser className="h-4 w-4" />
        } else {
            icon = <IconGlobe className="h-4 w-4" />
        }

        return (
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} text-foreground`}>
                {icon}
            </div>
        )
    }

    const getActionBadgeVariant = (action: string) => {
        if (action.includes('created')) return 'default'
        if (action.includes('deleted')) return 'destructive'
        if (action.includes('clicked')) return 'secondary'
        if (action.includes('updated')) return 'outline'
        if (action.includes('verified')) return 'default'
        return 'secondary'
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) {
            return 'Just now'
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`
        } else if (diffInHours < 168) { // 7 days
            return `${Math.floor(diffInHours / 24)}d ago`
        } else {
            return date.toLocaleDateString()
        }
    }

    if (logs.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <IconGlobe className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">No activity logs found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your filters or check back later
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {logs.map((log) => (
                        <div key={log.id} className="border rounded-lg overflow-hidden">
                            {/* Main Row */}
                            <div
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => toggleRow(log.id)}
                            >
                                <div className="flex items-center gap-2">
                                    {expandedRows.has(log.id) ? (
                                        <IconChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    {getActionIcon(log.action)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{log.details}</span>
                                        <Badge variant={getActionBadgeVariant(log.action)} className="text-xs">
                                            {log.action.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {log.shortCode && (
                                            <div className="flex items-center gap-1">
                                                <IconLink className="h-3 w-3" />
                                                <span className="font-mono">{log.shortCode}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <IconClock className="h-3 w-3" />
                                            <span>{formatTimestamp(log.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {new Date(log.timestamp).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedRows.has(log.id) && (
                                <div className="border-t bg-muted/30 p-4 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Link Actions */}
                                        {log.shortCode && (
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-sm">Quick Actions</h4>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCopy(getShortUrl(log.shortCode))}
                                                    >
                                                        <IconCopy className="mr-2 h-4 w-4" />
                                                        Copy Link
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenLink(log.shortCode)}
                                                    >
                                                        <IconExternalLink className="mr-2 h-4 w-4" />
                                                        Open Link
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Activity Details */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Activity Details</h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Activity ID:</span>
                                                    <span className="font-mono text-xs">{log.id.slice(0, 8)}...</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Full Timestamp:</span>
                                                    <span className="font-mono text-xs">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                {log.referrer && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Referrer:</span>
                                                        <span className="font-mono text-xs truncate max-w-[150px]">
                                                            {log.referrer}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Metadata */}
                                    {Object.keys(log.metadata).length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Additional Information</h4>
                                            <div className="bg-background p-3 rounded border">
                                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                                                    {JSON.stringify(log.metadata, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                    <div className="mt-6 text-center">
                        <Button
                            variant="outline"
                            onClick={onLoadMore}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Load More'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
