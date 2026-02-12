import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'

export interface AuthPayload extends JwtPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me'
const JWT_EXPIRY = '7d'

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    return decoded
  }
  catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string): string | null {
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
  return null
}

/**
 * Parse and verify Authorization header
 */
export function parseAuthHeader(authHeader?: string): AuthPayload | null {
  if (!authHeader) return null
  const token = extractToken(authHeader)
  if (!token) return null
  return verifyToken(token)
}
