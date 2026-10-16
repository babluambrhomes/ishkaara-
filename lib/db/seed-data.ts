// Static sample data used by lib/db/seed.ts and scripts/seed-categories.ts.
// Images point at the existing local assets in public/images so no S3/upload
// step is required.

export interface SeedCategory {
  name: string
  type: 'product' | 'blog'
  description: string
  imageUrl: string
}

export const productCategories: SeedCategory[] = [
  {
    name: 'Footwear',
    type: 'product',
    description:
      'Sneakers, formal shoes and everyday footwear for men and women.',
    imageUrl: '/images/category_footwear.avif',
  },
  {
    name: 'Jewellery',
    type: 'product',
    description:
      'Earrings, necklaces, rings and bracelets finished with everyday sparkle.',
    imageUrl: '/images/category_jewellery.avif',
  },
  {
    name: 'Kids',
    type: 'product',
    description:
      'Comfort-first clothing and essentials for boys and girls.',
    imageUrl: '/images/category_kids.avif',
  },
  {
    name: 'Shirts',
    type: 'product',
    description:
      'Casual and formal shirts cut for a sharp, modern fit.',
    imageUrl: '/images/category_shirt.avif',
  },
  {
    name: 'Watches',
    type: 'product',
    description:
      'Analog, chronograph and everyday watches for every wrist.',
    imageUrl: '/images/category_watchs.avif',
  },
  {
    name: 'Western Wear',
    type: 'product',
    description:
      'Dresses, tops and coordinated sets for a contemporary wardrobe.',
    imageUrl: '/images/category_westanwear.avif',
  },
  {
    name: 'Men',
    type: 'product',
    description:
      'Everyday essentials and occasion wear curated for men.',
    imageUrl: '/images/Men_web_c38beabd67.avif',
  },
  {
    name: 'Women',
    type: 'product',
    description:
      'The latest in womenswear, from ethnic classics to modern edits.',
    imageUrl: '/images/womenswear_main_banners_web_d97f63106e.avif',
  },
  {
    name: 'Handbags',
    type: 'product',
    description:
      'Totes, slings and structured bags that finish every look.',
    imageUrl: '/images/handbags_main_banners_web_7ab8613644.avif',
  },
  {
    name: 'Beauty',
    type: 'product',
    description:
      'Skin, face and self-care picks for a daily glow.',
    imageUrl: '/images/Beauty_web_7965c69bea.avif',
  },
  {
    name: 'Fragrance',
    type: 'product',
    description:
      'Eau de parfum and body mists for day and evening.',
    imageUrl: '/images/Fragrance_web_a305b28e31.avif',
  },
]

export const blogCategories: SeedCategory[] = [
  {
    name: 'Style',
    type: 'blog',
    description: 'Outfit ideas and styling inspiration.',
    imageUrl: '/images/womenswear_main_banners_web_d97f63106e.avif',
  },
  {
    name: 'Fashion Tips',
    type: 'blog',
    description: 'Practical wardrobe and care advice.',
    imageUrl: '/images/menswear_main_banners_web_71e06f6f3f.avif',
  },
  {
    name: 'Guides',
    type: 'blog',
    description: 'Buying guides and size charts.',
    imageUrl: '/images/Luxe_Fest_Main_Banner_Web_0065511ae5.avif',
  },
]

export interface SeedVariant {
  price: number
  listPrice: number
  images: string[]
  size?: string[]
  countInStock: number
}

export interface SeedProduct {
  name: string
  brand: string
  description: string
  categoryName: string
  variants: SeedVariant[]
  tags: string[]
  numSales: number
}

const apparelSizes = ['S', 'M', 'L', 'XL', 'XXL']
const shoeSizes = ['6', '7', '8', '9', '10', '11']

