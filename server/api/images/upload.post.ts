import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createImage } from '~/server/db/queries'
import { parseAuthHeader } from '~/server/utils/jwt'
import type { D1Database } from '~/server/utils/db'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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

    // Get environment variables
    const env = (event.context as any).env || {}
    const dbBinding = env.DB as any
    const r2AccountId = process.env.R2_ACCOUNT_ID
    const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID
    const r2AccessKeySecret = process.env.R2_ACCESS_KEY_SECRET
    const r2BucketName = process.env.R2_BUCKET_NAME || 'blog-images'

    if (!dbBinding || !r2AccountId || !r2AccessKeyId || !r2AccessKeySecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Storage configuration unavailable'
      })
    }

    // Parse form data
    const formData = await readFormData(event)
    const file = formData.get('file') as File

    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided'
      })
    }

    // Validate file
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed'
      })
    }

    if (file.size > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 400,
        statusMessage: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      })
    }

    // Initialize R2 client
    const r2Client = new S3Client({
      region: 'auto',
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2AccessKeySecret
      },
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`
    })

    // Generate R2 key
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop() || 'jpg'
    const r2Key = `images/${timestamp}-${randomStr}.${extension}`

    // Upload to R2
    const fileBuffer = await file.arrayBuffer()
    await r2Client.send(new PutObjectCommand({
      Bucket: r2BucketName,
      Key: r2Key,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000' // Cache for 1 year
    }))

    // Generate public URL
    const r2Url = `https://${r2BucketName}.${r2AccountId}.r2.cloudflarestorage.com/${r2Key}`

    // Get database and save image record
    const { drizzle } = await import('drizzle-orm/d1')
    const db = drizzle(dbBinding) as D1Database

    const altText = (formData.get('alt_text') as string) || file.name

    const imageRecord = await createImage(db, {
      filename: file.name,
      r2_key: r2Key,
      r2_url: r2Url,
      alt_text: altText,
      mime_type: file.type,
      file_size: file.size,
      uploaded_by: auth.userId,
      created_at: new Date()
    })

    return {
      success: true,
      data: {
        id: imageRecord.id,
        filename: imageRecord.filename,
        url: r2Url,
        altText: imageRecord.alt_text,
        size: imageRecord.file_size
      },
      message: 'Image uploaded successfully'
    }
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('[v0] Image upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload image'
    })
  }
})
