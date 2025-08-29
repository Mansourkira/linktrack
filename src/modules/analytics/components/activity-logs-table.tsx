"use client"

import { useState } from "react"
import { IconChevronDown, IconChevronRight, IconCopy, IconExternalLink, IconGlobe, IconDeviceMobile, IconDeviceDesktop, IconDeviceTablet } from "@tabler/icons-react"
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
        const actionIcon = action.charAt(0).toUpperCase()
        let bgColor = 'bg-muted'

        if (action.includes('created')) bgColor = 'bg-green-100 dark:bg-green-900'
        else if (action.includes('deleted')) bgColor = 'bg-red-100 dark:bg-red-900'
        else if (action.includes('clicked')) bgColor = 'bg-blue-100 dark:bg-blue-900'
        else if (action.includes('updated')) bgColor = 'bg-yellow-100 dark:bg-yellow-900'
        else if (action.includes('verified')) bgColor = 'bg-purple-100 dark:bg-purple-900'

        return (
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} text-foreground font-bold text-sm`}>
                {actionIcon}
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

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType) {
            case 'desktop': return <IconDeviceDesktop className="h-4 w-4" />
            case 'mobile': return <IconDeviceMobile className="h-4 w-4" />
            case 'tablet': return <IconDeviceTablet className="h-4 w-4" />
            default: return <IconGlobe className="h-4 w-4" />
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
                                        <span className="font-mono">{log.shortCode}</span>
                                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        {getDeviceIcon(log.metadata.deviceType || 'unknown')}
                                        <span className="capitalize">{log.metadata.deviceType || 'unknown'}</span>
                                    </div>
                                    <div className="text-right text-sm">
                                        <div className="font-medium">{log.metadata.browser}</div>
                                        <div className="text-muted-foreground">{log.metadata.os}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedRows.has(log.id) && (
                                <div className="border-t bg-muted/30 p-4 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Link Actions */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Link Actions</h4>
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

                                        {/* Technical Details */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Technical Details</h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">IP Address:</span>
                                                    <span className="font-mono">{log.ipAddress}</span>
                                                </div>
                                                {log.referrer && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Referrer:</span>
                                                        <span className="font-mono text-xs truncate max-w-[150px]">
                                                            {log.referrer}
                                                        </span>
                                                    </div>
                                                )}
                                                {log.metadata.country && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Location:</span>
                                                        <span>{log.metadata.city}, {log.metadata.country}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Agent */}
                                    {log.userAgent && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">User Agent</h4>
                                            <div className="bg-background p-2 rounded border font-mono text-xs break-all">
                                                {log.userAgent}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Metadata */}
                                    {log.metadata.clickCount && (
                                        <div className="flex items-center gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Click Count:</span>
                                                <span className="ml-2 font-medium">{log.metadata.clickCount}</span>
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
