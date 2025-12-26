# Workspace Implementation

This document describes the workspace and member management implementation.

## Overview

When a user signs up, the system now automatically:
1. Creates a profile for the user
2. Creates a workspace for the user
3. Adds the user as an owner member of that workspace

## Database Migration

Run the migration file to update the trigger function:

```sql
-- Run this in your Supabase SQL Editor
-- File: src/lib/migrations/create-workspace-on-signup.sql
```

This migration:
- Updates the `handle_new_user()` trigger function to create a workspace on signup
- Generates a workspace slug from the user's email (e.g., `john-doe` from `john.doe@example.com`)
- Creates a workspace with the name format: `{email_prefix}'s Workspace`
- Adds the user as an `owner` member in the `workspace_members` table

## API Endpoints

### Get User's Workspaces

```http
GET /api/workspaces
```

Returns all workspaces where the authenticated user is a member.

**Response:**
```json
{
  "workspaces": [
    {
      "id": "uuid",
      "name": "John's Workspace",
      "slug": "john-doe",
      "ownerProfileId": "uuid",
      "role": "owner",
      "joinedAt": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "isOwner": true
    }
  ]
}
```

### Get Workspace Members

```http
GET /api/workspaces/[workspaceId]/members
```

Returns all members of a workspace. Requires the user to be a member of the workspace.

**Response:**
```json
{
  "members": [
    {
      "profileId": "uuid",
      "workspaceId": "uuid",
      "role": "owner",
      "joinedAt": "2024-01-01T00:00:00Z",
      "profile": {
        "id": "uuid",
        "username": "johndoe",
        "email": "john@example.com",
        "fullName": "John Doe",
        "avatarUrl": null
      },
      "isOwner": true
    }
  ]
}
```

### Add Member to Workspace

```http
POST /api/workspaces/[workspaceId]/members
Content-Type: application/json

{
  "profileId": "uuid",
  "role": "viewer"  // one of: "admin", "editor", "viewer"
}
```

Adds a user to a workspace. Requires the current user to be an `owner` or `admin` of the workspace.

**Note:** The `owner` role cannot be assigned via this endpoint. Owners are only set when the workspace is created.

**Response:**
```json
{
  "member": {
    "profileId": "uuid",
    "workspaceId": "uuid",
    "role": "viewer",
    "joinedAt": "2024-01-01T00:00:00Z",
    "profile": { ... }
  }
}
```

### Update Member Role

```http
PATCH /api/workspaces/[workspaceId]/members/[profileId]
Content-Type: application/json

{
  "role": "editor"  // one of: "owner", "admin", "editor", "viewer"
}
```

Updates a member's role. Requires the current user to be an `owner` or `admin`. Only the workspace owner can change the `owner` role.

**Response:**
```json
{
  "member": {
    "profileId": "uuid",
    "workspaceId": "uuid",
    "role": "editor",
    "joinedAt": "2024-01-01T00:00:00Z",
    "profile": { ... }
  }
}
```

### Remove Member from Workspace

```http
DELETE /api/workspaces/[workspaceId]/members/[profileId]
```

Removes a member from a workspace. Users can remove themselves, or `owner`/`admin` users can remove others. The last owner cannot be removed.

**Response:**
```json
{
  "success": true
}
```

### Search Profiles

```http
GET /api/profiles/search?q=searchterm
```

Searches for profiles by email or username. Useful for finding users to add to workspaces.

**Response:**
```json
{
  "profiles": [
    {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "avatarUrl": null
    }
  ]
}
```

## Member Roles

The system supports four roles:

1. **owner**: Full control, can manage all aspects of the workspace including ownership transfer
2. **admin**: Can manage members and workspace settings (cannot change owner role)
3. **editor**: Can create and edit links, domains, etc.
4. **viewer**: Read-only access

## Permissions Matrix

| Action | Owner | Admin | Editor | Viewer |
|--------|-------|-------|--------|--------|
| View workspace | ✅ | ✅ | ✅ | ✅ |
| Add members | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ | ❌ |
| Update member roles | ✅ | ✅ | ❌ | ❌ |
| Change owner role | ✅ | ❌ | ❌ | ❌ |
| Remove self | ✅ | ✅ | ✅ | ✅ |

## Usage Examples

### Add a user to your workspace

```typescript
// First, search for the user
const searchResponse = await fetch('/api/profiles/search?q=john@example.com')
const { profiles } = await searchResponse.json()

// Add the user to your workspace
const addResponse = await fetch(`/api/workspaces/${workspaceId}/members`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    profileId: profiles[0].id,
    role: 'editor'
  })
})
```

### Update a member's role

```typescript
const updateResponse = await fetch(
  `/api/workspaces/${workspaceId}/members/${profileId}`,
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'admin'
    })
  }
)
```

### Get all your workspaces

```typescript
const response = await fetch('/api/workspaces')
const { workspaces } = await response.json()
```

## Security Notes

- All endpoints require authentication
- Users must be members of a workspace to view its members
- Only owners and admins can add/remove/update members
- Only the workspace owner can change the owner role
- The last owner cannot be removed from a workspace
- Users cannot assign the `owner` role via the API (only set during workspace creation)

## Next Steps

You may want to:
1. Create a UI for managing workspace members
2. Add workspace switching functionality
3. Implement role-based access control for links and domains
4. Add workspace-level settings and preferences

