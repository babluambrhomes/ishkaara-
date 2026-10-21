import BrowsingHistory from '@/components/shared/browsing-history'
import Footer from '@/components/shared/footer'
import Header from '@/components/shared/header'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import { CategoryStrip } from '@/components/shared/home/category-strip'
import { HomeFilterSection } from '@/components/shared/home/home-filter-section'

import { getHomePageData } from '@/lib/actions/product.actions'
import { toSlug } from '@/lib/utils'
import RandomBannerGrid from '@/components/shared/home/randomBannerGrid'
import RelatedToViewed from '@/components/shared/related-to-viewed'

export default async function HomePage() {
  const { heroBanners, commonBanners, categories, homeFilters } =
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
      <RandomBannerGrid banners={commonBanners.slice(2, 5)} />
      <HomeFilterSection filters={homeFilters} />
      <RandomBannerGrid banners={commonBanners.slice(1, 3)} />

    <RelatedToViewed />

     <RandomBannerGrid banners={commonBanners.slice(4)} />


       <BrowsingHistory />

    </div>
    <Footer />
    </>
  )
}
