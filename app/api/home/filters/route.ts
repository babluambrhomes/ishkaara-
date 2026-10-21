import { NextResponse } from 'next/server'
import { getHomeFilters } from '@/lib/actions/home-filter.actions'
import { formatError } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const filters = await getHomeFilters()
    return NextResponse.json({ filters })
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 400 })
  }
}
