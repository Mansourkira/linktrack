"use client"

import { useState, useEffect } from "react"
import { IconTrash, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getShortUrl } from "../config"
import type { Link } from "../types"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"

interface DeleteLinkDialogProps {
    link: Link | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (linkId: string) => void
    isDeleting?: boolean
}

export function DeleteLinkDialog({
    link,
    isOpen,
    onOpenChange,
    onConfirm,
    isDeleting = false
}: DeleteLinkDialogProps) {
    const [isDeletingLocal, setIsDeletingLocal] = useState(false)

    // Reset local state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setIsDeletingLocal(false)
        }
    }, [isOpen])

    const handleConfirm = async () => {
        if (!link || isDeletingLocal) return

        setIsDeletingLocal(true)
        try {
            await onConfirm(link.id)
            // Dialog will be closed by the parent component after successful deletion
        } catch (error) {
            console.error('Error deleting link:', error)
            // Keep dialog open on error so user can try again
        } finally {
            setIsDeletingLocal(false)
        }
    }

    const handleCancel = () => {
        onOpenChange(false)
    }

    if (!link) return null

    const shortUrl = getShortUrl(link.shortCode)
    const isProcessing = isDeleting || isDeletingLocal

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Link</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this link? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel} disabled={isProcessing}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isProcessing ? (
                            <>
                                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <IconTrash className="mr-2 h-4 w-4" />
                                Delete
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
