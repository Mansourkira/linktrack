import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 * @param password Plain text password
 * @param hash Hashed password
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

/**
 * Check if a password meets minimum requirements
 * @param password Password to validate
 * @returns Object with validation result and message
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
    if (!password || password.length < 1) {
        return { isValid: false, message: 'Password is required' }
    }

    if (password.length < 4) {
        return { isValid: false, message: 'Password must be at least 4 characters long' }
    }

    if (password.length > 128) {
        return { isValid: false, message: 'Password must be less than 128 characters' }
    }

    return { isValid: true }
}
