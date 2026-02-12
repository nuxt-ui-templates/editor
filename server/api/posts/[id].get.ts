import { getPostById, getPostTags } from '~/server/db/queries'
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

    // Get post
    const post = await getPostById(db, id)

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    // For public view, only show published posts
    if (post.status !== 'published') {
      const auth = event.context.auth as any
      if (!auth?.userId) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Post not found'
        })
      }
    }

    // Get post tags
    const tagsResult = await getPostTags(db, id)
    const tags = tagsResult.map((t: any) => ({
      id: t.tags.id,
      name: t.tags.name,
      slug: t.tags.slug
    }))

    return {
      success: true,
      data: { ...post, tags }
    }
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('[v0] Get post error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch post'
    })
  }
})
