import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import Redis from 'ioredis'
import { RateLimiterRedis, type RateLimiterRes } from 'rate-limiter-flexible'

export type RateLimitPolicy =
  | 'write'
  | 'otp'
  | 'auth'
  | 'cart'
  | 'wishlist'
  | 'api'
  | 'upload'
  | 'payment'

interface PolicyConfig {
  points: number
  duration: number
  blockDuration?: number
}

const POLICIES: Record<RateLimitPolicy, PolicyConfig> = {
  write: { points: 5, duration: 60 * 10 },
  otp: { points: 5, duration: 60 * 10 },
  auth: { points: 10, duration: 60 * 10 },
  cart: { points: 60, duration: 60 },
  wishlist: { points: 60, duration: 60 },
  api: { points: 60, duration: 60 },
  upload: { points: 30, duration: 60 * 10 },
  payment: { points: 20, duration: 60 * 10 },
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  retryAfter: number
}

export class RateLimitError extends Error {
  retryAfter: number
  constructor(retryAfter: number) {
    super(
      `Too many requests. Please try again in ${retryAfter} second${
        retryAfter === 1 ? '' : 's'
      }.`
    )
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitRedis?: Redis
  __rateLimiters?: Partial<Record<RateLimitPolicy, RateLimiterRedis>>
}

let redisResolved = false

function getRedis(): Redis | null {
  if (redisResolved) return globalForRateLimit.__rateLimitRedis ?? null
  redisResolved = true

  const url = process.env.REDIS_URL
  if (!url) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[rate-limit] REDIS_URL is not set — rate limiting is disabled (fail-open).'
      )
    }
    return null
  }

  try {
    const client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 3000,
    })
    client.on('error', (error: Error) => {
      console.warn('[rate-limit] Redis error:', error.message)
    })
    globalForRateLimit.__rateLimitRedis = client
    return client
  } catch (error) {
    console.warn('[rate-limit] Failed to initialize Redis:', error)
    return null
  }
}

function getLimiter(policy: RateLimitPolicy): RateLimiterRedis | null {
  const client = getRedis()
  if (!client) return null

  const cache = (globalForRateLimit.__rateLimiters ??= {})
  if (!cache[policy]) {
    const config = POLICIES[policy]
    cache[policy] = new RateLimiterRedis({
      storeClient: client,
      keyPrefix: `rl:${policy}`,
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration,
    })
  }
  return cache[policy] ?? null
}

export async function rateLimit(
  policy: RateLimitPolicy,
  key: string
): Promise<RateLimitResult> {
  const config = POLICIES[policy]
  const limiter = getLimiter(policy)

  if (!limiter) {
    return { success: true, limit: config.points, remaining: config.points, retryAfter: 0 }
  }

  try {
    const res = await limiter.consume(key)
    return {
      success: true,
      limit: config.points,
      remaining: res.remainingPoints,
      retryAfter: 0,
    }
  } catch (error) {
    if (error instanceof Error) {
      console.warn('[rate-limit] consume failed — fail-open:', error.message)
      return {
        success: true,
        limit: config.points,
        remaining: config.points,
        retryAfter: 0,
      }
    }
    const res = error as RateLimiterRes
    return {
      success: false,
      limit: config.points,
      remaining: res.remainingPoints ?? 0,
      retryAfter: Math.max(1, Math.ceil((res.msBeforeNext ?? 1000) / 1000)),
    }
  }
}

export async function assertRateLimit(
  policy: RateLimitPolicy,
  key: string
): Promise<void> {
  const result = await rateLimit(policy, key)
  if (!result.success) throw new RateLimitError(result.retryAfter)
}

function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.retryAfter),
    'Retry-After': String(result.retryAfter),
  }
}

export function rateLimitResponse(result: RateLimitResult) {
  return NextResponse.json(
    {
      message: `Too many requests. Please try again in ${result.retryAfter} second${
        result.retryAfter === 1 ? '' : 's'
      }.`,
    },
    { status: 429, headers: rateLimitHeaders(result) }
  )
}

type HeadersLike = { get(name: string): string | null }

export function getClientIpFromHeaders(headers: HeadersLike): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return (
    headers.get('x-real-ip')?.trim() ||
    headers.get('cf-connecting-ip')?.trim() ||
    'unknown'
  )
}

export function getClientIp(request: NextRequest | Request): string {
  return getClientIpFromHeaders(request.headers)
}
