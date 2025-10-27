# Workspace Implementation TODO

## Current State

The domains feature is currently using `user.id` as a temporary `workspaceId` since the workspaces functionality hasn't been fully implemented yet.

## What Needs to Change When Workspaces Are Implemented

### 1. Database Relationships
Currently: `domains.workspaceId = user.id` (temporary)  
Should be: `domains.workspaceId = actual workspace.id`

### 2. API Routes to Update

#### `/api/domains/route.ts`
**Current (temporary):**
```typescript
.eq('workspaceId', user.id)  // Temporary
```

**Should be:**
```typescript
// Get user's workspaces
const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id')
    .eq('ownerProfileId', user.id)

const workspaceIds = workspaces.map(w => w.id)

// Fetch domains for user's workspaces
.in('workspaceId', workspaceIds)
```

#### `/api/domains/[domainId]/route.ts` (all methods: GET, PATCH, DELETE)
**Current (temporary):**
```typescript
.eq('workspaceId', user.id)  // Temporary
```

**Should be:**
```typescript
// Verify user has access to the workspace
const { data: domain } = await supabase
    .from('domains')
    .select('id, workspaceId, workspaces!inner(ownerProfileId)')
    .eq('id', domainId)
    .eq('workspaces.ownerProfileId', user.id)
    .single()
```

#### `/api/domains/[domainId]/verify/route.ts`
Same changes as above.

### 3. Domain Creation
**Current (temporary):**
```typescript
const workspaceId = user.id
```

**Should be:**
```typescript
// Get or create user's default workspace
let { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('ownerProfileId', user.id)
    .single()

if (!workspace) {
    // Create default workspace
    const { data: newWorkspace } = await supabase
        .from('workspaces')
        .insert({
            ownerProfileId: user.id,
            name: `${user.email}'s Workspace`,
            slug: `workspace-${user.id.substring(0, 8)}`
        })
        .select('id')
        .single()
    
    workspace = newWorkspace
}

const workspaceId = workspace.id
```

### 4. Frontend Changes

#### `src/modules/domains/hooks/useDomains.ts`
The `fetchDomains` function should be updated to handle workspace-based filtering if needed.

## Files to Update

When implementing workspaces, search for this comment:
```
// Temporarily using user.id until workspaces are implemented
```

Or search for:
```
.eq('workspaceId', user.id)
```

Files containing temporary code:
1. ✅ `src/app/api/domains/route.ts` (GET, POST)
2. ✅ `src/app/api/domains/[domainId]/route.ts` (GET, PATCH, DELETE)
3. ✅ `src/app/api/domains/[domainId]/verify/route.ts` (POST)

## Testing After Workspace Implementation

1. Create a workspace
2. Add a domain to that workspace
3. Verify domain
4. Create links with that domain
5. Switch workspaces
6. Verify domains are isolated per workspace
7. Test workspace transfers
8. Test workspace member permissions

## Additional Considerations

### Workspace Member Permissions
When workspaces are implemented with team members, you'll need to:
- Check member roles before allowing domain management
- Implement permission levels (owner, admin, editor, viewer)
- Add workspace context to all domain operations

### Migration Strategy
When switching from user-based to workspace-based:
1. Create a migration to create workspaces for existing users
2. Move existing domains to user's default workspace
3. Update all foreign key references
4. Test data integrity

### Workspace Features for Domains
- Domain quotas per workspace/plan
- Shared domain management across team
- Domain-level analytics per workspace
- Bulk domain import for enterprise workspaces

## Code Markers

All temporary code is marked with comments like:
```typescript
// Using user.id temporarily until workspaces are implemented
// Temporarily use user.id as workspaceId
```

Use your IDE's search to find all instances when ready to implement.

---

**Status**: Domains working with temporary user.id approach  
**Priority**: Implement when workspaces feature is ready  
**Estimated Effort**: ~2-3 hours to update all routes and test

