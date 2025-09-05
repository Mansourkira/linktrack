import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    createLink,
    getLinks,
    getLink,
    updateLink,
    deleteLink,
    toggleLinkStatus,
    generateUniqueShortCode
} from '../links'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Link Actions', () => {
    let mockSupabase: any

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks()

        // Create mock Supabase client
        mockSupabase = {
            auth: {
                getUser: vi.fn()
            },
            from: vi.fn(() => mockSupabase),
            select: vi.fn(() => mockSupabase),
            insert: vi.fn(() => mockSupabase),
            update: vi.fn(() => mockSupabase),
            delete: vi.fn(() => mockSupabase),
            eq: vi.fn(() => mockSupabase),
            neq: vi.fn(() => mockSupabase),
            is: vi.fn(() => mockSupabase),
            or: vi.fn(() => mockSupabase),
            order: vi.fn(() => mockSupabase),
            range: vi.fn(() => mockSupabase),
            single: vi.fn(() => mockSupabase),
            rpc: vi.fn(() => mockSupabase)
        }

        vi.mocked(createClient).mockResolvedValue(mockSupabase)
    })

    describe('createLink', () => {
        it('should create a link successfully', async () => {
            const mockUser = { id: 'user-123' }
            const mockLink = {
                id: 'link-123',
                shortCode: 'test123',
                originalUrl: 'https://example.com',
                isPasswordProtected: false,
                isActive: true,
                clickCount: 0,
                ownerProfileId: 'user-123',
                createdAt: '2025-01-01T00:00:00Z'
            }

            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
            mockSupabase.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) // No existing link
            mockSupabase.insert.mockReturnValue(mockSupabase)
            mockSupabase.select.mockReturnValue(mockSupabase)
            mockSupabase.single.mockResolvedValue({ data: mockLink, error: null })

            const result = await createLink({
                shortCode: 'test123',
                originalUrl: 'https://example.com',
                isPasswordProtected: false,
                isActive: true
            })

            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockLink)
        })

        it('should fail if shortCode already exists', async () => {
            const mockUser = { id: 'user-123' }
            const existingLink = { id: 'existing-link' }

            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
            mockSupabase.single.mockResolvedValue({ data: existingLink, error: null })

            const result = await createLink({
                shortCode: 'test123',
                originalUrl: 'https://example.com',
                isPasswordProtected: false,
                isActive: true
            })

            expect(result.success).toBe(false)
            expect(result.error).toBe('Short code already exists')
        })
    })

    describe('getLinks', () => {
        it('should fetch links with default filters', async () => {
            const mockUser = { id: 'user-123' }
            const mockLinks = [
                { id: 'link-1', shortCode: 'test1', originalUrl: 'https://example1.com' },
                { id: 'link-2', shortCode: 'test2', originalUrl: 'https://example2.com' }
            ]

            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
            mockSupabase.select.mockReturnValue(mockSupabase)
            mockSupabase.order.mockReturnValue(mockSupabase)
            mockSupabase.range.mockReturnValue(mockSupabase)
            mockSupabase.single.mockResolvedValue({
                data: mockLinks,
                error: null,
                count: 2
            })

            const result = await getLinks()

            expect(result.success).toBe(true)
            expect(result.data?.links).toEqual(mockLinks)
            expect(result.data?.total).toBe(2)
            expect(result.data?.page).toBe(1)
            expect(result.data?.limit).toBe(20)
        })
    })

    describe('getLink', () => {
        it('should fetch a single link', async () => {
            const mockUser = { id: 'user-123' }
            const mockLink = {
                id: 'link-123',
                shortCode: 'test123',
                originalUrl: 'https://example.com'
            }

            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
            mockSupabase.select.mockReturnValue(mockSupabase)
            mockSupabase.single.mockResolvedValue({ data: mockLink, error: null })

            const result = await getLink('link-123')

            expect(result.success).toBe(true)
            expect(result.data).toEqual(mockLink)
        })

        it('should fail if link not found', async () => {
            const mockUser = { id: 'user-123' }

            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
            mockSupabase.select.mockReturnValue(mockSupabase)
            mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'Not found' } })

            const result = await getLink('link-123')

            expect(result.success).toBe(false)
            expect(result.error).toBe('Link not found')
        })
    })

    describe('updateLink', () => {
        it('should update a link successfully', async () => {
            const mockUser = { id: 'user-123' }
            const mockLink = {
                id: 'link-123',
                shortCode: 'test123',
                originalUrl: 'https://example.com',
                isActive: true
            }

            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
            mockSupabase.select.mockReturnValue(mockSupabase)
            mockSupabase.single.mockResolvedValue({ data: mockLink, error: null })
            mockSupabase.update.mockReturnValue(mockSupabase)
            mockSupabase.single.mockResolvedValue({ data: { ...mockLink, originalUrl: 'https://updated.com' }, error: null })

            const result = await updateLink('link-123', {
                originalUrl: 'https://updated.com'
            })

            expect(result.success).toBe(true)
            expect(result.data.originalUrl).toBe('https://updated.com')
        })
    })

    describe('deleteLink', () => {
        it('should soft delete a link', async () => {
            const mockUser = { id: 'user-123' }
            const mockLink = {
                id: 'link-123',
                ownerProfileId: 'user-123'
            }

            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
            mockSupabase.select.mockReturnValue(mockSupabase)
            mockSupabase.single.mockResolvedValue({ data: mockLink, error: null })
            mockSupabase.update.mockReturnValue(mockSupabase)
            mockSupabase.eq.mockReturnValue(mockSupabase)
            mockSupabase.eq.mockResolvedValue({ error: null })

            const result = await deleteLink('link-123')

            expect(result.success).toBe(true)
        })
    })

    describe('toggleLinkStatus', () => {
        it('should toggle link status', async () => {
            const mockUser = { id: 'user-123' }
            const mockLink = {
                id: 'link-123',
                ownerProfileId: 'user-123',
                isActive: true
            }

            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
            mockSupabase.select.mockReturnValue(mockSupabase)
            mockSupabase.single.mockResolvedValue({ data: mockLink, error: null })
            mockSupabase.update.mockReturnValue(mockSupabase)
            mockSupabase.select.mockReturnValue(mockSupabase)
            mockSupabase.single.mockResolvedValue({ data: { ...mockLink, isActive: false }, error: null })

            const result = await toggleLinkStatus('link-123')

            expect(result.success).toBe(true)
            expect(result.data.isActive).toBe(false)
        })
    })

    describe('generateUniqueShortCode', () => {
        it('should generate a unique short code', async () => {
            mockSupabase.select.mockReturnValue(mockSupabase)
            mockSupabase.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

            const result = await generateUniqueShortCode()

            expect(result).toMatch(/^[A-Za-z0-9]{6}$/)
        })

        it('should retry if code is not unique', async () => {
            // First attempt fails, second succeeds
            mockSupabase.select.mockReturnValue(mockSupabase)
            mockSupabase.single
                .mockResolvedValueOnce({ data: { id: 'existing' }, error: null }) // First attempt
                .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // Second attempt

            const result = await generateUniqueShortCode()

            expect(result).toMatch(/^[A-Za-z0-9]{6}$/)
        })
    })
}) 