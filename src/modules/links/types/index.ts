export interface Link {
    id: string
    shortCode: string
    originalUrl: string
    isPasswordProtected: boolean
    isActive: boolean
    clickCount: number
    createdAt: string
    ownerProfileId: string
}

export interface CreateLinkFormData {
    originalUrl: string
    shortCode: string
    isPasswordProtected: boolean
    isActive: boolean
}

export interface LinksState {
    links: Link[]
    isLoading: boolean
    isOperationLoading: boolean
    isCreateDialogOpen: boolean
}

export interface LinkColumn {
    accessorKey: keyof Link
    header: string
    cell: (props: { row: any }) => React.ReactNode
}

export interface LinkConfig {
    baseUrl: string
    shortUrl: (shortCode: string) => string
}
