import { eq, and, or, desc, asc, like, isNotNull } from 'drizzle-orm'
import type { D1Database } from '../utils/db'
import {
  users,
  posts,
  podcasts,
  tags,
  postTags,
  podcastTags,
  series,
  images
} from './schema'
import type { NewPost, NewPodcast, NewTag, NewSeries, NewUser, Post, Podcast, Tag, Series, User } from './schema'

/**
 * USER QUERIES
 */

export async function getUserByEmail(db: D1Database, email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).get()
  return result || null
}

export async function getUserById(db: D1Database, id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).get()
  return result || null
}

export async function createUser(db: D1Database, user: NewUser) {
  const result = await db.insert(users).values(user).returning()
  return result[0]
}

export async function updateUser(db: D1Database, id: string, data: Partial<NewUser>) {
  const result = await db
    .update(users)
    .set({ ...data, updated_at: new Date() })
    .where(eq(users.id, id))
    .returning()
  return result[0] || null
}

/**
 * POST QUERIES
 */

export async function getPosts(
  db: D1Database,
  options?: {
    limit?: number
    offset?: number
    status?: string
    search?: string
    tagId?: string
    seriesId?: string
    authorId?: string
  }
) {
  let query = db.select().from(posts)

  const conditions = []

  if (options?.status) {
    conditions.push(eq(posts.status, options.status))
  }

  if (options?.authorId) {
    conditions.push(eq(posts.author_id, options.authorId))
  }

  if (options?.seriesId) {
    conditions.push(eq(posts.series_id, options.seriesId))
  }

  if (options?.search) {
    conditions.push(
      or(
        like(posts.title, `%${options.search}%`),
        like(posts.description, `%${options.search}%`)
      )
    )
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions))
  }

  query = query.orderBy(desc(posts.published_at), desc(posts.created_at))

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.offset(options.offset)
  }

  return await query
}

export async function getPostBySlug(db: D1Database, slug: string) {
  const result = await db.select().from(posts).where(eq(posts.slug, slug)).get()
  return result || null
}

export async function getPostById(db: D1Database, id: string) {
  const result = await db.select().from(posts).where(eq(posts.id, id)).get()
  return result || null
}

export async function createPost(db: D1Database, post: NewPost) {
  const result = await db.insert(posts).values(post).returning()
  return result[0]
}

export async function updatePost(db: D1Database, id: string, data: Partial<NewPost>) {
  const result = await db
    .update(posts)
    .set({ ...data, updated_at: new Date() })
    .where(eq(posts.id, id))
    .returning()
  return result[0] || null
}

export async function deletePost(db: D1Database, id: string) {
  await db.delete(posts).where(eq(posts.id, id))
}

export async function getPostsCount(db: D1Database, status?: string) {
  const condition = status ? eq(posts.status, status) : undefined
  const result = await db
    .select({ count: 'COUNT(*)' })
    .from(posts)
    .where(condition)
    .get()
  return result?.count || 0
}

/**
 * PODCAST QUERIES
 */

export async function getPodcasts(
  db: D1Database,
  options?: {
    limit?: number
    offset?: number
    status?: string
    search?: string
    tagId?: string
    seriesId?: string
    authorId?: string
  }
) {
  let query = db.select().from(podcasts)

  const conditions = []

  if (options?.status) {
    conditions.push(eq(podcasts.status, options.status))
  }

  if (options?.authorId) {
    conditions.push(eq(podcasts.author_id, options.authorId))
  }

  if (options?.seriesId) {
    conditions.push(eq(podcasts.series_id, options.seriesId))
  }

  if (options?.search) {
    conditions.push(
      or(
        like(podcasts.title, `%${options.search}%`),
        like(podcasts.description, `%${options.search}%`)
      )
    )
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions))
  }

  query = query.orderBy(desc(podcasts.published_at), desc(podcasts.created_at))

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.offset(options.offset)
  }

  return await query
}

export async function getPodcastBySlug(db: D1Database, slug: string) {
  const result = await db.select().from(podcasts).where(eq(podcasts.slug, slug)).get()
  return result || null
}

export async function getPodcastById(db: D1Database, id: string) {
  const result = await db.select().from(podcasts).where(eq(podcasts.id, id)).get()
  return result || null
}

export async function createPodcast(db: D1Database, podcast: NewPodcast) {
  const result = await db.insert(podcasts).values(podcast).returning()
  return result[0]
}

export async function updatePodcast(db: D1Database, id: string, data: Partial<NewPodcast>) {
  const result = await db
    .update(podcasts)
    .set({ ...data, updated_at: new Date() })
    .where(eq(podcasts.id, id))
    .returning()
  return result[0] || null
}

