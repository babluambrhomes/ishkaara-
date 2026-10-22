import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

async function main() {
  const { connectToDatabase } = await import('../config/db')
  const { default: mongoose } = await import('mongoose')
  const { default: HomeLayout } = await import('../lib/models/home-layout.model')

  await connectToDatabase()

  const count = await HomeLayout.countDocuments({})
  console.log('HomeLayout documents:', count)

  const byLayout = await HomeLayout.aggregate([
    { $group: { _id: '$layout', n: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])
  console.log('by layout field:', JSON.stringify(byLayout))

  const legacy = await HomeLayout.countDocuments({ layoutType: { $exists: true } })
  console.log('documents still using layoutType:', legacy)

  const sample = await HomeLayout.find({}).sort({ order: 1 }).limit(2).lean()
  for (const doc of sample) {
    console.log(
      `- "${doc.title}" layout=${doc.layout} order=${doc.order} sections=${
        doc.section?.length
      } redirect=${doc.redirect}`
    )
  }

  await mongoose.disconnect()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Check failed:', error)
    process.exit(1)
  })