export const products: SeedProduct[] = [
  // ------------------------------------------------------------------ Women
  {
    name: "Libas Women's Straight Kurta Set",
    brand: 'Libas',
    description:
      "<p>The Libas Straight Kurta Set brings together a soft, breathable fabric and a fuss-free silhouette that works from work to weekends. The three-piece set pairs a straight-cut kurta with matching bottoms and a coordinated dupatta.</p><p>Finished with a mandarin neckline and three-quarter sleeves, it is tailored to flatter without feeling restrictive. The breathable weave keeps you comfortable through long days.</p><ul><li>Three-piece set: kurta, bottoms and dupatta</li><li>Straight fit with mandarin neck and 3/4 sleeves</li><li>Soft, breathable cotton-blend fabric</li><li>Available in four colourways</li><li>Machine washable</li></ul>",
    categoryName: 'Western Wear',
    variants: [
      {
        price: 1899,
        listPrice: 2799,
        images: ['/images/A26LIB56076INK_PINK.avif'],
        size: apparelSizes,
        countInStock: 24,
      },
      {
        price: 1899,
        listPrice: 2799,
        images: ['/images/A26LIB56098ARD_MUSTARD.avif'],
        size: apparelSizes,
        countInStock: 18,
      },
      {
        price: 1999,
        listPrice: 2899,
        images: ['/images/A26LIB56100NGE_ORANGE.avif'],
        size: apparelSizes,
        countInStock: 15,
      },
      {
        price: 1899,
        listPrice: 2799,
        images: ['/images/A26LIB56107LUE_BLUE.avif'],
        size: apparelSizes,
        countInStock: 21,
      },
    ],
    tags: ['kurtas', 'ethnic', 'women', 'libas', 'sets', 'cotton'],
    numSales: 68,
  },
  {
    name: "Libas Women's Daily Wear Kurta",
    brand: 'Libas',
    description:
      "<p>A wardrobe staple from Libas, this everyday kurta is cut in a relaxed straight fit for all-day ease. The subtle print adds just the right amount of interest to a simple silhouette.</p><p>Pair it with leggings or the matching bottom for a complete look that is ready in minutes.</p><ul><li>Relaxed straight-fit kurta</li><li>Soft printed fabric with a breathable feel</li><li>Side slits for easy movement</li><li>Everyday value pricing</li></ul>",
    categoryName: 'Women',
    variants: [
      {
        price: 1099,
        listPrice: 1699,
        images: ['/images/S26LI99871AR_MUSTARD.avif'],
        size: apparelSizes,
        countInStock: 32,
      },
    ],
    tags: ['kurtas', 'ethnic', 'women', 'libas', 'daily-wear'],
    numSales: 51,
  },
  {
    name: "Juniper Women's Printed Top",
    brand: 'Juniper',
    description:
      "<p>A breezy printed top from Juniper that layers effortlessly over denim or tailored trousers. The lightweight fabric and easy fit make it a go-to for warm days.</p><p>Finished with a comfortable round neck and short sleeves, it is an easy way to add colour to your rotation.</p><ul><li>Relaxed fit with round neck</li><li>Lightweight printed fabric</li><li>Short sleeves</li><li>Two colourways available</li></ul>",
    categoryName: 'Western Wear',
    variants: [
      {
        price: 899,
        listPrice: 1399,
        images: ['/images/A26JU14035IG_INDIGO.avif'],
        size: apparelSizes,
        countInStock: 28,
      },
      {
        price: 999,
        listPrice: 1499,
        images: ['/images/A26JU1919IN_PINK.avif'],
        size: apparelSizes,
        countInStock: 20,
      },
    ],
    tags: ['tops', 'women', 'juniper', 'western', 'casual'],
    numSales: 37,
  },
  {
    name: "Biba Women's Printed Kurta",
    brand: 'Biba',
    description:
      "<p>The Biba printed kurta blends festive-ready detailing with everyday comfort. A flattering straight silhouette and a rich all-over print make it a standout pick for gatherings and celebrations.</p><p>Style it with churidar or palazzos and a pair of juttis to complete the look.</p><ul><li>Straight-fit printed kurta</li><li>Vibrant all-over ethnic print</li><li>Three-quarter sleeves</li><li>Two festive colourways</li></ul>",
    categoryName: 'Western Wear',
    variants: [
      {
        price: 1499,
        listPrice: 2299,
        images: ['/images/A25BIJAMA30042L_BLUE.avif'],
        size: apparelSizes,
        countInStock: 19,
      },
      {
        price: 1499,
        listPrice: 2299,
        images: ['/images/A25BIASSO31415R_RED.avif'],
        size: apparelSizes,
        countInStock: 16,
      },
    ],
    tags: ['kurtas', 'ethnic', 'women', 'biba', 'festive'],
    numSales: 44,
  },
  {
    name: "Global Desi Women's Flared Top",
    brand: 'Global Desi',
    description:
      "<p>A free-spirited flared top from Global Desi, designed for movement and finished with a bohemian print. The soft drape and flattering cut make it an instant favourite.</p><p>Team it with wide-leg trousers or denim for an effortless everyday look.</p><ul><li>Flared silhouette with a relaxed drape</li><li>Boho-inspired print</li><li>Soft, flowy fabric</li><li>Two colourways available</li></ul>",
    categoryName: 'Women',
    variants: [
      {
        price: 1299,
        listPrice: 1899,
        images: ['/images/S26BITED32402RE_RED.avif'],
        size: apparelSizes,
        countInStock: 22,
      },
      {
        price: 1299,
        listPrice: 1899,
        images: ['/images/S26BITED32484LU_BLUE.avif'],
        size: apparelSizes,
        countInStock: 25,
      },
    ],
    tags: ['tops', 'women', 'global-desi', 'boho', 'western'],
    numSales: 33,
  },
  {
    name: "W Women's Designer Kurta",
    brand: 'W',
    description:
      "<p>A statement kurta from the house of W, crafted in a deep bottle-green hue with refined detailing. The structured cut and premium finish make it a versatile festive essential.</p><p>Pair it with contrasting bottoms for a polished evening look.</p><ul><li>Designer straight-fit kurta</li><li>Rich, deep-tone fabric</li><li>Refined neckline detailing</li><li>Festive-ready finish</li></ul>",
    categoryName: 'Western Wear',
    variants: [
      {
        price: 1699,
        listPrice: 2499,
        images: ['/images/S25JUP1352DARK_BOTTLE_GREEN.avif'],
        size: apparelSizes,
        countInStock: 14,
      },
    ],
    tags: ['kurtas', 'ethnic', 'women', 'w-brand', 'designer'],
    numSales: 26,
  },

  // -------------------------------------------------------------------- Men
  {
    name: "Allen Solly Men's Knit Sweater",
    brand: 'Allen Solly',
    description:
      "<p>A smart layering piece from Allen Solly, this knit sweater pairs a clean crew neckline with a soft, warm handle. The deep dark-blue tone works with everything from denim to tailored trousers.</p><p>Wear it solo or over a shirt for an easy weekend-to-work transition.</p><ul><li>Crew-neck knit sweater</li><li>Soft, warm blend fabric</li><li>Regular fit with ribbed trims</li><li>Deep dark-blue colourway</li></ul>",
    categoryName: 'Men',
    variants: [
      {
        price: 1499,
        listPrice: 2299,
        images: ['/images/allen_S26ASWRGBB01134_DARK_BLUE.avif'],
        size: apparelSizes,
        countInStock: 23,
      },
    ],
    tags: ['sweaters', 'men', 'allen-solly', 'winter', 'knitwear'],
    numSales: 41,
  },
  {
    name: "Allen Solly Men's Formal Trousers",
    brand: 'Allen Solly',
    description:
      "<p>Tailored for the work week, these Allen Solly trousers offer a sharp line and a comfortable stretch finish. The rich chocolate shade takes them easily from desk to dinner.</p><p>A wrinkle-resistant weave keeps you looking crisp through the day.</p><ul><li>Slim-fit formal trousers</li><li>Comfort-stretch wrinkle-resistant fabric</li><li>Four-pocket styling</li><li>Rich chocolate colourway</li></ul>",
    categoryName: 'Men',
    variants: [
      {
        price: 1799,
        listPrice: 2699,
        images: ['/images/allen_S26VHUWLPT22089_CHOCOLATE.avif'],
        size: ['30', '32', '34', '36', '38'],
        countInStock: 20,
      },
    ],
    tags: ['trousers', 'men', 'allen-solly', 'formal', 'office'],
    numSales: 34,
  },
  {
    name: "Latin Quarters Men's Linen Shirt",
    brand: 'Latin Quarters',
    description:
      "<p>A relaxed linen-blend shirt from Latin Quarters, cut in a soft beige that suits the season. The breathable weave and clean lines make it a natural pick for warm afternoons.</p><p>Leave it loose over chinos for a laid-back, well-dressed look.</p><ul><li>Linen-blend casual shirt</li><li>Regular fit with a soft collar</li><li>Breathable woven fabric</li><li>Neutral beige colourway</li></ul>",
    categoryName: 'Shirts',
    variants: [
      {
        price: 1399,
        listPrice: 1999,
        images: ['/images/latien_S26LQT11696_BEIGE.avif'],
        size: apparelSizes,
        countInStock: 27,
      },
    ],
    tags: ['shirts', 'men', 'latin-quarters', 'linen', 'casual'],
    numSales: 30,
  },
  {
    name: "Roadster Men's Casual Shirt",
    brand: 'Roadster',
    description:
      "<p>An easy everyday shirt from Roadster, finished in a versatile black that pairs with almost anything. The soft cotton weave and regular fit keep it comfortable from morning to night.</p><p>Roll the sleeves and team it with jeans for a laid-back weekend look.</p><ul><li>Regular-fit casual shirt</li><li>Soft breathable cotton</li><li>Classic button-down front</li><li>Versatile solid black</li></ul>",
    categoryName: 'Shirts',
    variants: [
      {
        price: 999,
        listPrice: 1599,
        images: ['/images/A25346BT01_BLACK.avif'],
        size: apparelSizes,
        countInStock: 35,
      },
    ],
    tags: ['shirts', 'men', 'roadster', 'casual', 'cotton'],
    numSales: 47,
  },
  {
    name: "HIGHLANDER Men's Slim Fit Shirt",
    brand: 'HIGHLANDER',
    description:
      "<p>Cut close to the body with a modern slim line, this HIGHLANDER shirt is made for a sharp, put-together look. The deep black shade works equally well for the office or an evening out.</p><p>A durable cotton blend holds its shape and colour wash after wash.</p><ul><li>Slim-fit silhouette</li><li>Durable cotton-blend fabric</li><li>Structured collar and cuffs</li><li>Solid deep black</li></ul>",
    categoryName: 'Shirts',
    variants: [
      {
        price: 1099,
        listPrice: 1699,
        images: ['/images/A25346DR101_BLACK.avif'],
        size: apparelSizes,
        countInStock: 31,
      },
    ],
    tags: ['shirts', 'men', 'highlander', 'slim-fit'],
    numSales: 29,
  },

  // --------------------------------------------------------------- Footwear
  {
    name: "Viro Men's Formal Lace-Up Shoes",
    brand: 'Viro',
    description:
      "<p>Polished and dependable, these Viro formal shoes bring a crisp finish to tailoring and smart-casual looks alike. The cushioned insole keeps long days comfortable, while the durable outsole grips the ground.</p><p>A timeless black lace-up that belongs in every wardrobe.</p><ul><li>Classic formal lace-up design</li><li>Cushioned footbed for all-day comfort</li><li>Durable, slip-resistant outsole</li><li>Two versatile styles available</li></ul>",
    categoryName: 'Footwear',
    variants: [
      {
        price: 1999,
        listPrice: 2999,
        images: ['/images/viro_A25VM10313570B_BLACK.avif'],
        size: shoeSizes,
        countInStock: 26,
      },
      {
        price: 2199,
        listPrice: 3299,
        images: ['/images/viro_A25VM901422902_BLACK.avif'],
        size: shoeSizes,
        countInStock: 18,
      },
    ],
    tags: ['footwear', 'men', 'viro', 'formal', 'shoes'],
    numSales: 39,
  },

  // ---------------------------------------------------------------- Watches
  {
    name: 'Casio Analog Dress Watch',
    brand: 'Casio',
    description:
      "<p>A clean, minimal analog watch from Casio with a refined dial and a comfortable strap. Reliable quartz movement and a legible face make it an everyday classic.</p><p>Dressy enough for work and easy enough for the weekend.</p><ul><li>Analog quartz movement</li><li>Minimal, easy-to-read dial</li><li>Comfortable, durable strap</li><li>Water-resistant build</li></ul>",
    categoryName: 'Watches',
    variants: [
      {
        price: 2499,
        listPrice: 3499,
        images: ['/images/casio_WTITWEL17202_NoColour.avif'],
        countInStock: 17,
      },
    ],
    tags: ['watches', 'analog', 'casio', 'men', 'everyday'],
    numSales: 52,
  },
  {
    name: 'Fossil Chronograph Watch',
    brand: 'Fossil',
    description:
      "<p>Make a statement with this Fossil chronograph, pairing a bold dial and sub-dials with a robust case. Built for those who like their accessories with a little more presence.</p><p>An ideal pick for both business and casual settings.</p><ul><li>Chronograph with sub-dial detailing</li><li>Bold, well-proportioned case</li><li>Reliable quartz movement</li><li>Premium finish and strap</li></ul>",
    categoryName: 'Watches',
    variants: [
      {
        price: 8999,
        listPrice: 11999,
        images: ['/images/fossil_WFIFES5417I_NoColour.avif'],
        countInStock: 9,
      },
    ],
    tags: ['watches', 'chronograph', 'fossil', 'men', 'premium'],
    numSales: 23,
  },
  {
    name: 'Timex Classic Watch',
    brand: 'Timex',
    description:
      "<p>Two timeless Timex designs in one listing, each built on the brand's reputation for rugged reliability and everyday value. A comfortable fit and a clear, unfussy dial make these easy picks for daily wear.</p><p>Choose your preferred style and colourway.</p><ul><li>Two classic designs to choose from</li><li>Dependable quartz movement</li><li>Comfortable everyday strap</li><li>Great value for money</li></ul>",
    categoryName: 'Watches',
    variants: [
      {
        price: 2999,
        listPrice: 4199,
        images: ['/images/timex_NoColour.avif'],
        countInStock: 20,
      },
      {
        price: 3499,
        listPrice: 4699,
        images: ['/images/timex_WTT95416KM02K_NoColour.avif'],
        countInStock: 14,
      },
    ],
    tags: ['watches', 'timex', 'men', 'classic', 'everyday'],
    numSales: 48,
  },
]

