// Renames the MongoDB collection that backed the old `HomeFilter` model and
// renames the old `layoutType` field to `layout`.
// Run with `npm run migrate:home-layout` after deploying the HomeLayout rename.
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const OLD_COLLECTION = 'homefilters'
const NEW_COLLECTION = 'homelayouts'
const OLD_FIELD = 'layoutType'
const NEW_FIELD = 'layout'

async function main() {
  const { connectToDatabase } = await import('../config/db')
  const { default: mongoose } = await import('mongoose')

  await connectToDatabase()

  const db = mongoose.connection.db
  if (!db) throw new Error('MongoDB connection is not ready')

  const existing = await db
    .listCollections({ name: OLD_COLLECTION }, { nameOnly: true })
    .toArray()

  if (!existing.length) {
    console.log(`Collection "${OLD_COLLECTION}" not found — nothing to migrate`)
    await mongoose.disconnect()
    return
  }

  const target = await db
    .listCollections({ name: NEW_COLLECTION }, { nameOnly: true })
    .toArray()

  if (target.length) {
    throw new Error(
      `Collection "${NEW_COLLECTION}" already exists — drop it manually before migrating`
    )
  }

  await db.renameCollection(OLD_COLLECTION, NEW_COLLECTION)
  console.log(`Renamed collection "${OLD_COLLECTION}" -> "${NEW_COLLECTION}"`)

  // Mongoose strict mode drops the unknown `layoutType` field, so without this
  // rename every existing document would silently fall back to `grid`.
  const renamed = await db
    .collection(NEW_COLLECTION)
    .updateMany({ [OLD_FIELD]: { $exists: true } }, { $rename: { [OLD_FIELD]: NEW_FIELD } })

  console.log(`Renamed field "${OLD_FIELD}" -> "${NEW_FIELD}" on ${renamed.modifiedCount} document(s)`)

  await mongoose.disconnect()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
