import { getPosts, getPostsCount } from '~/server/db/queries'
import { paginationSchema, validateRequest } from '~/server/utils/validation'
import type { D1Database } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Parse query parameters
    const query = getQuery(event)
    const { page, limit } = validateRequest(paginationSchema, {
      page: query.page || 1,
      limit: query.limit || 20
    })

    // Get D1 database
    const env = (event.context as any).env || {}
    const dbBinding = env.DB as any

    if (!dbBinding) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database connection unavailable'
      })
    }

    const { drizzle } = await import('drizzle-orm/d1')
    const db = drizzle(dbBinding) as D1Database

    // Fetch posts (public only)
    const posts = await getPosts(db, {
      limit,
      offset: (page - 1) * limit,
      status: 'published'
    })

    // Get total count
    const totalCount = await getPostsCount(db, 'published')
    const totalPages = Math.ceil(totalCount / limit)

    return {
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    }
  }
  catch (error) {
    console.error('[v0] Get posts error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch posts'
    })
  }
})