// Home page banners. Each banner links to a product by name, so the seed
// resolves the Product's _id and slug when inserting.
export interface SeedBanner {
  productName: string
  bannerUrl: string
  bannerType: 'Hero' | 'Common'
}

export const seedBanners: SeedBanner[] = [
  // Hero banners (top home carousel)
  {
    productName: "Viro Men's Formal Lace-Up Shoes",
    bannerUrl: '/images/footwear_main_banners_web_da722e42d4.avif',
    bannerType: 'Hero',
  },
  {
    productName: "Allen Solly Men's Formal Trousers",
    bannerUrl: '/images/menswear_main_banners_web_71e06f6f3f.avif',
    bannerType: 'Hero',
  },
  {
    productName: 'Casio Analog Dress Watch',
    bannerUrl: '/images/watch_main_banners_web_156a722ff3.avif',
    bannerType: 'Hero',
  },
  {
    productName: "Libas Women's Straight Kurta Set",
    bannerUrl: '/images/womenswear_main_banners_web_d97f63106e.avif',
    bannerType: 'Hero',
  },
  {
    productName: "Global Desi Women's Flared Top",
    bannerUrl: '/images/Luxe_Fest_Main_Banner_Web_0065511ae5.avif',
    bannerType: 'Hero',
  },
  {
    productName: "Libas Women's Daily Wear Kurta",
    bannerUrl: '/images/handbags_main_banners_web_7ab8613644.avif',
    bannerType: 'Hero',
  },
  // Common banners (available for campaigns / later use)
  {
    productName: "Biba Women's Printed Kurta",
    bannerUrl: '/images/Biba_web_eef619ca8d.avif',
    bannerType: 'Common',
  },
  {
    productName: "Juniper Women's Printed Top",
    bannerUrl: '/images/Juniper_web_74cfa63296.avif',
    bannerType: 'Common',
  },
  {
    productName: "Libas Women's Straight Kurta Set",
    bannerUrl: '/images/Libas_web_833d923b6e.avif',
    bannerType: 'Common',
  },
  {
    productName: "Viro Men's Formal Lace-Up Shoes",
    bannerUrl: '/images/Footwear_web_c0d741627b.avif',
    bannerType: 'Common',
  },
  {
    productName: 'Timex Classic Watch',
    bannerUrl: '/images/Watches_web_eac9322703.avif',
    bannerType: 'Common',
  },
  {
    productName: "Allen Solly Men's Knit Sweater",
    bannerUrl: '/images/Men_web_c38beabd67.avif',
    bannerType: 'Common',
  },
  {
    productName: "Libas Women's Daily Wear Kurta",
    bannerUrl: '/images/Beauty_web_7965c69bea.avif',
    bannerType: 'Common',
  },
  {
    productName: "W Women's Designer Kurta",
    bannerUrl: '/images/Fragrance_web_a305b28e31.avif',
    bannerType: 'Common',
  },
  {
    productName: "Global Desi Women's Flared Top",
    bannerUrl: '/images/Handbags_web_7f4522f0ad.avif',
    bannerType: 'Common',
  },
  {
    productName: "Biba Women's Printed Kurta",
    bannerUrl: '/images/Kashish_web_8846f46537.avif',
    bannerType: 'Common',
  },
]

