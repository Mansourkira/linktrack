"use client"

import { useState, useEffect } from "react"
import { IconQrcode, IconDownload, IconCopy, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { getShortUrl } from "../config"
import type { Link } from "../types"

interface QRCodeDialogProps {
    link: Link | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function QRCodeDialog({ link, isOpen, onOpenChange }: QRCodeDialogProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (link && isOpen) {
            generateQRCode()
        }
    }, [link, isOpen])

    const generateQRCode = async () => {
        if (!link) return

        setIsLoading(true)
        try {
            const shortUrl = getShortUrl(link.shortCode)
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}&format=png&bgcolor=ffffff&color=000000&margin=10`
            setQrCodeUrl(qrApiUrl)
        } catch (error) {
            console.error('Error generating QR code:', error)
            toast.error('Failed to generate QR code')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!qrCodeUrl || !link) return

        try {
            const response = await fetch(qrCodeUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `qr-code-${link.shortCode}.png`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success('QR code downloaded successfully')
        } catch (error) {
            console.error('Error downloading QR code:', error)
            toast.error('Failed to download QR code')
        }
    }

    const handleCopyUrl = () => {
        if (!link) return

        const shortUrl = getShortUrl(link.shortCode)
        navigator.clipboard.writeText(shortUrl)
        toast.success('URL copied to clipboard')
    }

    if (!link) return null

    const shortUrl = getShortUrl(link.shortCode)

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-2xl">
                <DialogHeader className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                        <IconQrcode className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            QR Code
                        </DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            Scan this QR code to access your link
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Link Info */}
                    <div className="text-center space-y-3">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <div className="text-sm text-muted-foreground mb-2">Short Code</div>
                            <div className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">
                                {link.shortCode}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 break-all">
                                {shortUrl}
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex justify-center gap-2">
                            <Badge
                                variant={link.isActive ? "default" : "secondary"}
                                className={`font-semibold ${link.isActive
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                            >
                                {link.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {link.isPasswordProtected && (
                                <Badge
                                    variant="default"
                                    className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 font-semibold"
                                >
                                    Protected
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {isLoading ? (
                                <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                    <div className="text-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-2" />
                                        <div className="text-sm text-muted-foreground">Generating QR Code...</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <img
                                        src={qrCodeUrl}
                                        alt={`QR Code for ${link.shortCode}`}
                                        className="w-[300px] h-[300px] rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-lg"
                                        onError={() => {
                                            toast.error('Failed to load QR code')
                                            setIsLoading(false)
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <Button
                                            size="sm"
                                            onClick={generateQRCode}
                                            className="bg-white text-black hover:bg-gray-100"
                                        >
                                            Regenerate
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-center">
                        <Button
                            onClick={handleDownload}
                            disabled={isLoading || !qrCodeUrl}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <IconDownload className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button
                            onClick={handleCopyUrl}
                            variant="outline"
                            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
                        >
                            <IconCopy className="mr-2 h-4 w-4" />
                            Copy URL
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="text-center text-sm text-muted-foreground">
                        <div className="flex justify-center gap-4">
                            <span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">{link.clickCount}</span> clicks
                            </span>
                            <span>
                                Created {new Date(link.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
