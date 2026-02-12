import { compare } from 'bcryptjs'
import { generateToken, parseAuthHeader } from '~/server/utils/jwt'
import { getUserByEmail } from '~/server/db/queries'
import { loginSchema, validateRequest } from '~/server/utils/validation'
import { getDb } from '~/server/utils/db'
import type { D1Database } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Get D1 database binding from Cloudflare environment
    const env = (event.context as any).env || {}
    const dbBinding = env.DB as any

    if (!dbBinding) {
      console.error('[v0] D1 database binding not available')
      throw createError({
        statusCode: 500,
        statusMessage: 'Database connection unavailable'
      })
    }

    // Parse and validate request body
    const body = await readBody(event)
    const { email, password } = validateRequest(loginSchema, body)

    // Import drizzle here to use the binding
    const { drizzle } = await import('drizzle-orm/d1')
    const db = drizzle(dbBinding) as D1Database

    // Find user by email
    const user = await getUserByEmail(db, email)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Verify password
    const passwordMatches = await compare(password, user.password_hash)

    if (!passwordMatches) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Check if user is active
    if (!user.is_active) {
      throw createError({
        statusCode: 403,
        statusMessage: 'User account is inactive'
      })
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email)

    // Set token in HTTP-only cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('[v0] Login error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication failed'
    })
  }
})
