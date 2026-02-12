import { getTags } from '~/server/db/queries'
import { paginationSchema, validateRequest } from '~/server/utils/validation'
import type { D1Database } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { page, limit } = validateRequest(paginationSchema, {
      page: query.page || 1,
      limit: query.limit || 50
    })

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

    const tags = await getTags(db, limit, (page - 1) * limit)

    return {
      success: true,
      data: tags
    }
  }
  catch (error) {
    console.error('[v0] Get tags error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tags'
    })
  }
})
