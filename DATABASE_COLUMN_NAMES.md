# Database Column Naming Convention

## Important: Snake Case vs Camel Case

This project uses **Drizzle ORM** which defines schemas in JavaScript/TypeScript with camelCase, but the actual PostgreSQL database uses snake_case column names.

## When to Use What

### Use CamelCase (JavaScript field names):
- When working with Drizzle ORM queries
- In TypeScript types and interfaces
- In your application code

### Use snake_case (Database column names):
- When using Supabase client directly (`.from().select()`)
- In raw SQL queries
- When writing migrations

## Domains Table Example

### Schema Definition (Drizzle):
```typescript
export const domains = pgTable("domains", {
  id: uuid("id"),
  workspaceId: uuid("workspace_id"),      // ← JavaScript: camelCase
  domain: varchar("domain"),
  status: dnsStatus("status"),
  verifiedAt: timestamp("verified_at"),   // ← JavaScript: camelCase
  createdAt: timestamp("created_at")      // ← JavaScript: camelCase
})
```

### When Using Drizzle:
```typescript
// Use JavaScript field names (camelCase)
const domains = await db
  .select()
  .from(domainsTable)
  .where(eq(domainsTable.workspaceId, userId))  // ✅ camelCase
```

### When Using Supabase Client:
```typescript
// Use database column names (snake_case)
const { data } = await supabase
  .from('domains')
  .select('id, workspace_id, verified_at, created_at')  // ✅ snake_case
  .eq('workspace_id', userId)  // ✅ snake_case
```

## Full Mapping Reference

### Domains Table
| JavaScript (Drizzle) | Database (Supabase) |
|---------------------|---------------------|
| `workspaceId` | `workspace_id` |
| `verifiedAt` | `verified_at` |
| `createdAt` | `created_at` |

### Links Table
| JavaScript (Drizzle) | Database (Supabase) |
|---------------------|---------------------|
| `ownerProfileId` | `ownerProfileId` ⚠️ |
| `domainId` | `domainId` ⚠️ |
| `shortCode` | `shortCode` ⚠️ |
| `originalUrl` | `originalUrl` ⚠️ |
| `isPasswordProtected` | `isPasswordProtected` ⚠️ |
| `isActive` | `isActive` ⚠️ |
| `clickCount` | `clickCount` ⚠️ |
| `createdAt` | `createdAt` ⚠️ |
| `updatedAt` | `updatedAt` ⚠️ |
| `deletedAt` | `deletedAt` ⚠️ |

⚠️ **Note**: The links table currently uses camelCase in the database (inconsistent with best practices). This is due to the existing schema. When querying links with Supabase, use camelCase OR quote the names:

```typescript
// Option 1: Use camelCase (works because that's the actual column name)
.eq('domainId', id)

// Option 2: Quote the column name (PostgreSQL preserves case)
.eq('"domainId"', id)

// ❌ This will fail:
.eq('domain_id', id)  // Column doesn't exist!
```

### Profiles Table
| JavaScript (Drizzle) | Database (Supabase) |
|---------------------|---------------------|
| `fullName` | `full_name` |
| `avatarUrl` | `avatar_url` |
| `themeMode` | `theme_mode` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

### Workspaces Table
| JavaScript (Drizzle) | Database (Supabase) |
|---------------------|---------------------|
| `ownerProfileId` | `owner_profile_id` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

## Common Errors

### ❌ Error: `column domains.verifiedAt does not exist`
**Cause**: Using camelCase with Supabase client
```typescript
// Wrong:
.select('verifiedAt')

// Correct:
.select('verified_at')
```

### ❌ Error: `column domains.workspace_id does not exist`
**Cause**: Database actually uses camelCase for this table
```typescript
// Check the actual table definition first!
// Some tables use camelCase, some use snake_case
```

### ❌ Error: `column links.domain_id does not exist`
**Cause**: Links table uses camelCase in database
```typescript
// Wrong:
.eq('domain_id', id)

// Correct:
.eq('domainId', id)
// OR
.eq('"domainId"', id)
```

## Best Practices

1. **Always check the schema definition** before writing queries
2. **Use Drizzle for complex queries** to avoid naming issues
3. **For Supabase client**, look at the second parameter in schema definition:
   ```typescript
   workspaceId: uuid("workspace_id")
                     ↑ This is the database column name!
   ```
4. **In migrations**, always use snake_case for new columns
5. **Document any exceptions** (like the links table using camelCase)

## Quick Reference Command

Search the schema to find database column names:
```bash
# In schema.ts, the string in quotes is the database column name:
# fieldName: type("database_column_name")
```

## Migration Strategy

When creating new tables, follow PostgreSQL conventions:
- Use **snake_case** for all column names
- This matches most PostgreSQL best practices
- Makes raw SQL queries more intuitive

Example:
```typescript
export const newTable = pgTable("new_table", {
  userId: uuid("user_id"),           // ✅ snake_case in DB
  createdAt: timestamp("created_at") // ✅ snake_case in DB
})
```

---

**Remember**: When in doubt, check `src/lib/schemas/schema.ts` to see the actual database column name in the second parameter!



