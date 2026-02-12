import { createPost } from '~/server/db/queries'
import { createPostSchema, validateRequest, generateSlug } from '~/server/utils/validation'
import { parseAuthHeader } from '~/server/utils/jwt'
import type { D1Database } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
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

    // Parse request body
    const body = await readBody(event)
    const postData = validateRequest(createPostSchema, body)

    // Generate slug if not provided
    const slug = postData.slug || generateSlug(postData.title)

    const { drizzle } = await import('drizzle-orm/d1')
    const db = drizzle(dbBinding) as D1Database

    // Create post
    const post = await createPost(db, {
      title: postData.title,
      slug,
      description: postData.description,
      content: postData.content,
      featured_image_url: postData.featured_image_url || null,
      author_id: auth.userId,
      status: postData.status,
      created_at: new Date(),
      updated_at: new Date()
    })

    return {
      success: true,
      data: post,
      message: 'Post created successfully'
    }
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('[v0] Create post error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create post'
    })
  }
})
