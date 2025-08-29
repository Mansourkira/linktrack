"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { CrudCard } from "@/components/ui/crud-card"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

import { useLinks } from "../hooks/useLinks"
import { createLinkColumns } from "../components/table-columns"
import { CreateLinkForm } from "../components/create-link-form"
import { RowActions } from "../components/row-actions"
import { getBaseUrl } from "../config"
import type { Link as LinkType } from "../types"

export function LinksPage() {
    const {
        links,
        isLoading,
        isOperationLoading,
        isCreateDialogOpen,
        formData,
        createLink,
        deleteLink,
        copyToClipboard,
        resetForm,
        updateFormData,
        toggleCreateDialog,
    } = useLinks()

    const columns = createLinkColumns(copyToClipboard)

    const rowActions = (row: LinkType) => (
        <RowActions
            link={row}
            onCopy={copyToClipboard}
            onDelete={deleteLink}
        />
    )

    const emptyState = (
        <div className="flex h-24 flex-col items-center justify-center text-center">
            <div className="text-muted-foreground">No links created yet</div>
            <div className="text-sm text-muted-foreground">
                Create your first short link to get started
            </div>
            <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => toggleCreateDialog(true)}
                disabled={isOperationLoading}
            >
                Create Link
            </Button>
        </div>
    )

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
                        <h1 className="text-2xl font-semibold">Links Management</h1>
                        <p className="text-muted-foreground">Create, manage, and track your short links</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Current Domain</div>
                    <Badge variant="outline" className="font-mono">
                        {getBaseUrl()}
                    </Badge>
                </div>
            </div>

            {/* Loading Indicator */}
            {(isLoading || isOperationLoading) && (
                <div className="mb-4 rounded-lg bg-primary/10 border border-primary/20 p-3">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-sm font-medium text-primary">
                            {isLoading ? 'Loading links...' : 'Processing...'}
                        </span>
                    </div>
                </div>
            )}

            {/* Links Table */}
            <CrudCard
                title="Links Management"
                description="Create and manage your short links"
                actions={
                    <CreateLinkForm
                        isOpen={isCreateDialogOpen}
                        onOpenChange={toggleCreateDialog}
                        formData={formData}
                        onFormDataChange={updateFormData}
                        onSubmit={createLink}
                        isSubmitting={isOperationLoading}
                        onReset={resetForm}
                    />
                }
            >
                <DataTable
                    data={links}
                    columns={columns}
                    searchKey="originalUrl"
                    rowActions={rowActions}
                    toolbar={
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleCreateDialog(true)}
                                disabled={isOperationLoading}
                            >
                                Create Link
                            </Button>
                        </div>
                    }
                    emptyState={emptyState}
                    pagination={true}
                    pageSize={10}
                />
            </CrudCard>
        </div>
    )
}
