"use client"

import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import type { CreateLinkFormData } from "../types"
import { getShortUrl } from "../config"

interface CreateLinkFormProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    formData: CreateLinkFormData
    onFormDataChange: (field: keyof CreateLinkFormData, value: any) => void
    onSubmit: (e: React.FormEvent) => void
    isSubmitting: boolean
    onReset: () => void
}

export function CreateLinkForm({
    isOpen,
    onOpenChange,
    formData,
    onFormDataChange,
    onSubmit,
    isSubmitting,
    onReset,
}: CreateLinkFormProps) {
    const handleInputChange = (field: keyof CreateLinkFormData, value: any) => {
        onFormDataChange(field, value)
    }

    const handleCancel = () => {
        onOpenChange(false)
        onReset()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button disabled={isSubmitting}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create Link
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Link</DialogTitle>
                    <DialogDescription>
                        Create a new short link with custom settings and options
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Original URL - First and Required */}
                    <div className="space-y-2">
                        <Label htmlFor="originalUrl">Original URL *</Label>
                        <Input
                            id="originalUrl"
                            type="url"
                            placeholder="https://example.com/very-long-url"
                            value={formData.originalUrl}
                            onChange={(e) => handleInputChange("originalUrl", e.target.value)}
                            required
                        />
                        <div className="text-xs text-muted-foreground">
                            The destination URL that users will be redirected to
                        </div>
                    </div>

                    {/* Short Code - Optional */}
                    <div className="space-y-2">
                        <Label htmlFor="shortCode">Custom Short Code (Optional)</Label>
                        <Input
                            id="shortCode"
                            placeholder="Leave empty for auto-generation"
                            value={formData.shortCode}
                            onChange={(e) => handleInputChange("shortCode", e.target.value)}
                        />
                        <div className="text-xs text-muted-foreground">
                            Will be available at: {formData.shortCode ? getShortUrl(formData.shortCode) : '[generated]'}
                        </div>
                    </div>

                    {/* Password Protection - Optional */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="isPasswordProtected">Password Protected</Label>
                                <div className="text-sm text-muted-foreground">
                                    Require password to access this link
                                </div>
                            </div>
                            <Switch
                                id="isPasswordProtected"
                                checked={formData.isPasswordProtected}
                                onCheckedChange={(checked) => handleInputChange("isPasswordProtected", checked)}
                            />
                        </div>

                        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
                            <strong>Note:</strong> Password protection is enabled but password storage is not yet implemented.
                            This feature will be available in a future update.
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="isActive">Active</Label>
                            <div className="text-sm text-muted-foreground">
                                Enable or disable this link
                            </div>
                        </div>
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Link"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
