// Home-layouts-only seed. Run with `npm run seed:home-layouts`.
//
// Inserts the sample home page rows from lib/db/seed-data.ts (one row per
// layout type) without touching any other collection, so it is safe to run
// against a database that already holds real catalogue data.
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

import { seedHomeLayouts } from '../lib/db/seed-data'
import { HOME_LAYOUT_TYPES } from '../lib/home-layout-types'

async function main() {
  const { connectToDatabase } = await import('../config/db')
  const { default: mongoose } = await import('mongoose')
  const { default: HomeLayout } = await import('../lib/models/home-layout.model')

  await connectToDatabase()
  console.log('Connected to MongoDB')

  const existing = await HomeLayout.countDocuments({})
  if (existing) {
    await HomeLayout.deleteMany({})
    console.log(`Removed ${existing} existing home layout(s)`)
  }

  const created = await HomeLayout.create(
    seedHomeLayouts.map((layout) => ({
      title: layout.title,
      details: layout.details,
      redirect: layout.redirect,
      order: layout.order,
      layout: layout.layout,
      section: layout.section,
    }))
  )
  console.log(`Created ${created.length} home layouts`)

  const used = new Set(created.map((doc) => doc.layout))
  const missing = HOME_LAYOUT_TYPES.filter((type) => !used.has(type))
  console.log(
    missing.length
      ? `WARNING: no sample row for layout type(s): ${missing.join(', ')}`
      : 'All layout types have a sample row'
  )

  await mongoose.disconnect()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Home layout seed failed:', error)
    process.exit(1)
  })
