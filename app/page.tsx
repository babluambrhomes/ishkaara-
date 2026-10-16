import BrowsingHistory from '@/components/shared/browsing-history'
import Footer from '@/components/shared/footer'
import Header from '@/components/shared/header'
import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import { CategoryStrip } from '@/components/shared/home/category-strip'

import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'

import { getHomePageData } from '@/lib/actions/product.actions'
import { toSlug } from '@/lib/utils'
import RandomBannerGrid from '@/components/shared/home/randomBannerGrid'
import RelatedToViewed from '@/components/shared/related-to-viewed'

export default async function HomePage() {
  const {
    heroBanners,
    commonBanners,
    todaysDeals,
    bestSellingProducts,
    categories,
    newArrivals,
    featureds,
    bestSellers,
  } = await getHomePageData()

  const cardCategories = categories.map((category) => ({
    name: category.name,
    image: category.imageUrl || `/images/${toSlug(category.name)}.jpg`,
    href: `/search?category=${encodeURIComponent(category.name)}`,
  }))
  const cards = [
    {
      title: 'Explore New Arrivals',
      items: newArrivals,
      link: {
        text: 'View All',
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: 'Discover Best Sellers',
      items: bestSellers,
      link: {
        text: 'View All',
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: 'Featured Products',
      items: featureds,
      link: {
        text: 'Shop Now',
        href: '/search?tag=new-arrival',
      },
    },
  ]

  return (
    <>
     <Header />
    <div className='flex-1 flex flex-col gap-6 p-3 '>
      <HomeCarousel banners={heroBanners} />
      <CategoryStrip categories={cardCategories} />
      <RandomBannerGrid banners={commonBanners.slice(2, 5)} />
      <HomeCard cards={cards} />
      <Card className='w-full overflow-hidden rounded-2xl '>
        <CardContent className='p-4 items-center gap-3'>
          <ProductSlider title="Today's Deals" products={todaysDeals} />
        </CardContent>
      </Card>
      <RandomBannerGrid banners={commonBanners.slice(1, 3)} />
      <Card className='w-full overflow-hidden rounded-2xl '>
        <CardContent className='p-4 items-center gap-3'>
          <ProductSlider
            title='Best Selling Products'
            products={bestSellingProducts}
            hideDetails
          />
        </CardContent>
      </Card>
      
    <RelatedToViewed />

     <RandomBannerGrid banners={commonBanners.slice(4)} />


       <BrowsingHistory />

    </div>
    <Footer />
    </>
  )
}
