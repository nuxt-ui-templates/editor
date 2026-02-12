import { getPodcastById, getPodcastTags } from '~/server/db/queries'
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

    // Get podcast
    const podcast = await getPodcastById(db, id)

    if (!podcast) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Podcast not found'
      })
    }

    // For public view, only show published podcasts
    if (podcast.status !== 'published') {
      const auth = event.context.auth as any
      if (!auth?.userId) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Podcast not found'
        })
      }
    }

    // Get podcast tags
    const tagsResult = await getPodcastTags(db, id)
    const tags = tagsResult.map((t: any) => ({
      id: t.tags.id,
      name: t.tags.name,
      slug: t.tags.slug
    }))

    return {
      success: true,
      data: { ...podcast, tags }
    }
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('[v0] Get podcast error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch podcast'
    })
  }
})