export interface SeedReviewTemplate {
  rating: number
  title: string
  comment: string
}

export const reviewTemplates: SeedReviewTemplate[] = [
  {
    rating: 5,
    title: 'Exceeded my expectations',
    comment:
      'Fantastic quality and it arrived earlier than promised. Would definitely buy again.',
  },
  {
    rating: 5,
    title: 'Absolutely love it',
    comment:
      'The fit and finish are spot on. Exactly as described and looks premium in person.',
  },
  {
    rating: 4,
    title: 'Great value for money',
    comment:
      'Very happy with the purchase. Minor details could be better but overall excellent.',
  },
  {
    rating: 4,
    title: 'Good, would recommend',
    comment:
      'Comfortable and well made. Took a couple of days to get used to but now a favourite.',
  },
  {
    rating: 3,
    title: 'Decent product',
    comment:
      'Does the job. Nothing extraordinary but the price makes it worth it.',
  },
  {
    rating: 5,
    title: 'Perfect buy',
    comment:
      'Looks even better than the photos. Packaging was neat and delivery was quick.',
  },
  {
    rating: 4,
    title: 'Happy customer',
    comment:
      'Good quality material and a nice colour. Fits true to size for me.',
  },
  {
    rating: 2,
    title: 'Not quite as expected',
    comment:
      'Quality is okay but the shade was slightly different from the listing images.',
  },
  {
    rating: 5,
    title: 'Worth every rupee',
    comment:
      'Sturdy, stylish and comfortable. I have already recommended it to friends.',
  },
  {
    rating: 3,
    title: 'Average experience',
    comment:
      'It is fine for the price but I expected slightly better finishing.',
  },
  {
    rating: 4,
    title: 'Solid choice',
    comment:
      'Reliable and good looking. Will likely order another in a different colour.',
  },
  {
    rating: 5,
    title: 'Highly recommended',
    comment:
      'Excellent craftsmanship and fast shipping. No complaints at all.',
  },
]

