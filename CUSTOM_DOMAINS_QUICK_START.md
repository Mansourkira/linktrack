# Custom Domains - Quick Start Guide

## 🚀 What's New?

Your LinkTrack application now supports **custom domains**! Users can add their own domains (like `go.yourcompany.com`) and create short links on those domains instead of using the default domain.

## 📋 Implementation Checklist

### 1. Apply Database Migration

Run the SQL migration to add domain support to your links table:

```sql
\i src/lib/migrations/add-domain-id-to-links.sql
```

Or if you're using Drizzle:
```bash
npx drizzle-kit push:pg
```

### 2. Verify Schema Changes

The schema has been updated:
- ✅ `links` table now has `domainId` field
- ✅ Unique constraint updated to `(shortCode, domainId)`
- ✅ Indexes added for performance

### 3. Test the Feature

**Frontend Testing:**
1. Start your dev server: `npm run dev`
2. Navigate to `/dashboard/domains`
3. Click "Add Domain" and try adding a test domain
4. Go to `/dashboard/links` and create a link
5. Select a domain from the dropdown

**API Testing:**
```bash
# Test domain creation
curl -X POST http://localhost:3000/api/domains \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"domain": "go.example.com"}'

# Test domain verification
curl -X POST http://localhost:3000/api/domains/[domainId]/verify \
  -H "Cookie: your-auth-cookie"
```

## 🎯 How It Works for End Users

### Step 1: Add a Custom Domain
```
Dashboard → Domains → Add Domain
Enter: go.yourcompany.com
```

### Step 2: Configure DNS
After adding, users will see DNS records to configure:
```
CNAME Record:
  Name: @ (or subdomain)
  Value: linktrack.app (your main domain)
  TTL: 3600
```

### Step 3: Verify Domain
```
Click "Verify Domain" → System checks DNS → Status updates to "Verified"
```

### Step 4: Create Links on Custom Domain
```
Create Link → Select Domain: go.yourcompany.com → Enter URL → Create
Result: https://go.yourcompany.com/abc123
```

## 🏗️ Architecture

### Request Flow
```
User visits: https://go.yourcompany.com/promo
    ↓
[middleware.ts] Checks if domain is verified
    ↓
[/[slug]/page.tsx] Looks up link with shortCode + domainId
    ↓
Redirects to original URL
```

### File Structure
```
src/
├── app/
│   ├── api/
│   │   └── domains/
│   │       ├── route.ts (GET, POST)
│   │       └── [domainId]/
│   │           ├── route.ts (GET, PATCH, DELETE)
│   │           └── verify/
│   │               └── route.ts (POST)
│   └── dashboard/
│       └── domains/
│           └── page.tsx (Dashboard page)
├── modules/
│   └── domains/
│       ├── hooks/
│       │   └── useDomains.ts (Business logic)
│       ├── pages/
│       │   └── domains-page.tsx (UI component)
│       └── types/
│           └── index.ts (TypeScript types)
├── lib/
│   ├── schemas/
│   │   └── schema.ts (Database schema - UPDATED)
│   ├── migrations/
│   │   └── add-domain-id-to-links.sql (NEW)
│   └── utils/
│       └── dns-verification.ts (NEW)
└── middleware.ts (UPDATED - handles custom domains)
```

## 🔒 Security Features

- ✅ Domain ownership verified through DNS
- ✅ Only verified domains can be used
- ✅ User can only manage their own domains
- ✅ Links isolated per domain
- ✅ Real-time DNS validation

## 🎨 UI Features

### Domains Dashboard
- List view with status badges
- DNS record display with copy buttons
- Linked links counter
- Enable/disable toggle
- Delete with safety checks

### Link Creation
- Domain selector dropdown
- Real-time URL preview
- Auto-loads verified domains
- Link to add domains if none exist

## ⚙️ Configuration

### For Development
No additional setup needed! The feature uses your existing Supabase configuration.

### For Production
1. Ensure your app domain is stable
2. Configure SSL certificates
3. Update DNS verification logic if needed (in `dns-verification.ts`)
4. Set up proper CORS if using API from external domains

## 🧪 Testing Scenarios

### Scenario 1: Add and Verify Domain
1. Add domain: `test.example.com`
2. Configure DNS (or mock for testing)
3. Click verify
4. Status should change to "verified" or "failed"

### Scenario 2: Create Link with Custom Domain
1. Add and verify a domain
2. Create new link
3. Select custom domain
4. Create link
5. Verify link works at custom domain URL

### Scenario 3: Same Short Code, Different Domains
1. Create link with shortCode "promo" on default domain
2. Create link with shortCode "promo" on custom domain
3. Both should work independently
4. No conflicts should occur

## 📊 Database Updates

### Before
```sql
CREATE UNIQUE INDEX links_shortcode_unique ON links(shortCode);
```

### After
```sql
CREATE UNIQUE INDEX links_shortcode_domain_unique ON links(shortCode, domainId);
```

This allows the same short code to exist across different domains!

## 🐛 Troubleshooting

### "Domain verification failed"
- **Cause**: DNS not configured or not propagated
- **Solution**: Check DNS with `dig` or `nslookup`, wait up to 48h for propagation

### "Cannot delete domain"
- **Cause**: Domain has linked links
- **Solution**: Remove or reassign links first

### Custom domain not routing
- **Cause**: Middleware not detecting domain
- **Solution**: Check middleware matcher config and domain verification status

### Links API not including domainId
- **Cause**: Schema not migrated
- **Solution**: Run the migration SQL file

## 📚 Additional Resources

- **Full Documentation**: See `DOMAINS_IMPLEMENTATION.md`
- **API Documentation**: See inline comments in API route files
- **DNS Setup Guide**: See `src/app/dashboard/domains/README.md`

## 🚀 Next Steps

1. Run the migration
2. Test the feature locally
3. Deploy to staging
4. Test with real domain
5. Deploy to production

## 💡 Pro Tips

- Start with a subdomain (e.g., `go.example.com`) rather than root domain
- Use DNS services with fast propagation (Cloudflare, Route53)
- Test verification in dev with localhost before production
- Monitor DNS verification success rates
- Consider implementing SSL auto-renewal (Let's Encrypt)

---

**Need Help?** Check the full documentation in `DOMAINS_IMPLEMENTATION.md`

**Ready to enhance?** See "Future Enhancements" section for ideas!

