# Database Migration Order

Run these migrations in order:

## 1. Base Schema Setup
First, ensure your base tables are created (profiles, domains, links, etc.)

## 2. Add Domain Support to Links
```bash
psql your_database < src/lib/migrations/add-domain-id-to-links.sql
```

**What it does:**
- Adds `domainId` column to links table
- Updates unique constraint to `(shortCode, domainId)`
- Allows same short code across different domains

## 3. Fix Domains for User-Based Ownership (REQUIRED)
```bash
psql your_database < src/lib/migrations/fix-domains-for-user-based-ownership.sql
```

**What it does:**
- Removes foreign key constraint to workspaces table
- Renames `workspace_id` to `user_id` for clarity
- Sets up Row-Level Security (RLS) policies
- Allows domains to work without workspaces

**⚠️ IMPORTANT**: Run this migration before trying to create domains!

## 4. When Workspaces Are Implemented (FUTURE)
You'll need a migration to:
- Rename `user_id` back to `workspace_id`
- Create default workspaces for existing users
- Migrate domain ownership to workspaces
- Re-add foreign key constraint
- Update RLS policies

---

## Quick Start

If you're setting up for the first time:

```bash
# Run all migrations in order
psql your_database < src/lib/migrations/add-domain-id-to-links.sql
psql your_database < src/lib/migrations/fix-domains-for-user-based-ownership.sql
```

Or using Supabase SQL Editor:
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste each migration file content
3. Run them in order

---

## Troubleshooting

### Error: "column workspace_id does not exist"
**Solution**: Run migration #3 (fix-domains-for-user-based-ownership.sql)

### Error: "violates foreign key constraint"
**Solution**: Run migration #3 to remove the foreign key constraint

### Error: "violates row-level security policy"
**Solution**: Run migration #3 to set up RLS policies

---

## Verification

After running migrations, verify with:

```sql
-- Check domains table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'domains';

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'domains';

-- Check links table has domainId
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'links' AND column_name IN ('domainId', 'shortCode');
```


