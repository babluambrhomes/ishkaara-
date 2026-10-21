export type UploadEntity = 'user' | 'product' | 'category' | 'blog' | 'banner' | 'home-filter'

/**
 * Sends a single image to the upload API and resolves the stored storage key.
 * The caller is responsible for putting that key in the form / database — never
 * a full URL.
 */
export async function uploadImageFile(
  file: File,
  entity: UploadEntity
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('entity', entity)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const data = (await res.json().catch(() => ({}))) as {
    key?: string
    error?: string
  }

  if (!res.ok || !data.key) {
    throw new Error(data.error || 'Upload failed')
  }

  return data.key
}
