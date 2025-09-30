"use client"

import { IconCopy, IconExternalLink, IconCalendar, IconClick, IconShield, IconShieldOff, IconSearch } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RowActions } from "./row-actions"
import { getShortUrl } from "../config"
import type { Link } from "../types"
import { useState } from "react"

interface LinksCardViewProps {
    links: Link[]
    onCopy: (text: string) => void
    onDelete: (link: Link) => void
    searchTerm: string
    onSearchChange: (term: string) => void
    searchPlaceholder?: string
    emptyState?: React.ReactNode
}

export function LinksCardView({
    links,
    onCopy,
    onDelete,
    searchTerm,
    onSearchChange,
    searchPlaceholder = "Search links...",
    emptyState
}: LinksCardViewProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopy = (shortCode: string) => {
        const shortUrl = getShortUrl(shortCode)
        onCopy(shortUrl)
        setCopiedId(shortCode)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const filteredLinks = links.filter(link =>
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filteredLinks.length === 0) {
        return (
            <div className="space-y-4">
                <div className="relative">
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
                </div>
                {emptyState}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLinks.map((link) => (
                    <Card key={link.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-mono text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group">
                                            <a
                                                href={getShortUrl(link.shortCode)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="truncate"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {link.shortCode}
                                            </a>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(link.shortCode)}
                                                className="h-5 w-5 p-0 text-white hover:bg-white/20 transition-colors"
                                                title="Copy short URL"
                                            >
                                                <IconCopy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={link.originalUrl}>
                                        {link.originalUrl}
                                    </div>
                                </div>
                                <RowActions
                                    link={link}
                                    onCopy={onCopy}
                                    onDelete={onDelete}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {/* Stats Row */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1">
                                        <IconClick className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-mono">{link.clickCount}</span>
                                        <span className="text-muted-foreground">clicks</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {new Date(link.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Row */}
                                <div className="flex items-center justify-between">
                                    <Badge variant={link.isActive ? "default" : "secondary"}>
                                        {link.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        {link.isPasswordProtected ? (
                                            <>
                                                <IconShield className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">Protected</span>
                                            </>
                                        ) : (
                                            <>
                                                <IconShieldOff className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">Public</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Row */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(link.originalUrl, '_blank')}
                                        className="h-8 px-2"
                                    >
                                        <IconExternalLink className="h-4 w-4 mr-1" />
                                        <span className="text-xs">Visit</span>
                                    </Button>
                                    {copiedId === link.shortCode && (
                                        <Badge variant="outline" className="text-xs">
                                            Copied!
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
