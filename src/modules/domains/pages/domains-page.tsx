"use client"

import { IconArrowLeft, IconPlus, IconCheck, IconX, IconRefresh, IconExternalLink, IconCopy } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

import { useDomains } from "../hooks/useDomains"
import { getShortUrl } from "@/modules/links/config"

export function DomainsPage() {
    const {
        domains,
        isLoading,
        isOperationLoading,
        isCreateDialogOpen,
        formData,
        createDomain,
        verifyDomain,
        deleteDomain,
        toggleDomainStatus,
        updateFormData,
        toggleCreateDialog
    } = useDomains()

    const handleCopyDNS = async (dnsRecord: string) => {
        try {
            await navigator.clipboard.writeText(dnsRecord)
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 p-6 w-full">
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-lg">Loading domains...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <IconArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold">Domain Management</h1>
                        <p className="text-muted-foreground">Manage custom domains for your links</p>
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={toggleCreateDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus className="mr-2 h-4 w-4" />
                            Add Domain
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Domain</DialogTitle>
                            <DialogDescription>
                                Add a custom domain to use with your short links
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={createDomain} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="domain">Domain Name</Label>
                                <Input
                                    id="domain"
                                    placeholder="example.com"
                                    value={formData.domain}
                                    onChange={(e) => updateFormData("domain", e.target.value)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter your domain without http:// or www
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isActive">Active</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Enable this domain immediately
                                    </div>
                                </div>
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => updateFormData("isActive", checked)}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => toggleCreateDialog(false)}
                                    disabled={isOperationLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isOperationLoading}>
                                    {isOperationLoading ? "Adding..." : "Add Domain"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Domains List */}
            <div className="space-y-4">
                {domains.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <div className="space-y-4">
                                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                    <IconExternalLink className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium">No domains yet</h3>
                                    <p className="text-muted-foreground">
                                        Add your first custom domain to get started
                                    </p>
                                </div>
                                <Button onClick={() => toggleCreateDialog(true)}>
                                    <IconPlus className="mr-2 h-4 w-4" />
                                    Add Domain
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    domains.map((domain) => (
                        <Card key={domain.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold">{domain.domain}</h3>
                                            <Badge
                                                variant={
                                                    domain.verificationStatus === 'verified' ? 'default' :
                                                        domain.verificationStatus === 'pending' ? 'secondary' : 'destructive'
                                                }
                                            >
                                                {domain.verificationStatus}
                                            </Badge>
                                            {domain.isActive && (
                                                <Badge variant="outline">Active</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleDomainStatus(domain.id)}
                                            disabled={isOperationLoading}
                                        >
                                            {domain.isActive ? 'Disable' : 'Enable'}
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <IconPlus className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => verifyDomain(domain.id)}>
                                                    <IconRefresh className="mr-2 h-4 w-4" />
                                                    Verify Domain
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => deleteDomain(domain.id)}
                                                    className="text-destructive"
                                                >
                                                    <IconX className="mr-2 h-4 w-4" />
                                                    Delete Domain
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* DNS Records */}
                                <div>
                                    <h4 className="font-medium mb-2">DNS Records</h4>
                                    <div className="space-y-2">
                                        {domain.dnsRecords.map((record, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {record.type}
                                                    </Badge>
                                                    <span className="text-sm font-mono">{record.name}</span>
                                                    <span className="text-sm font-mono text-muted-foreground">
                                                        {record.value}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {record.isVerified ? (
                                                        <IconCheck className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <IconX className="h-4 w-4 text-red-500" />
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCopyDNS(`${record.type} ${record.name} ${record.value}`)}
                                                        className="h-6 w-6 p-0"
                                                        title="Copy DNS record"
                                                    >
                                                        <IconCopy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Linked Links */}
                                {domain.linkedLinks.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Linked Links</h4>
                                        <div className="space-y-2">
                                            {domain.linkedLinks.map((link) => (
                                                <div key={link.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={getShortUrl(link.shortCode)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                        >
                                                            {link.shortCode}
                                                        </a>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {link.originalUrl}
                                                        </span>
                                                    </div>
                                                    <Badge variant={link.isActive ? "default" : "secondary"}>
                                                        {link.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Domain Info */}
                                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                                    <span>Added: {new Date(domain.createdAt).toLocaleDateString()}</span>
                                    <span>Updated: {new Date(domain.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Contributing Section */}
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-center">🚀 Open Source Project</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        This domain management system is designed for contributors to enhance and extend.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="outline">DNS verification</Badge>
                        <Badge variant="outline">SSL certificates</Badge>
                        <Badge variant="outline">Domain transfers</Badge>
                        <Badge variant="outline">Bulk operations</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Consider adding: Automatic DNS checking, SSL management, domain health monitoring, and more!
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
