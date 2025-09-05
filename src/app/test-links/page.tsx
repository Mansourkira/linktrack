"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
    createLink,
    getLinks,
    deleteLink,
    toggleLinkStatus,
    generateUniqueShortCode
} from "@/app/actions/links"

export default function TestLinksPage() {
    const [formData, setFormData] = useState({
        originalUrl: "",
        shortCode: "",
        isPasswordProtected: false,
        isActive: true,
    })
    const [links, setLinks] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await createLink(formData)

            if (result.success) {
                toast.success('Link created successfully!')
                setFormData({ originalUrl: "", shortCode: "", isPasswordProtected: false, isActive: true })
                fetchLinks() // Refresh the list
            } else {
                toast.error(result.error || 'Failed to create link')
            }
        } catch (error) {
            toast.error('Error creating link')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchLinks = async () => {
        try {
            const result = await getLinks()
            if (result.success && result.data) {
                setLinks(result.data.links)
            }
        } catch (error) {
            console.error('Error fetching links:', error)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteLink(id)
            if (result.success) {
                toast.success('Link deleted successfully')
                fetchLinks()
            } else {
                toast.error(result.error || 'Failed to delete link')
            }
        } catch (error) {
            toast.error('Error deleting link')
        }
    }

    const handleToggleStatus = async (id: string) => {
        try {
            const result = await toggleLinkStatus(id)
            if (result.success) {
                toast.success(`Link ${result.data?.isActive ? 'activated' : 'deactivated'} successfully`)
                fetchLinks()
            } else {
                toast.error(result.error || 'Failed to toggle link status')
            }
        } catch (error) {
            toast.error('Error toggling link status')
        }
    }

    const generateCode = async () => {
        try {
            const code = await generateUniqueShortCode()
            setFormData(prev => ({ ...prev, shortCode: code }))
            toast.success(`Generated code: ${code}`)
        } catch (error) {
            toast.error('Error generating code')
        }
    }

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Links Server Actions Test</h1>
                <p className="text-muted-foreground">Test the new server actions integration</p>
            </div>

            {/* Create Link Form */}
            <div className="max-w-md mx-auto space-y-4">
                <h2 className="text-xl font-semibold">Create New Link</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="originalUrl">Original URL *</Label>
                        <Input
                            id="originalUrl"
                            type="url"
                            placeholder="https://example.com"
                            value={formData.originalUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, originalUrl: e.target.value }))}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="shortCode">Custom Short Code (Optional)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="shortCode"
                                placeholder="Leave empty for auto-generation"
                                value={formData.shortCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, shortCode: e.target.value }))}
                            />
                            <Button type="button" onClick={generateCode} variant="outline">
                                Generate
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isPasswordProtected"
                            checked={formData.isPasswordProtected}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPasswordProtected: checked }))}
                        />
                        <Label htmlFor="isPasswordProtected">Password Protected</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label htmlFor="isActive">Active</Label>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Creating...' : 'Create Link'}
                    </Button>
                </form>
            </div>

            {/* Links List */}
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Your Links</h2>
                    <Button onClick={fetchLinks} variant="outline">
                        Refresh
                    </Button>
                </div>

                <div className="space-y-2">
                    {links.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <div className="font-mono text-sm">{link.shortCode}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {link.originalUrl}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Clicks: {link.clickCount}</span>
                                    <span>Status: {link.isActive ? 'Active' : 'Inactive'}</span>
                                    <span>Protected: {link.isPasswordProtected ? 'Yes' : 'No'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant={link.isActive ? "outline" : "default"}
                                    onClick={() => handleToggleStatus(link.id)}
                                >
                                    {link.isActive ? 'Deactivate' : 'Activate'}
                                </Button>

                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(link.id)}
                                >
                                    Delete
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(`/api/links/${link.id}/qr?size=200`, '_blank')}
                                >
                                    QR Code
                                </Button>
                            </div>
                        </div>
                    ))}

                    {links.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No links created yet. Create your first link above!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 