export interface SeedBlogPost {
  title: string
  slug: string
  image: string
  categoryName: string
  tags: string[]
  excerpt: string
  content: string
  date: string
  author: string
}

export const blogPosts: SeedBlogPost[] = [
  {
    title: '10 Timeless Denim Looks for Every Season',
    slug: 'timeless-denim-looks',
    image: '/images/womenswear_main_banners_web_d97f63106e.avif',
    categoryName: 'Style',
    tags: ['denim', 'style', 'outfits'],
    excerpt:
      'Denim never goes out of style. Here are ten versatile ways to wear jeans through the year.',
    content:
      '<p>Denim is the most versatile fabric in any wardrobe. From a classic straight leg to a modern slim taper, the right pair can anchor an entire outfit.</p><p>Pair dark indigo jeans with a crisp white shirt for an elevated evening look, or go relaxed with a graphic tee and white sneakers for the weekend.</p><p>Remember to keep proportions balanced: if your jeans are skinny, choose a looser top, and if they are wide, keep the upper half fitted.</p>',
    date: '2026-01-12',
    author: 'Lemon Fashion',
  },
  {
    title: 'How to Choose the Right Sneakers for Your Feet',
    slug: 'choose-right-sneakers',
    image: '/images/footwear_main_banners_web_da722e42d4.avif',
    categoryName: 'Guides',
    tags: ['shoes', 'sneakers', 'guide'],
    excerpt:
      'From arch support to cushioning, here is how to pick sneakers that actually fit your feet.',
    content:
      '<p>The best sneaker is the one that matches your foot shape and the way you move. Start by measuring your feet later in the day when they are at their largest.</p><p>Look for cushioning if you run or walk a lot, and stability if you overpronate. Breathable mesh uppers keep your feet cool during long wear.</p><p>Always try shoes in the evening, wear the socks you plan to use, and check for a thumb-width of space at the toe.</p>',
    date: '2026-01-20',
    author: 'Lemon Fashion',
  },
  {
    title: 'Caring for Your Cotton T-Shirts So They Last Longer',
    slug: 'care-for-cotton-tshirts',
    image: '/images/menswear_main_banners_web_71e06f6f3f.avif',
    categoryName: 'Fashion Tips',
    tags: ['t-shirts', 'care', 'cotton'],
    excerpt:
      'A few simple habits will keep your favourite tees soft, bright and shapely for years.',
    content:
      '<p>Cotton is durable but it rewards good habits. Wash tees inside out in cold water to protect the print and the colour.</p><p>Avoid the dryer where possible; air drying keeps the fabric and the fit intact. Fold rather than hang knit tees to prevent shoulder stretch.</p><p>Use a mild detergent and never overload the machine, so your tees get a proper rinse and dry evenly.</p>',
    date: '2026-02-02',
    author: 'Lemon Fashion',
  },
  {
    title: 'Analog vs Smartwatches: Which Should You Buy?',
    slug: 'analog-vs-smartwatches',
    image: '/images/watch_main_banners_web_156a722ff3.avif',
    categoryName: 'Guides',
    tags: ['watches', 'smartwatch', 'buying-guide'],
    excerpt:
      'Classic craftsmanship or connected convenience? We break down how to decide.',
    content:
      '<p>An analog watch is a piece of jewellery you wear for decades. It never needs charging and its style is timeless.</p><p>A smartwatch, on the other hand, tracks your health, shows notifications and can be customised endlessly with watch faces.</p><p>Consider your lifestyle: if you care about fitness and connectivity, go smart; if you value heritage and simplicity, choose analog.</p>',
    date: '2026-02-15',
    author: 'Lemon Fashion',
  },
  {
    title: 'Building a Capsule Wardrobe on a Budget',
    slug: 'capsule-wardrobe-on-a-budget',
    image: '/images/Luxe_Fest_Main_Banner_Web_0065511ae5.avif',
    categoryName: 'Style',
    tags: ['style', 'capsule', 'budget'],
    excerpt:
      'You do not need a huge closet to look great every day. Start with these essentials.',
    content:
      '<p>A capsule wardrobe is a small, curated set of pieces that mix and match effortlessly. Begin with neutral basics: well-fitting tees, a great pair of jeans and versatile sneakers.</p><p>Invest in quality over quantity. A durable pair of jeans worn twice a week beats five cheap pairs that fade after a month.</p><p>Add one statement piece you love, then build your palette around neutral tones that work together.</p>',
    date: '2026-03-01',
    author: 'Lemon Fashion',
  },
]

