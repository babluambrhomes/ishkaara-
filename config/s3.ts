import { S3Client } from '@aws-sdk/client-s3'

export const S3_REGION = process.env.AWS_REGION

if (!S3_REGION) {
  throw new Error('AWS_REGION is not configured')
}

export const S3_BUCKET = process.env.AWS_S3_BUCKET

if (!S3_BUCKET) {
  throw new Error('AWS_S3_BUCKET is not configured')
}

// An unset *or blank* env var must fall back to the default: dotenv turns
// `KEY=` into "", and Number("") is 0, which would hand out already-expired
// values.
const positiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const S3_MAX_UPLOAD_SIZE_BYTES = positiveNumber(
  process.env.S3_MAX_UPLOAD_SIZE,
  5 * 1024 * 1024
)

export const S3_CACHE_CONTROL = 'public, max-age=31536000, immutable'

export const STORAGE_FOLDERS = {
  user: 'lemon-fashion/user',
  product: 'lemon-fashion/product',
  category: 'lemon-fashion/category',
  blog: 'lemon-fashion/blog',
  banner: 'lemon-fashion/banner',
} as const

let client: S3Client | null = null

export const getS3Client = (): S3Client => {
  if (!client) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    client = new S3Client({
      region: S3_REGION,
      maxAttempts: 3,
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    })
  }
  return client
}
