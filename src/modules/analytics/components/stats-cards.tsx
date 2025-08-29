"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconLink, IconClick, IconTrendingUp, IconActivity } from "@tabler/icons-react"
import type { AnalyticsData } from "../types"

interface StatsCardsProps {
    data: AnalyticsData
}

export function StatsCards({ data }: StatsCardsProps) {
    const stats = [
        {
            title: "Total Links",
            value: data.totalLinks,
            icon: IconLink,
            description: "All created links",
            trend: null
        },
        {
            title: "Total Clicks",
            value: data.totalClicks.toLocaleString(),
            icon: IconClick,
            description: "All-time clicks",
            trend: null
        },
        {
            title: "Active Links",
            value: data.activeLinks,
            icon: IconActivity,
            description: "Currently active",
            trend: `${Math.round((data.activeLinks / data.totalLinks) * 100)}%`
        },
        {
            title: "Avg Clicks/Link",
            value: data.averageClicksPerLink.toFixed(1),
            icon: IconTrendingUp,
            description: "Performance metric",
            trend: null
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                            {stat.trend && (
                                <div className="mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {stat.trend}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