export interface SeedCoupon {
  code: string
  value: number
  minAmount: number
  status: 'Active' | 'Inactive'
  daysFromNow: number
}

export const coupons: SeedCoupon[] = [
  {
    code: 'WELCOME100',
    value: 100,
    minAmount: 999,
    status: 'Active',
    daysFromNow: 90,
  },
  {
    code: 'FLAT50',
    value: 50,
    minAmount: 499,
    status: 'Active',
    daysFromNow: 60,
  },
  {
    code: 'SAVE200',
    value: 200,
    minAmount: 1999,
    status: 'Active',
    daysFromNow: 30,
  },
]

export interface SeedUser {
  name: string
  email: string
  phone: string
  role: 'User' | 'Employee' | 'Admin'
  phoneVerified: boolean
}

export const users: SeedUser[] = [
  {
    name: 'Lemon Fashion Admin',
    email: 'admin@lemonfashion.com',
    phone: '9000000001',
    role: 'Admin',
    phoneVerified: true,
  },
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '9000000002',
    role: 'User',
    phoneVerified: true,
  },
  {
    name: 'Priya Verma',
    email: 'priya.verma@example.com',
    phone: '9000000003',
    role: 'User',
    phoneVerified: true,
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    phone: '9000000004',
    role: 'User',
    phoneVerified: true,
  },
]
