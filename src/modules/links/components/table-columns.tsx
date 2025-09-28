"use client"

import { IconCopy, IconExternalLink } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { Link } from "../types"
import { getShortUrl } from "../config"

export const createLinkColumns = (
    copyToClipboard: (text: string) => void,
    toggleLinkStatus?: (id: string) => void
): ColumnDef<Link>[] => [
        {
            accessorKey: "shortCode",
            header: "Short Code",
            cell: ({ row }) => {
                const shortCode = row.getValue("shortCode") as string
                const shortUrl = getShortUrl(shortCode)
                return (
                    <div className="flex items-center gap-3 group">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-md font-mono text-sm font-semibold shadow-sm">
                            {shortCode}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(shortUrl)}
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                                title="Copy short URL"
                            >
                                <IconCopy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(shortUrl, '_blank')}
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-50"
                                title="Open short URL"
                            >
                                <IconExternalLink className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "originalUrl",
            header: "Original URL",
            cell: ({ row }) => {
                const url = row.getValue("originalUrl") as string
                return (
                    <div className="max-w-[200px]">
                        <div className="truncate text-sm">{url}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(url, '_blank')}
                                className="h-6 w-6 p-0"
                                title="Open original URL"
                            >
                                <IconExternalLink className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "clickCount",
            header: "Clicks",
            cell: ({ row }) => {
                const clickCount = row.getValue("clickCount") as number
                return (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="secondary"
                            className={`font-mono font-semibold ${clickCount === 0 ? 'bg-gray-100 text-gray-600' :
                                    clickCount < 5 ? 'bg-blue-100 text-blue-700' :
                                        clickCount < 20 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                }`}
                        >
                            {clickCount}
                        </Badge>
                        {clickCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {clickCount < 5 ? 'Low' : clickCount < 20 ? 'Medium' : 'High'}
                            </span>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean
                const linkId = row.original.id

                return (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={isActive ? "default" : "secondary"}
                            className={`cursor-pointer font-semibold ${isActive
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                } ${toggleLinkStatus ? 'hover:opacity-80' : ''}`}
                            onClick={() => toggleLinkStatus?.(linkId)}
                            title={toggleLinkStatus ? "Click to toggle status" : ""}
                        >
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: "isPasswordProtected",
            header: "Protected",
            cell: ({ row }) => {
                const isProtected = row.getValue("isPasswordProtected") as boolean
                return (
                    <div className="flex items-center">
                        <Badge
                            variant={isProtected ? "default" : "secondary"}
                            className={`text-xs font-semibold ${isProtected
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {isProtected ? "ON" : "OFF"}
                        </Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"))
                return (
                    <div className="text-sm text-muted-foreground">
                        {date.toLocaleDateString()}
                    </div>
                )
            },
        },
    ]
