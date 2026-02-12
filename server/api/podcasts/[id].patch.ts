import { getPodcastById, updatePodcast } from '~/server/db/queries'
import { updatePodcastSchema, validateRequest, generateSlug } from '~/server/utils/validation'
import { parseAuthHeader } from '~/server/utils/jwt'
import type { D1Database } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const { id } = getRouterParams(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Podcast ID is required'
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

    // Check if podcast exists
    const podcast = await getPodcastById(db, id)
    if (!podcast) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Podcast not found'
      })
    }

    // Check authorization (only author or admin can update)
    if (podcast.author_id !== auth.userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden'
      })
    }

    // Parse request body
    const body = await readBody(event)
    const podcastData = validateRequest(updatePodcastSchema, body)

    // Generate slug if title changed
    const slug = podcastData.title ? generateSlug(podcastData.title) : podcast.slug

    // Extract YouTube video ID if URL changed
    let youtubeVideoId = podcast.youtube_video_id
    if (podcastData.youtube_url && podcastData.youtube_url !== podcast.youtube_url) {
      const match = podcastData.youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      youtubeVideoId = match ? match[1] : null
    }

    // Update podcast
    const updatedPodcast = await updatePodcast(db, id, {
      ...(podcastData.title && { title: podcastData.title }),
      ...(podcastData.slug && { slug }),
      ...(podcastData.description && { description: podcastData.description }),
      ...(podcastData.episode_number !== undefined && { episode_number: podcastData.episode_number || null }),
      ...(podcastData.duration_seconds !== undefined && { duration_seconds: podcastData.duration_seconds || null }),
      ...(podcastData.youtube_url !== undefined && { youtube_url: podcastData.youtube_url || null, youtube_video_id: youtubeVideoId }),
      ...(podcastData.featured_image_url !== undefined && { featured_image_url: podcastData.featured_image_url || null }),
      ...(podcastData.transcript !== undefined && { transcript: podcastData.transcript || null }),
      ...(podcastData.ai_analysis !== undefined && { ai_analysis: podcastData.ai_analysis || null }),
      ...(podcastData.status && { status: podcastData.status }),
      updated_at: new Date()
    })

    return {
      success: true,
      data: updatedPodcast,
      message: 'Podcast updated successfully'
    }
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('[v0] Update podcast error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update podcast'
    })
  }
})
