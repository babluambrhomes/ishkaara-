// Categories-only seed. Run with `npm run seed:categories`.
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

import { blogCategories, productCategories } from '../lib/db/seed-data'

const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

async function main() {
  const { connectToDatabase } = await import('../config/db')
  const { default: mongoose } = await import('mongoose')
  const { default: Category } = await import('../lib/models/category.model')

  await connectToDatabase()

  await Category.deleteMany({})

  const all = [...productCategories, ...blogCategories]
  for (const item of all) {
    await Category.create({
      name: item.name,
      slug: toSlug(item.name),
      type: item.type,
      description: item.description,
      imageUrl: item.imageUrl,
      status: 'public',
    })
  }

  console.log(
    `Seeded ${productCategories.length} product and ${blogCategories.length} blog categories`
  )

  await mongoose.disconnect()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Category seed failed:', error)
    process.exit(1)
  })
