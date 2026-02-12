import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real, primaryKey, index } from 'drizzle-orm/sqlite-core'

/**
 * Users table for authentication
 */
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
    email: text('email').unique().notNull(),
    password_hash: text('password_hash').notNull(),
    name: text('name'),
    bio: text('bio'),
    avatar_url: text('avatar_url'),
    role: text('role', { enum: ['admin', 'editor', 'author'] }).default('author'),
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(cast((julianday('now')) * 86400.0 as integer))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(cast((julianday('now')) * 86400.0 as integer))`),
    last_login_at: integer('last_login_at', { mode: 'timestamp' })
  },
  table => ({
    emailIdx: index('users_email_idx').on(table.email),
    activeIdx: index('users_active_idx').on(table.is_active)
  })
)

/**
 * Posts table for blog content
 */
export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
    title: text('title').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description').notNull(),
    content: text('content').notNull(),
    featured_image_url: text('featured_image_url'),
    featured_image_alt: text('featured_image_alt'),
    author_id: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'),
    reading_time_minutes: integer('reading_time_minutes'),
    view_count: integer('view_count').default(0),
    series_id: text('series_id').references(() => series.id, { onDelete: 'set null' }),
    published_at: integer('published_at', { mode: 'timestamp' }),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(cast((julianday('now')) * 86400.0 as integer))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(cast((julianday('now')) * 86400.0 as integer))`)
  },
  table => ({
    slugIdx: index('posts_slug_idx').on(table.slug),
    statusIdx: index('posts_status_idx').on(table.status),
    authorIdx: index('posts_author_idx').on(table.author_id),
    publishedIdx: index('posts_published_idx').on(table.published_at),
    seriesIdx: index('posts_series_idx').on(table.series_id)
  })
)

/**
 * Podcasts table for podcast episodes
 */
export const podcasts = sqliteTable(
  'podcasts',
  {
    id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
    title: text('title').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description').notNull(),
    episode_number: integer('episode_number'),
    duration_seconds: integer('duration_seconds'),
    youtube_url: text('youtube_url'),
    youtube_video_id: text('youtube_video_id'),
    featured_image_url: text('featured_image_url'),
    featured_image_alt: text('featured_image_alt'),
    transcript: text('transcript'),
    ai_analysis: text('ai_analysis'),
    author_id: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'),
    view_count: integer('view_count').default(0),
    series_id: text('series_id').references(() => series.id, { onDelete: 'set null' }),
    published_at: integer('published_at', { mode: 'timestamp' }),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(cast((julianday('now')) * 86400.0 as integer))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(cast((julianday('now')) * 86400.0 as integer))`)
  },
  table => ({
    slugIdx: index('podcasts_slug_idx').on(table.slug),
    statusIdx: index('podcasts_status_idx').on(table.status),
    authorIdx: index('podcasts_author_idx').on(table.author_id),
    publishedIdx: index('podcasts_published_idx').on(table.published_at),
    seriesIdx: index('podcasts_series_idx').on(table.series_id)
  })
)

/**
 * Tags table for categorizing content
 */
export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
    name: text('name').unique().notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(cast((julianday('now')) * 86400.0 as integer))`)
  },
  table => ({
    slugIdx: index('tags_slug_idx').on(table.slug)
  })
)

/**
 * Post-Tag junction table (many-to-many)
 */
export const postTags = sqliteTable(
  'post_tags',
  {
    post_id: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tag_id: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' })
  },
  table => ({
    pk: primaryKey({ columns: [table.post_id, table.tag_id] }),
    postIdx: index('post_tags_post_idx').on(table.post_id),
    tagIdx: index('post_tags_tag_idx').on(table.tag_id)
  })
)

/**
 * Podcast-Tag junction table (many-to-many)
 */
export const podcastTags = sqliteTable(
  'podcast_tags',
  {
    podcast_id: text('podcast_id')
      .notNull()
      .references(() => podcasts.id, { onDelete: 'cascade' }),
    tag_id: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' })
  },
  table => ({
    pk: primaryKey({ columns: [table.podcast_id, table.tag_id] }),
    podcastIdx: index('podcast_tags_podcast_idx').on(table.podcast_id),
    tagIdx: index('podcast_tags_tag_idx').on(table.tag_id)
  })
)

/**
 * Series table for organizing content into collections
 */
export const series = sqliteTable(
  'series',
  {
    id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
    title: text('title').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    featured_image_url: text('featured_image_url'),
    featured_image_alt: text('featured_image_alt'),
    created_by: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(cast((julianday('now')) * 86400.0 as integer))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(cast((julianday('now')) * 86400.0 as integer))`)
  },
  table => ({
    slugIdx: index('series_slug_idx').on(table.slug),
    activeIdx: index('series_active_idx').on(table.is_active)
  })
)

/**
 * Images table for tracking uploaded images
 */
export const images = sqliteTable(
  'images',
  {
    id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
    filename: text('filename').notNull(),
    r2_key: text('r2_key').notNull(),
    r2_url: text('r2_url').notNull(),
    alt_text: text('alt_text'),
    mime_type: text('mime_type').notNull(),
    file_size: integer('file_size'),
    uploaded_by: text('uploaded_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(cast((julianday('now')) * 86400.0 as integer))`)
  },
  table => ({
    r2KeyIdx: index('images_r2_key_idx').on(table.r2_key),
    uploadedByIdx: index('images_uploaded_by_idx').on(table.uploaded_by)
  })
)

// Export types for use in the application
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

export type Podcast = typeof podcasts.$inferSelect
export type NewPodcast = typeof podcasts.$inferInsert

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type PostTag = typeof postTags.$inferSelect
export type NewPostTag = typeof postTags.$inferInsert

export type PodcastTag = typeof podcastTags.$inferSelect
export type NewPodcastTag = typeof podcastTags.$inferInsert

export type Series = typeof series.$inferSelect
export type NewSeries = typeof series.$inferInsert

export type Image = typeof images.$inferSelect
export type NewImage = typeof images.$inferInsert
