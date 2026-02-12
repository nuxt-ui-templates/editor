import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

interface R2Config {
  accountId: string
  accessKeyId: string
  accessKeySecret: string
  bucketName: string
}

let r2Client: S3Client | null = null

/**
 * Initialize R2 client (Cloudflare R2)
 * R2 is S3-compatible, so we use AWS SDK with custom endpoint
 */
export function initializeR2(config: R2Config): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.accessKeySecret
      },
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`
    })
  }
  return r2Client
}

/**
 * Upload file to R2
 */
export async function uploadToR2(
  client: S3Client,
  bucketName: string,
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string
): Promise<string> {
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType
    }))

    // Generate public URL for R2 object
    const url = `https://${bucketName}.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/${key}`
    return url
  }
  catch (error) {
    console.error('[v0] R2 upload error:', error)
    throw new Error('Failed to upload file to R2')
  }
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(
  client: S3Client,
  bucketName: string,
  key: string
): Promise<void> {
  try {
    await client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    }))
  }
  catch (error) {
    console.error('[v0] R2 delete error:', error)
    throw new Error('Failed to delete file from R2')
  }
}

/**
 * Get file from R2
 */
export async function getFromR2(
  client: S3Client,
  bucketName: string,
  key: string
): Promise<Buffer> {
  try {
    const response = await client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    }))

    if (!response.Body) {
      throw new Error('No body in response')
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of response.Body as any) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  }
  catch (error) {
    console.error('[v0] R2 get error:', error)
    throw new Error('Failed to get file from R2')
  }
}

/**
 * Generate a presigned URL for R2 object (for direct uploads)
 */
export async function generatePresignedUrl(
  client: S3Client,
  bucketName: string,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key
      }),
      { expiresIn }
    )
    return url
  }
  catch (error) {
    console.error('[v0] Presigned URL generation error:', error)
    throw new Error('Failed to generate presigned URL')
  }
}

/**
 * Generate public R2 URL for an object
 */
export function generatePublicUrl(bucketName: string, accountId: string, key: string): string {
  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`
}
