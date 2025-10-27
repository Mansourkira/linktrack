import dns from 'dns/promises'

export interface DNSVerificationResult {
    isVerified: boolean
    errors: string[]
    warnings: string[]
    records: {
        type: 'A' | 'CNAME' | 'TXT'
        name: string
        value: string
        found: boolean
    }[]
}

/**
 * Verify DNS records for a custom domain
 * 
 * For production deployment, the domain should point to your app's IP or CNAME
 * This function checks if the DNS records are properly configured
 */
export async function verifyDomainDNS(domain: string): Promise<DNSVerificationResult> {
    const result: DNSVerificationResult = {
        isVerified: false,
        errors: [],
        warnings: [],
        records: []
    }

    try {
        // Expected configuration for custom domains
        // Option 1: A record pointing to your server IP
        // Option 2: CNAME record pointing to your app domain

        // For this implementation, we'll check for CNAME or A records
        let hasValidRecord = false

        // Check CNAME record
        try {
            const cnameRecords = await dns.resolveCname(domain)
            if (cnameRecords && cnameRecords.length > 0) {
                result.records.push({
                    type: 'CNAME',
                    name: domain,
                    value: cnameRecords[0],
                    found: true
                })

                // Check if CNAME points to a valid target
                // In production, you'd check if it points to your app domain
                if (cnameRecords[0].includes('vercel.app') ||
                    cnameRecords[0].includes('linktrack') ||
                    cnameRecords[0].includes('herokuapp.com')) {
                    hasValidRecord = true
                } else {
                    result.warnings.push(`CNAME points to ${cnameRecords[0]} which may not be correct`)
                }
            }
        } catch (err) {
            // CNAME not found, that's okay, we'll check A record
            result.records.push({
                type: 'CNAME',
                name: domain,
                value: '',
                found: false
            })
        }

        // Check A record if CNAME not found
        if (!hasValidRecord) {
            try {
                const aRecords = await dns.resolve4(domain)
                if (aRecords && aRecords.length > 0) {
                    result.records.push({
                        type: 'A',
                        name: domain,
                        value: aRecords[0],
                        found: true
                    })
                    hasValidRecord = true
                }
            } catch (err) {
                result.records.push({
                    type: 'A',
                    name: domain,
                    value: '',
                    found: false
                })
                result.errors.push('No A record found')
            }
        }

        // Check for TXT verification record (optional but recommended)
        try {
            const txtRecords = await dns.resolveTxt(domain)
            const verificationRecord = txtRecords.find(record =>
                record.some(txt => txt.includes('linktrack-verification'))
            )

            if (verificationRecord) {
                result.records.push({
                    type: 'TXT',
                    name: domain,
                    value: verificationRecord.join(','),
                    found: true
                })
            } else {
                result.records.push({
                    type: 'TXT',
                    name: domain,
                    value: '',
                    found: false
                })
                result.warnings.push('TXT verification record not found (optional)')
            }
        } catch (err) {
            result.records.push({
                type: 'TXT',
                name: domain,
                value: '',
                found: false
            })
        }

        // Set verification status
        if (hasValidRecord) {
            result.isVerified = true
        } else {
            result.errors.push('No valid DNS records found. Please configure your domain to point to this application.')
        }

    } catch (error) {
        console.error('DNS verification error:', error)
        result.errors.push(`DNS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
}

/**
 * Generate DNS instructions for a domain
 */
export function generateDNSInstructions(domain: string, appDomain: string = 'linktrack.app'): {
    type: 'A' | 'CNAME' | 'TXT'
    name: string
    value: string
    ttl: number
    description: string
}[] {
    return [
        {
            type: 'CNAME',
            name: '@',
            value: appDomain,
            ttl: 3600,
            description: 'Point your domain to our service (recommended)'
        },
        {
            type: 'TXT',
            name: '@',
            value: `linktrack-verification=${domain}`,
            ttl: 3600,
            description: 'Verification record to confirm domain ownership (optional)'
        }
    ]
}

