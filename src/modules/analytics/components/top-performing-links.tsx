"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconExternalLink, IconCopy } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import type { TopPerformingLink } from "../types"
import { getShortUrl } from "@/modules/links/config"

interface TopPerformingLinksProps {
    links: TopPerformingLink[]
}

export function TopPerformingLinks({ links }: TopPerformingLinksProps) {
    const handleCopy = async (shortCode: string) => {
        const shortUrl = getShortUrl(shortCode)
        try {
            await navigator.clipboard.writeText(shortUrl)
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleOpen = (shortCode: string) => {
        const shortUrl = getShortUrl(shortCode)
        window.open(shortUrl, '_blank')
    }

    if (links.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Links</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        No links with clicks yet. Create some links and start tracking!
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Performing Links</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {links.map((link, index) => (
                        <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-medium">
                                            {link.shortCode}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">
                                            {link.clickCount} clicks
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {link.originalUrl}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <div className="text-sm font-medium">
                                        {link.clickPercentage.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        of total clicks
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy(link.shortCode)}
                                        className="h-8 w-8 p-0"
                                        title="Copy link"
                                    >
                                        <IconCopy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpen(link.shortCode)}
                                        className="h-8 w-8 p-0"
                                        title="Open link"
                                    >
                                        <IconExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