export async function deletePodcast(db: D1Database, id: string) {
  await db.delete(podcasts).where(eq(podcasts.id, id))
}

export async function getPodcastsCount(db: D1Database, status?: string) {
  const condition = status ? eq(podcasts.status, status) : undefined
  const result = await db
    .select({ count: 'COUNT(*)' })
    .from(podcasts)
    .where(condition)
    .get()
  return result?.count || 0
}

/**
 * TAG QUERIES
 */

export async function getTags(db: D1Database, limit?: number, offset?: number) {
  let query = db.select().from(tags).orderBy(asc(tags.name))

  if (limit) {
    query = query.limit(limit)
  }

  if (offset) {
    query = query.offset(offset)
  }

  return await query
}

export async function getTagBySlug(db: D1Database, slug: string) {
  const result = await db.select().from(tags).where(eq(tags.slug, slug)).get()
  return result || null
}

export async function getTagById(db: D1Database, id: string) {
  const result = await db.select().from(tags).where(eq(tags.id, id)).get()
  return result || null
}

export async function createTag(db: D1Database, tag: NewTag) {
  const result = await db.insert(tags).values(tag).returning()
  return result[0]
}

export async function updateTag(db: D1Database, id: string, data: Partial<NewTag>) {
  const result = await db
    .update(tags)
    .set(data)
    .where(eq(tags.id, id))
    .returning()
  return result[0] || null
}

export async function deleteTag(db: D1Database, id: string) {
  await db.delete(tags).where(eq(tags.id, id))
}

/**
 * SERIES QUERIES
 */

export async function getSeries(db: D1Database, limit?: number, offset?: number) {
  let query = db
    .select()
    .from(series)
    .where(eq(series.is_active, true))
    .orderBy(desc(series.created_at))

  if (limit) {
    query = query.limit(limit)
  }

  if (offset) {
    query = query.offset(offset)
  }

  return await query
}

export async function getSeriesBySlug(db: D1Database, slug: string) {
  const result = await db
    .select()
    .from(series)
    .where(and(eq(series.slug, slug), eq(series.is_active, true)))
    .get()
  return result || null
}

export async function getSeriesById(db: D1Database, id: string) {
  const result = await db.select().from(series).where(eq(series.id, id)).get()
  return result || null
}

export async function createSeries(db: D1Database, s: NewSeries) {
  const result = await db.insert(series).values(s).returning()
  return result[0]
}

export async function updateSeries(db: D1Database, id: string, data: Partial<NewSeries>) {
  const result = await db
    .update(series)
    .set({ ...data, updated_at: new Date() })
    .where(eq(series.id, id))
    .returning()
  return result[0] || null
}

/**
 * POST-TAG QUERIES
 */

export async function addTagToPost(db: D1Database, postId: string, tagId: string) {
  await db.insert(postTags).values({ post_id: postId, tag_id: tagId })
}

export async function removeTagFromPost(db: D1Database, postId: string, tagId: string) {
  await db.delete(postTags).where(and(eq(postTags.post_id, postId), eq(postTags.tag_id, tagId)))
}

export async function getPostTags(db: D1Database, postId: string) {
  return await db
    .select()
    .from(tags)
    .innerJoin(postTags, eq(tags.id, postTags.tag_id))
    .where(eq(postTags.post_id, postId))
}

/**
 * PODCAST-TAG QUERIES
 */

export async function addTagToPodcast(db: D1Database, podcastId: string, tagId: string) {
  await db.insert(podcastTags).values({ podcast_id: podcastId, tag_id: tagId })
}

export async function removeTagFromPodcast(db: D1Database, podcastId: string, tagId: string) {
  await db.delete(podcastTags).where(and(eq(podcastTags.podcast_id, podcastId), eq(podcastTags.tag_id, tagId)))
}

export async function getPodcastTags(db: D1Database, podcastId: string) {
  return await db
    .select()
    .from(tags)
    .innerJoin(podcastTags, eq(tags.id, podcastTags.tag_id))
    .where(eq(podcastTags.podcast_id, podcastId))
}

/**
 * IMAGE QUERIES
 */

export async function createImage(db: D1Database, image: typeof images.$inferInsert) {
  const result = await db.insert(images).values(image).returning()
  return result[0]
}

export async function getImageById(db: D1Database, id: string) {
  const result = await db.select().from(images).where(eq(images.id, id)).get()
  return result || null
}

export async function deleteImage(db: D1Database, id: string) {
  await db.delete(images).where(eq(images.id, id))
}

export async function getImagesByUploadedBy(db: D1Database, userId: string) {
  return await db.select().from(images).where(eq(images.uploaded_by, userId))
}
