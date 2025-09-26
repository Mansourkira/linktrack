
"use client"

import { IconFilter, IconSearch, IconRefresh, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ActivityLogFilters, ActivityAction } from "../types"

interface ActivityLogsFiltersProps {
    filters: ActivityLogFilters
    onFiltersChange: (filters: Partial<ActivityLogFilters>) => void
    onReset: () => void
    availableActions: ActivityAction[]
    availableDeviceTypes: string[]
    totalCount: number
    filteredCount: number
}

export function ActivityLogsFilters({
    filters,
    onFiltersChange,
    onReset,
    availableActions,
    availableDeviceTypes,
    totalCount,
    filteredCount
}: ActivityLogsFiltersProps) {
    const hasActiveFilters =
        filters.dateRange !== '24h' ||
        filters.action !== 'all' ||
        filters.shortCode ||
        filters.searchQuery

    const handleInputChange = (field: keyof ActivityLogFilters, value: string) => {
        onFiltersChange({ [field]: value })
    }

    const clearFilter = (field: keyof ActivityLogFilters) => {
        const defaultValue = field === 'dateRange' ? '24h' :
            field === 'action' ? 'all' : ''
        onFiltersChange({ [field]: defaultValue })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <IconFilter className="h-4 w-4" />
                        Activity Logs Filters
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">
                            {filteredCount} of {totalCount} logs
                        </Badge>
                        {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={onReset}>
                                <IconX className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Date Range Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Time Range</label>
                        <Select
                            value={filters.dateRange}
                            onValueChange={(value: any) => onFiltersChange({ dateRange: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1h">Last hour</SelectItem>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="all">All time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Type Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Action Type</label>
                        <Select
                            value={filters.action}
                            onValueChange={(value: any) => onFiltersChange({ action: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All actions</SelectItem>
                                {availableActions.map(action => (
                                    <SelectItem key={action} value={action}>
                                        {formatActionName(action)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Short Code Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Short Code</label>
                        <Input
                            placeholder="Filter by code..."
                            value={filters.shortCode || ''}
                            onChange={(e) => handleInputChange('shortCode', e.target.value)}
                        />
                    </div>
                </div>

                {/* Search Query */}
                <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search in logs, browsers, OS, etc..."
                            value={filters.searchQuery || ''}
                            onChange={(e) => handleInputChange('searchQuery', e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Active Filters:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filters.dateRange !== '24h' && (
                                <Badge variant="secondary" className="gap-1">
                                    Time: {formatDateRange(filters.dateRange)}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1"
                                        onClick={() => clearFilter('dateRange')}
                                    >
                                        <IconX className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {filters.action !== 'all' && (
                                <Badge variant="secondary" className="gap-1">
                                    Action: {formatActionName(filters.action)}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1"
                                        onClick={() => clearFilter('action')}
                                    >
                                        <IconX className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {filters.shortCode && (
                                <Badge variant="secondary" className="gap-1">
                                    Code: {filters.shortCode}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1"
                                        onClick={() => clearFilter('shortCode')}
                                    >
                                        <IconX className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {filters.searchQuery && (
                                <Badge variant="secondary" className="gap-1">
                                    Search: {filters.searchQuery}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1"
                                        onClick={() => clearFilter('searchQuery')}
                                    >
                                        <IconX className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function formatActionName(action: string): string {
    return action
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

function formatDateRange(dateRange: string): string {
    switch (dateRange) {
        case '1h': return 'Last hour'
        case '24h': return 'Last 24 hours'
        case '7d': return 'Last 7 days'
        case '30d': return 'Last 30 days'
        case '90d': return 'Last 90 days'
        case 'all': return 'All time'
        default: return dateRange
    }
}
