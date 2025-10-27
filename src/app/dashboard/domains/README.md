# Domains Dashboard Page

## Overview

This page allows users to manage their custom domains for short link redirections.

## Features

- **View all domains**: List of all domains with their verification status
- **Add domains**: Dialog to add new custom domains
- **Verify DNS**: One-click DNS verification
- **View DNS instructions**: See required DNS records
- **Linked links**: View which links use each domain
- **Domain status management**: Enable/disable domains
- **Delete domains**: Remove domains (with safety checks)

## Usage

### Adding a Domain

1. Click "Add Domain" button
2. Enter your domain name (without http/https)
3. Click "Add Domain"
4. Follow the DNS configuration instructions

### DNS Configuration

After adding a domain, you need to configure these DNS records:

```
Type: CNAME
Name: @ (or your subdomain)
Value: linktrack.app
TTL: 3600
```

Optionally, add a TXT record for verification:
```
Type: TXT
Name: @
Value: linktrack-verification=[your-domain]
TTL: 3600
```

### Verifying a Domain

1. Configure DNS records as shown
2. Wait for DNS propagation (can take up to 48 hours)
3. Click the "Verify Domain" button in the dropdown menu
4. System will check DNS records and update status

## Components

- **DomainsPage**: Main page component
- **useDomains**: Hook for domain management logic
- **Domain API routes**: Backend API for CRUD operations

## Related Files

- `/src/modules/domains/pages/domains-page.tsx` - UI component
- `/src/modules/domains/hooks/useDomains.ts` - Business logic
- `/src/app/api/domains/` - API routes
- `/src/lib/utils/dns-verification.ts` - DNS checking utility

