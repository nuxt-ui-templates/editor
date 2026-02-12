import { getPostById, updatePost } from '~/server/db/queries'
import { updatePostSchema, validateRequest, generateSlug } from '~/server/utils/validation'
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

    // Check authorization (only author or admin can update)
    if (post.author_id !== auth.userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden'
      })
    }

    // Parse request body
    const body = await readBody(event)
    const postData = validateRequest(updatePostSchema, body)

    // Generate slug if title changed
    const slug = postData.title ? generateSlug(postData.title) : post.slug

    // Update post
    const updatedPost = await updatePost(db, id, {
      ...(postData.title && { title: postData.title }),
      ...(postData.slug && { slug }),
      ...(postData.description && { description: postData.description }),
      ...(postData.content && { content: postData.content }),
      ...(postData.featured_image_url !== undefined && { featured_image_url: postData.featured_image_url || null }),
      ...(postData.status && { status: postData.status }),
      updated_at: new Date()
    })

    return {
      success: true,
      data: updatedPost,
      message: 'Post updated successfully'
    }
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('[v0] Update post error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update post'
    })
  }
})
