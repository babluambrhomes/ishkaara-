import crypto from 'crypto'
import path from 'path'
import sharp from 'sharp'
import { DeleteObjectCommand, DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import {
  getS3Client,
  S3_BUCKET,
  S3_CACHE_CONTROL,
  S3_MAX_UPLOAD_SIZE_BYTES,
  STORAGE_FOLDERS,
} from '@/config/s3'
import { ApiError } from '@/lib/utils'

export type StorageEntity = keyof typeof STORAGE_FOLDERS

export const IMAGE_EXT = '.webp'

const MAX_NAME_LENGTH = 60

// WebP keeps the catalog small; images larger than this are downscaled.
const IMAGE_MAX_DIMENSION = 2000
const IMAGE_QUALITY = 82

/**
 * Keeps the recognisable part of an uploaded filename readable and safe to put
 * in a key, without letting the caller control the extension or the path.
 */
const sanitizeBaseName = (name: string): string =>
  name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, MAX_NAME_LENGTH)
    .toLowerCase()

// Caller-supplied folder segments must never introduce a traversal or an
// unexpected depth, so they are rebuilt from a strict allow-list.
const sanitizeSegment = (segment: string): string =>
  segment.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40)

const buildPrefix = (entity: StorageEntity, subPath?: string | null): string => {
  const base = STORAGE_FOLDERS[entity]
  const extra = (subPath ?? '')
    .split('/')
    .map(sanitizeSegment)
    .filter(Boolean)

  return [base, ...extra].join('/')
}

/**
 * Builds the key that is returned to the caller and persisted in the database.
 *
 * The uuid guarantees two uploads of the same filename never collide.
 */
export const buildStorageKey = ({
  entity,
  subPath,
  baseName,
  ext,
}: {
  entity: StorageEntity
  subPath?: string | null
  baseName: string
  ext: string
}): string => {
  const uuid = crypto.randomUUID()
  const name = `${sanitizeBaseName(baseName)}-${uuid}`
  return `${buildPrefix(entity, subPath)}/${name}${ext}`
}

/** A key is a bucket-relative path, never an absolute URL or a leading slash. */
export const isStorageKey = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  !/^https?:\/\//i.test(value.trim()) &&
  !value.trim().startsWith('/')

/**
 * Processes an uploaded image to WebP, stores it and returns the storage key.
 *
 * The returned key is what should be saved in the database — never a full URL.
 */
export const uploadImage = async ({
  entity,
  buffer,
  originalName,
  subPath,
}: {
  entity: StorageEntity
  buffer: Buffer
  originalName: string
  subPath?: string | null
}): Promise<string> => {
  if (buffer.byteLength > S3_MAX_UPLOAD_SIZE_BYTES) {
    throw new ApiError(
      413,
      `File is too large. Maximum size is ${Math.floor(
        S3_MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
      )}MB`
    )
  }

  const baseName = path.parse(originalName).name
  const key = buildStorageKey({ entity, subPath, baseName, ext: IMAGE_EXT })

  let body: Buffer
  try {
    body = await sharp(buffer)
      .rotate()
      .resize({
        width: IMAGE_MAX_DIMENSION,
        height: IMAGE_MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: IMAGE_QUALITY })
      .toBuffer()
  } catch {
    throw new ApiError(400, 'Invalid or unsupported image file')
  }

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: 'image/webp',
      ContentLength: body.byteLength,
      CacheControl: S3_CACHE_CONTROL,
    })
  )

  return key
}

/** Removes stored objects, ignoring anything that is not a key we produced. */
export const deleteFiles = async (keys: string[]): Promise<void> => {
  const targets = keys.filter(isStorageKey).map((key) => key.trim())
  if (targets.length === 0) return

  try {
    if (targets.length === 1) {
      await getS3Client().send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: targets[0] })
      )
      return
    }

    // S3 accepts at most 1000 keys per batch.
    for (let i = 0; i < targets.length; i += 1000) {
      await getS3Client().send(
        new DeleteObjectsCommand({
          Bucket: S3_BUCKET,
          Delete: {
            Objects: targets.slice(i, i + 1000).map((Key) => ({ Key })),
            Quiet: true,
          },
        })
      )
    }
  } catch {
    // A failed unlink must not fail the caller's request — the row that
    // referenced the object is already gone.
  }
}
