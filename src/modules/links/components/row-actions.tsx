"use client"

import { IconEdit, IconCopy, IconTrash, IconEye, IconQrcode } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import type { Link } from "../types"
import { getShortUrl } from "../config"

interface RowActionsProps {
    link: Link
    onCopy: (text: string) => void
    onDelete: (id: string) => void
}

export function RowActions({ link, onCopy, onDelete }: RowActionsProps) {
    const handleCopy = () => {
        onCopy(getShortUrl(link.shortCode))
    }

    const handleViewLink = () => {
        window.open(getShortUrl(link.shortCode), '_blank')
    }

    const handleEditLink = () => {
        // TODO: Implement edit functionality
        console.log('Edit link:', link.id)
    }

    const handleDelete = () => {
        onDelete(link.id)
    }

    const handleQRCode = () => {
        window.open(`/api/links/${link.id}/qr?size=200`, '_blank')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <IconEdit className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewLink}>
                    <IconEye className="mr-2 h-4 w-4" />
                    View Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                    <IconCopy className="mr-2 h-4 w-4" />
                    Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleQRCode}>
                    <IconQrcode className="mr-2 h-4 w-4" />
                    QR Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEditLink}>
                    <IconEdit className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
