import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { S3_MAX_UPLOAD_SIZE_BYTES } from '@/config/s3'
import { uploadImage, type StorageEntity } from '@/lib/storage'
import { formatError } from '@/lib/utils'

export const runtime = 'nodejs'

const ENTITIES: StorageEntity[] = ['user', 'product', 'category', 'blog']

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    const entity = formData.get('entity')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (typeof entity !== 'string' || !ENTITIES.includes(entity as StorageEntity)) {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    if (file.size > S3_MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File is too large. Maximum size is ${Math.floor(
            S3_MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
          )}MB`,
        },
        { status: 413 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const key = await uploadImage({
      entity: entity as StorageEntity,
      buffer,
      originalName: file.name,
    })

    return NextResponse.json({ key })
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 400 })
  }
}
