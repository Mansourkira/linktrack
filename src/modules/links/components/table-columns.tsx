"use client"

import { IconCopy, IconExternalLink, IconEye, IconEyeOff, IconLink } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { Link } from "../types"
import { getShortUrl } from "../config"

export const createLinkColumns = (
    copyToClipboard: (text: string) => void
): ColumnDef<Link>[] => [
        {
            accessorKey: "shortCode",
            header: "Short Code",
            cell: ({ row }) => {
                const shortCode = row.getValue("shortCode") as string
                const shortUrl = getShortUrl(shortCode)

                return (
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{shortCode}</span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(shortUrl)}
                                className="h-6 w-6 p-0"
                                title="Copy link"
                            >
                                <IconCopy className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(shortUrl, '_blank')}
                                className="h-6 w-6 p-0"
                                title="Open link"
                            >
                                <IconLink className="h-3 w-3" />
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
            cell: ({ row }) => (
                <Badge variant="secondary" className="font-mono">
                    {row.getValue("clickCount")}
                </Badge>
            ),
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean
                return (
                    <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Active" : "Inactive"}
                    </Badge>
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
                        {isProtected ? (
                            <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <IconEye className="h-4 w-4 text-muted-foreground" />
                        )}
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
