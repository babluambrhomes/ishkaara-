import type { NextConfig } from 'next'

function getS3Host(): string | null {
  const base = process.env.NEXT_PUBLIC_S3_BASE_URL
  if (!base) return null
  try {
    return new URL(base).hostname
  } catch {
    return null
  }
}

const cdnHost = getS3Host()

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  { protocol: 'https', hostname: 'utfs.io' },
]

if (cdnHost) {
  remotePatterns.push({ protocol: 'https', hostname: cdnHost, pathname: '/**' })
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns,
  },
}

export default nextConfig
