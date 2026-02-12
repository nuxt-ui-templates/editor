import { z } from 'zod'

/**
 * Common validation schemas for the blogging system
 */

// Slug validation - lowercase alphanumeric with hyphens
export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Slug must be lowercase alphanumeric with hyphens')
  .transform(slug => slug.toLowerCase())

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()

// Password validation - minimum 8 characters
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')

// Tag validation
export const tagSchema = z
  .string()
  .min(1)
  .max(50)
  .trim()

// Title validation
export const titleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title must be less than 200 characters')
  .trim()

// Description/excerpt validation
export const descriptionSchema = z
  .string()
  .min(1)
  .max(1000)
  .trim()

// Content validation (rich text)
export const contentSchema = z
  .string()
  .min(1, 'Content is required')

// Status validation
export const statusSchema = z.enum(['draft', 'published', 'archived'])

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
})

// Post creation schema
export const createPostSchema = z.object({
  title: titleSchema,
  slug: slugSchema.optional(),
  description: descriptionSchema,
  content: contentSchema,
  featured_image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  status: statusSchema.default('draft'),
  tags: z.array(tagSchema).default([]),
  series_id: z.string().uuid().optional().or(z.literal(''))
})

export type CreatePostInput = z.infer<typeof createPostSchema>

// Post update schema
export const updatePostSchema = createPostSchema.partial()
export type UpdatePostInput = z.infer<typeof updatePostSchema>

// Podcast creation schema
export const createPodcastSchema = z.object({
  title: titleSchema,
  slug: slugSchema.optional(),
  description: descriptionSchema,
  episode_number: z.coerce.number().int().positive().optional(),
  duration_seconds: z.coerce.number().int().positive().optional(),
  youtube_url: z.string().url('Invalid YouTube URL').optional().or(z.literal('')),
  featured_image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  transcript: z.string().max(50000).optional().or(z.literal('')),
  status: statusSchema.default('draft'),
  tags: z.array(tagSchema).default([]),
  series_id: z.string().uuid().optional().or(z.literal('')),
  ai_analysis: z.string().max(50000).optional().or(z.literal(''))
})

export type CreatePodcastInput = z.infer<typeof createPodcastSchema>

// Podcast update schema
export const updatePodcastSchema = createPodcastSchema.partial()
export type UpdatePodcastInput = z.infer<typeof updatePodcastSchema>

// Tag creation schema
export const createTagSchema = z.object({
  name: tagSchema,
  slug: slugSchema.optional(),
  description: descriptionSchema.optional()
})

export type CreateTagInput = z.infer<typeof createTagSchema>

// Series creation schema
export const createSeriesSchema = z.object({
  title: titleSchema,
  slug: slugSchema.optional(),
  description: descriptionSchema.optional(),
  featured_image_url: z.string().url('Invalid image URL').optional().or(z.literal(''))
})

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export type LoginInput = z.infer<typeof loginSchema>

// Validate and parse request body
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors[0]?.message}`)
    }
    throw error
  }
}
