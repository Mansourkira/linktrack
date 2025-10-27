# Custom Domains Implementation Guide

## Overview

This document describes the professional implementation of custom domains feature for the LinkTrack application. Users can now add their own domains and use them for short link redirections instead of the default `linktrack.app` domain.

## Features Implemented

### 1. Database Schema
- **Added `domainId` field to `links` table**: Links can now be associated with custom domains
- **Modified unique constraint**: `shortCode` + `domainId` combination is unique (allows same short code across different domains)
- **Domain verification status**: Domains have verification statuses (unverified, pending, verified, failed)

### 2. Domain Management API

#### POST `/api/domains`
Create a new custom domain:
```typescript
Request: { domain: "go.yourdomain.com" }
Response: { domain: DomainObject }
```

#### GET `/api/domains`
Fetch all domains for the authenticated user:
```typescript
Response: { domains: DomainObject[] }
```

#### GET `/api/domains/[domainId]`
Get a specific domain with details:
```typescript
Response: { domain: DomainObject }
```

#### PATCH `/api/domains/[domainId]`
Update a domain (change status):
```typescript
Request: { status: "verified" | "failed" | "unverified" }
Response: { domain: DomainObject }
```

#### DELETE `/api/domains/[domainId]`
Delete a domain (only if no links are associated):
```typescript
Response: { success: true }
```

#### POST `/api/domains/[domainId]/verify`
Verify DNS records for a domain:
```typescript
Response: { 
  domain: DomainObject,
  verification: {
    isVerified: boolean,
    errors: string[],
    warnings: string[],
    records: DNSRecord[]
  }
}
```

### 3. DNS Verification System

The DNS verification utility (`src/lib/utils/dns-verification.ts`) checks:
- **CNAME records**: Domain pointing to your app
- **A records**: Fallback if CNAME not found
- **TXT records**: Optional verification record

### 4. Custom Domain Routing

The middleware (`middleware.ts`) now:
- Detects custom domain requests
- Verifies domain status
- Routes to appropriate link resolution
- Shows appropriate error pages for unverified/unknown domains

### 5. Link Creation with Domain Selection

Users can now:
- Select a domain when creating links
- See preview of the full URL (domain + short code)
- Links are scoped to specific domains
- Same short code can exist on different domains

### 6. Domain Management UI

Features:
- List all domains with verification status
- Add new domains via dialog
- Verify DNS records with one click
- View DNS configuration instructions
- See linked links for each domain
- Enable/disable domains
- Delete domains (with safety checks)

## How It Works

### For Users

1. **Add a Domain**
   - Go to Dashboard → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `go.yourcompany.com`)
   - Click "Add Domain"

2. **Configure DNS**
   - After adding, you'll see DNS records to configure
   - Add these records in your domain's DNS settings:
     ```
     Type: CNAME
     Name: @ (or your subdomain)
     Value: linktrack.app (or your app domain)
     TTL: 3600
     ```

3. **Verify Domain**
   - Once DNS is configured, click "Verify Domain"
   - System checks DNS records in real-time
   - Status changes to "Verified" if successful

4. **Create Links on Custom Domain**
   - When creating a link, select your domain from the dropdown
   - The short link will work on your custom domain
   - Example: `https://go.yourcompany.com/promo`

### Technical Flow

```
User visits: https://go.yourcompany.com/promo
    ↓
Middleware checks if go.yourcompany.com is a verified custom domain
    ↓
If verified → Continue to link resolution
    ↓
[slug]/page.tsx or API looks up link with:
  - shortCode = "promo"
  - domainId = (id of go.yourcompany.com)
    ↓
If found → Redirect to originalUrl
If not found → 404
```

## Database Migration

To apply the schema changes, run:

```sql
-- Run the migration
\i src/lib/migrations/add-domain-id-to-links.sql
```

Or if using a migration tool:
```bash
# Using Drizzle Kit (example)
npx drizzle-kit push:pg
```

## Configuration

### Environment Variables
No additional environment variables needed. The system uses existing Supabase configuration.

### DNS Setup (For Production)

When deploying to production, ensure:
1. Your app is accessible via a stable domain
2. SSL certificates are configured
3. Update DNS verification logic to check for your production domain

## Security Considerations

1. **Domain Verification**: Only verified domains can be used
2. **Ownership**: Users can only manage their own domains
3. **Link Isolation**: Links on custom domains are separate from default domain
4. **DNS Validation**: Real-time DNS checking prevents misconfiguration

## Future Enhancements

Potential improvements (for contributors):

1. **Automatic SSL Certificate Generation** (Let's Encrypt integration)
2. **Domain Health Monitoring** (periodic DNS checks)
3. **Custom Domain Analytics** (per-domain statistics)
4. **Bulk Domain Import** (CSV upload)
5. **Domain Transfer** (between workspaces)
6. **Wildcard Domains** (*.yourcompany.com)
7. **Custom Error Pages** (per domain)
8. **Domain API Keys** (domain-specific authentication)

## Testing

### Manual Testing

1. **Add Domain**
   ```
   - Go to /dashboard/domains
   - Click "Add Domain"
   - Enter: test.example.com
   - Verify it appears in the list
   ```

2. **Create Link with Custom Domain**
   ```
   - Go to /dashboard/links
   - Click "Create Link"
   - Select your custom domain
   - Enter original URL
   - Create link
   ```

3. **Test Redirect**
   ```
   - Visit the short link URL
   - Verify it redirects correctly
   - Check click count increments
   ```

### API Testing

Using curl or Postman:

```bash
# Create domain
curl -X POST http://localhost:3000/api/domains \
  -H "Content-Type: application/json" \
  -d '{"domain": "go.example.com"}'

# Verify domain
curl -X POST http://localhost:3000/api/domains/[domainId]/verify

# Create link with domain
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "shortCode": "test",
    "originalUrl": "https://example.com",
    "domainId": "[domainId]"
  }'
```

## Troubleshooting

### Domain verification fails
- Check DNS propagation (can take 24-48 hours)
- Verify CNAME/A records are correct
- Use `dig` or `nslookup` to check DNS:
  ```bash
  dig go.example.com CNAME
  ```

### Custom domain not routing
- Check middleware is running
- Verify domain status is "verified" in database
- Check browser console for errors

### Links not working on custom domain
- Verify `domainId` is set correctly in links table
- Check that short code exists for that domain
- Review API redirect logs

## Support

For questions or issues:
1. Check this documentation
2. Review the code comments
3. Open an issue on GitHub
4. Join the community Discord

---

**Implementation Date**: 2025-10-19  
**Version**: 1.0.0  
**Author**: AI Assistant (Claude)

