import { createPodcast } from '~/server/db/queries'
import { createPodcastSchema, validateRequest, generateSlug } from '~/server/utils/validation'
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
    const podcastData = validateRequest(createPodcastSchema, body)

    // Generate slug if not provided
    const slug = podcastData.slug || generateSlug(podcastData.title)

    // Extract YouTube video ID from URL if provided
    let youtubeVideoId: string | null = null
    if (podcastData.youtube_url) {
      const match = podcastData.youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      youtubeVideoId = match ? match[1] : null
    }

    const { drizzle } = await import('drizzle-orm/d1')
    const db = drizzle(dbBinding) as D1Database

    // Create podcast
    const podcast = await createPodcast(db, {
      title: podcastData.title,
      slug,
      description: podcastData.description,
      episode_number: podcastData.episode_number || null,
      duration_seconds: podcastData.duration_seconds || null,
      youtube_url: podcastData.youtube_url || null,
      youtube_video_id: youtubeVideoId,
      featured_image_url: podcastData.featured_image_url || null,
      transcript: podcastData.transcript || null,
      ai_analysis: podcastData.ai_analysis || null,
      author_id: auth.userId,
      status: podcastData.status,
      created_at: new Date(),
      updated_at: new Date()
    })

    return {
      success: true,
      data: podcast,
      message: 'Podcast created successfully'
    }
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('[v0] Create podcast error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create podcast'
    })
  }
})
