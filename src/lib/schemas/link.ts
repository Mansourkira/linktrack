import { z } from "zod"

// Base link schema
export const linkSchema = z.object({
    id: z.string().uuid().optional(),
    shortCode: z.string()
        .min(1, "Short code is required")
        .max(128, "Short code must be less than 128 characters")
        .regex(/^[a-zA-Z0-9_-]+$/, "Short code can only contain letters, numbers, hyphens, and underscores"),
    originalUrl: z.string()
        .url("Must be a valid URL")
        .min(1, "URL is required"),
    isPasswordProtected: z.boolean().default(false),
    isActive: z.boolean().default(true),
    clickCount: z.number().int().min(0).default(0),
    createdAt: z.string().datetime().optional(),
    ownerProfileId: z.string().uuid().optional(),
    deletedAt: z.string().datetime().nullable().optional(),
})

// Create link schema
export const createLinkSchema = linkSchema.extend({
    password: z.string().min(1).optional()
}).omit({
    id: true,
    clickCount: true,
    createdAt: true,
    ownerProfileId: true,
    deletedAt: true
})

// Update link schema
export const updateLinkSchema = linkSchema.partial().omit({
    id: true,
    clickCount: true,
    createdAt: true,
    ownerProfileId: true,
    deletedAt: true
})

// Link response schema
export const linkResponseSchema = linkSchema.omit({
    ownerProfileId: true
})

// Links list response schema
export const linksListResponseSchema = z.object({
    links: z.array(linkResponseSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
})

// Link filters schema
export const linkFiltersSchema = z.object({
    search: z.string().optional(),
    isActive: z.boolean().optional(),
    isPasswordProtected: z.boolean().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'clickCount', 'shortCode']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Types
export type Link = z.infer<typeof linkSchema>
export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
export type LinkResponse = z.infer<typeof linkResponseSchema>
export type LinksListResponse = z.infer<typeof linksListResponseSchema>
export type LinkFilters = z.infer<typeof linkFiltersSchema> 