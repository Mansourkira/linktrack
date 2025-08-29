export interface Domain {
    id: string
    domain: string
    isVerified: boolean
    isActive: boolean
    verificationStatus: 'pending' | 'verified' | 'failed'
    dnsRecords: DNSRecord[]
    linkedLinks: LinkedLink[]
    createdAt: string
    updatedAt: string
    ownerProfileId: string
}

export interface DNSRecord {
    type: 'A' | 'CNAME' | 'TXT'
    name: string
    value: string
    ttl: number
    isVerified: boolean
}

export interface LinkedLink {
    id: string
    shortCode: string
    originalUrl: string
    customDomain: string
    isActive: boolean
}

export interface CreateDomainData {
    domain: string
    isActive: boolean
}

export interface DomainVerificationResult {
    isVerified: boolean
    errors: string[]
    warnings: string[]
    dnsRecords: DNSRecord[]
}

export interface DomainsState {
    domains: Domain[]
    isLoading: boolean
    isOperationLoading: boolean
    isCreateDialogOpen: boolean
    selectedDomain: Domain | null
    error: string | null
}

export interface DomainFilters {
    status: 'all' | 'verified' | 'pending' | 'failed'
    isActive: boolean | null
}
