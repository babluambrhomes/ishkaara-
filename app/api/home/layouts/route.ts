import { NextResponse } from 'next/server'
import { getHomeLayouts } from '@/lib/actions/home-layout.actions'
import { formatError } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const layouts = await getHomeLayouts()
    return NextResponse.json({ layouts })
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 400 })
  }
}
