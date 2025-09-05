"use client"

import { IconCopy, IconExternalLink, IconEye, IconEyeOff, IconLink, IconQrcode } from "@tabler/icons-react"
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
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{shortCode}</span>
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
                const linkId = row.original.id

                return (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={isActive ? "default" : "secondary"}
                            className={`cursor-pointer ${toggleLinkStatus ? 'hover:opacity-80' : ''}`}
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
                            className={`text-xs ${isProtected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
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
