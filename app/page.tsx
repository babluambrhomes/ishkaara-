import BrowsingHistory from '@/components/shared/browsing-history'
import Footer from '@/components/shared/footer'
import Header from '@/components/shared/header'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import { CategoryStrip } from '@/components/shared/home/category-strip'
import { HomeLayoutSection } from '@/components/shared/home/home-layout-section'

import { getHomePageData } from '@/lib/actions/product.actions'
import { toSlug } from '@/lib/utils'
import RelatedToViewed from '@/components/shared/related-to-viewed'
import OurUsps from '@/components/shared/home/our-usps'
import VideoSection from '@/components/shared/home/video-section'

export default async function HomePage() {
  const { heroBanners, categories, homeLayouts, videos } =
    await getHomePageData()

  const cardCategories = categories.map((category) => ({
    name: category.name,
    image: category.imageUrl || `/images/${toSlug(category.name)}.jpg`,
    href: `/search?category=${encodeURIComponent(category.name)}`,
  }))

  return (
    <>
      <Header />
      <div className='flex-1 flex flex-col gap-6 p-3 '>
        <HomeCarousel banners={heroBanners} />
        <CategoryStrip categories={cardCategories} />
        
        <HomeLayoutSection layouts={homeLayouts} />

        <VideoSection videos={videos} />

        <RelatedToViewed />
        <BrowsingHistory />
        <OurUsps />
      </div>
      <Footer />
    </>
  )
}
