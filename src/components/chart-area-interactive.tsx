"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { useAnalytics } from "@/modules/analytics/hooks/useAnalytics"
import type { AnalyticsFilters } from "@/modules/analytics/types"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart showing link click analytics"

const chartConfig = {
  clicks: {
    label: "Total Clicks",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--muted-foreground))",
  },
  tablet: {
    label: "Tablet",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

// Helper function to generate date range based on time period
function generateDateRange(timeRange: string): string[] {
  const dates: string[] = []
  const today = new Date()

  let daysToSubtract = 90
  if (timeRange === "30d") {
    daysToSubtract = 30
  } else if (timeRange === "7d") {
    daysToSubtract = 7
  }

  for (let i = daysToSubtract - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }

  return dates
}

// Helper function to generate mock device data for each date
function generateDeviceDataForDate(date: string, totalClicks: number): { desktop: number; mobile: number; tablet: number } {
  // Simulate realistic device distribution
  const desktopRatio = 0.45 + Math.sin(date.length) * 0.1 // 35-55%
  const mobileRatio = 0.40 + Math.cos(date.length) * 0.1  // 30-50%
  const tabletRatio = 0.15 + Math.sin(date.length * 2) * 0.05 // 10-20%

  const desktop = Math.floor(totalClicks * desktopRatio)
  const mobile = Math.floor(totalClicks * mobileRatio)
  const tablet = totalClicks - desktop - mobile

  return { desktop, mobile, tablet }
}

interface ChartAreaInteractiveProps {
  filters?: AnalyticsFilters
  onTimeRangeChange?: (timeRange: string) => void
}

export function ChartAreaInteractive({ filters, onTimeRangeChange }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [internalTimeRange, setInternalTimeRange] = React.useState("90d")
  const { data: analyticsData, isLoading, error } = useAnalytics()

  // Use external filters if provided, otherwise use internal state
  const timeRange = filters?.dateRange || internalTimeRange
  const deviceType = filters?.deviceType || 'all'

  React.useEffect(() => {
    if (isMobile && !filters) {
      setInternalTimeRange("7d")
    }
  }, [isMobile, filters])

  // Handle time range changes
  const handleTimeRangeChange = (newTimeRange: string) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(newTimeRange)
    } else {
      setInternalTimeRange(newTimeRange)
    }
  }

  // Generate chart data from analytics with device and link filtering
  const chartData = React.useMemo(() => {
    if (!analyticsData) return []

    const dates = generateDateRange(timeRange)
    const linkId = filters?.linkId

    return dates.map(date => {
      // Get total clicks for this date from clickTrends
      const trendData = analyticsData.clickTrends.find(trend => trend.date === date)
      let totalClicks = trendData?.clicks || 0

      // If filtering by a specific link, we need to simulate link-specific data
      // In a real implementation, this would come from the database
      if (linkId && linkId !== 'all') {
        // Find the link to get its click distribution
        const selectedLink = analyticsData.topPerformingLinks.find(link => link.id === linkId)
        if (selectedLink) {
          // Simulate daily clicks for this specific link with more realistic distribution
          // Use the link's click percentage but add some daily variation
          const linkClickRatio = selectedLink.clickPercentage / 100
          const baseClicks = Math.floor(totalClicks * linkClickRatio)

          // Add some realistic daily variation (±30%)
          const variation = 0.7 + (Math.sin(date.length * 0.5) * 0.3) + (Math.cos(date.length * 0.3) * 0.2)
          totalClicks = Math.max(0, Math.floor(baseClicks * variation))
        } else {
          totalClicks = 0
        }
      }

      // Generate device-specific data
      const deviceData = generateDeviceDataForDate(date, totalClicks)

      // Filter by device type if specified
      if (deviceType !== 'all') {
        const filteredData = {
          date,
          clicks: deviceData[deviceType as keyof typeof deviceData] || 0,
          desktop: deviceType === 'desktop' ? deviceData.desktop : 0,
          mobile: deviceType === 'mobile' ? deviceData.mobile : 0,
          tablet: deviceType === 'tablet' ? deviceData.tablet : 0,
        }
        return filteredData
      }

      return {
        date,
        clicks: totalClicks,
        ...deviceData
      }
    })
  }, [analyticsData, timeRange, deviceType, filters?.linkId])

  const totalClicks = React.useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.clicks, 0)
  }, [chartData])

  // Get the selected link info for display
  const selectedLink = React.useMemo(() => {
    if (filters?.linkId && filters.linkId !== 'all') {
      return analyticsData?.topPerformingLinks.find(link => link.id === filters.linkId)
    }
    return null
  }, [filters?.linkId, analyticsData?.topPerformingLinks])

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Link Analytics</CardTitle>
          <CardDescription>Loading your link performance data...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading analytics...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Link Analytics</CardTitle>
          <CardDescription>Unable to load analytics data</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>
          Link Clicks {deviceType !== 'all' && `(${deviceType})`}
          {selectedLink && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              • {selectedLink.shortCode}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {totalClicks.toLocaleString()} total clicks
            {selectedLink ? ` • ${selectedLink.shortCode} only` : ` • ${analyticsData?.totalLinks || 0} links`}
            {deviceType !== 'all' && ` • ${deviceType} only`}
          </span>
          <span className="@[540px]/card:hidden">
            {totalClicks.toLocaleString()} clicks
            {deviceType !== 'all' && ` (${deviceType})`}
            {selectedLink && ` • ${selectedLink.shortCode}`}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={handleTimeRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTablet" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-tablet)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tablet)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                  formatter={(value, name) => [
                    `${value} clicks`,
                    chartConfig[name as keyof typeof chartConfig]?.label || name
                  ]}
                />
              }
            />
            {deviceType === 'all' || deviceType === 'desktop' ? (
              <Area
                dataKey="desktop"
                type="natural"
                fill="url(#fillDesktop)"
                stroke="var(--color-desktop)"
                stackId="a"
              />
            ) : null}
            {deviceType === 'all' || deviceType === 'mobile' ? (
              <Area
                dataKey="mobile"
                type="natural"
                fill="url(#fillMobile)"
                stroke="var(--color-mobile)"
                stackId="a"
              />
            ) : null}
            {deviceType === 'all' || deviceType === 'tablet' ? (
              <Area
                dataKey="tablet"
                type="natural"
                fill="url(#fillTablet)"
                stroke="var(--color-tablet)"
                stackId="a"
              />
            ) : null}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
