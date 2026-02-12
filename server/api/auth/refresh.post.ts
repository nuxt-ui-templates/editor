import { parseAuthHeader, generateToken } from '~/server/utils/jwt'
import { getUserById } from '~/server/db/queries'
import type { D1Database } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Get authorization header
    const authHeader = getHeader(event, 'authorization')

    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Missing authorization header'
      })
    }

    // Parse and verify token
    const payload = parseAuthHeader(authHeader)

    if (!payload) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    // Get D1 database binding
    const env = (event.context as any).env || {}
    const dbBinding = env.DB as any

    if (!dbBinding) {
      console.error('[v0] D1 database binding not available')
      throw createError({
        statusCode: 500,
        statusMessage: 'Database connection unavailable'
      })
    }

    // Get fresh user data
    const { drizzle } = await import('drizzle-orm/d1')
    const db = drizzle(dbBinding) as D1Database
    const user = await getUserById(db, payload.userId)

    if (!user || !user.is_active) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found or inactive'
      })
    }

    // Generate new token
    const newToken = generateToken(user.id, user.email)

    // Set token in HTTP-only cookie
    setCookie(event, 'auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return {
      success: true,
      token: newToken,
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

    console.error('[v0] Token refresh error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Token refresh failed'
    })
  }
})
