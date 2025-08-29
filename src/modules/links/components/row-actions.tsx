"use client"

import { IconEdit, IconCopy, IconTrash, IconLink } from "@tabler/icons-react"
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

    const handleOpenLink = () => {
        window.open(getShortUrl(link.shortCode), '_blank')
    }

    const handleDelete = () => {
        onDelete(link.id)
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
                <DropdownMenuItem onClick={handleOpenLink}>
                    <IconLink className="mr-2 h-4 w-4" />
                    Open Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                    <IconCopy className="mr-2 h-4 w-4" />
                    Copy Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
