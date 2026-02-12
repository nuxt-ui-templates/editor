import { getPostById, deletePost } from '~/server/db/queries'
import { parseAuthHeader } from '~/server/utils/jwt'
import type { D1Database } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const { id } = getRouterParams(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Post ID is required'
      })
    }

    // Check authentication
    const authHeader = getHeader(event, 'authorization')
    const auth = parseAuthHeader(authHeader)

    if (!auth) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

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

    // Check if post exists
    const post = await getPostById(db, id)
    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    // Check authorization (only author or admin can delete)
    if (post.author_id !== auth.userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden'
      })
    }

    // Delete post
    await deletePost(db, id)

    return {
      success: true,
      message: 'Post deleted successfully'
    }
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('[v0] Delete post error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete post'
    })
  }
})
