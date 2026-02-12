import { parseAuthHeader } from '~/server/utils/jwt'

/**
 * Auth middleware to verify JWT tokens on protected routes
 * Usage: Add this middleware to protected routes
 */
export default defineEventHandler(async (event) => {
  // Skip auth check for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/posts',
    '/api/podcasts',
    '/api/tags',
    '/api/series'
  ]

  const path = getRouterParams(event)?.path || event.node.req.url || ''
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route)) && !path.includes('/admin')

  if (isPublicRoute && event.node.req.method === 'GET') {
    return
  }

  // Check for token in cookie or Authorization header
  const tokenFromCookie = getCookie(event, 'auth_token')
  const authHeader = getHeader(event, 'authorization')
  const token = tokenFromCookie || authHeader

  if (!token) {
    // Allow public GET requests without token
    if (event.node.req.method === 'GET' && isPublicRoute) {
      return
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Missing authentication token'
    })
  }

  // Parse and verify token
  const payload = parseAuthHeader(`Bearer ${token}`) || (tokenFromCookie ? { userId: '', email: '' } : null)

  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }

  // Attach user info to event context
  event.context.auth = {
    userId: payload.userId,
    email: payload.email,
    isAuthenticated: true
  }
})
