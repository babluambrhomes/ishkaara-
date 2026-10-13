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
    name: 'Jeans',
    type: 'product',
    description: 'Denim jeans for every fit and finish.',
    imageUrl: '/images/jeans.jpg',
  },
  {
    name: 'Shoes',
    type: 'product',
    description: 'Sneakers, running shoes and everyday footwear.',
    imageUrl: '/images/shoes.jpg',
  },
  {
    name: 'T-Shirts',
    type: 'product',
    description: 'Everyday tees and polos in breathable cotton.',
    imageUrl: '/images/t-shirts.jpg',
  },
  {
    name: 'Wrist Watches',
    type: 'product',
    description: 'Analog, chronograph and smart watches.',
    imageUrl: '/images/wrist-watches.jpg',
  },
]

export const blogCategories: SeedCategory[] = [
  {
    name: 'Style',
    type: 'blog',
    description: 'Outfit ideas and styling inspiration.',
    imageUrl: '/images/banner1.jpg',
  },
  {
    name: 'Fashion Tips',
    type: 'blog',
    description: 'Practical wardrobe and care advice.',
    imageUrl: '/images/banner2.jpg',
  },
  {
    name: 'Guides',
    type: 'blog',
    description: 'Buying guides and size charts.',
    imageUrl: '/images/banner3.jpg',
  },
]

export interface SeedProduct {
  name: string
  brand: string
  description: string
  categoryName: string
  images: string[]
  price: number
  listPrice: number
  countInStock: number
  sizes?: string[]
  tags: string[]
  numSales: number
}

const imgs = (code: string, count = 2): string[] =>
  Array.from({ length: count }, (_, i) => `/images/${code}-${i + 1}.jpg`)

const waistSizes = ['28', '30', '32', '34', '36']
const shoeSizes = ['6', '7', '8', '9', '10', '11']
const teeSizes = ['S', 'M', 'L', 'XL', 'XXL']

export const products: SeedProduct[] = [
  // Jeans
  {
    name: "Levi's 511 Slim Fit Jeans",
    brand: "Levi's",
    description:
      'Slim through the seat and thigh with a modern tapered leg. Crafted from comfort-stretch denim that moves with you.',
    categoryName: 'Jeans',
    images: imgs('p11'),
    price: 3499,
    listPrice: 4999,
    countInStock: 25,
    sizes: waistSizes,
    tags: ['jeans', 'denim', 'slim-fit', "levi's"],
    numSales: 42,
  },
  {
    name: 'Wrangler Texas Stretch Jeans',
    brand: 'Wrangler',
    description:
      'A regular fit icon with a touch of stretch for all-day comfort and a classic five-pocket styling.',
    categoryName: 'Jeans',
    images: imgs('p12', 4),
    price: 2899,
    listPrice: 3999,
    countInStock: 18,
    sizes: waistSizes,
    tags: ['jeans', 'denim', 'regular-fit', 'wrangler'],
    numSales: 31,
  },
  {
    name: 'Lee Extreme Motion Jeans',
    brand: 'Lee',
    description:
      'Built with Extreme Motion technology for unstoppable movement, featuring a slim-straight silhouette.',
    categoryName: 'Jeans',
    images: imgs('p13'),
    price: 3199,
    listPrice: 4599,
    countInStock: 22,
    sizes: waistSizes,
    tags: ['jeans', 'denim', 'stretch', 'lee'],
    numSales: 27,
  },
  {
    name: 'Pepe Jeans Kingston Slim',
    brand: 'Pepe Jeans',
    description:
      'Slim-fit denim with a clean dark indigo wash and durable construction for everyday wear.',
    categoryName: 'Jeans',
    images: imgs('p14'),
    price: 2599,
    listPrice: 3699,
    countInStock: 30,
    sizes: waistSizes,
    tags: ['jeans', 'denim', 'slim-fit', 'pepe'],
    numSales: 19,
  },
  {
    name: 'Spykar Skinny Fit Jeans',
    brand: 'Spykar',
    description:
      'A sharp skinny fit with high-recovery stretch, designed for a modern street-ready look.',
    categoryName: 'Jeans',
    images: imgs('p15'),
    price: 2199,
    listPrice: 3299,
    countInStock: 16,
    sizes: waistSizes,
    tags: ['jeans', 'denim', 'skinny', 'spykar'],
    numSales: 15,
  },
  {
    name: "Levi's 501 Original Fit Jeans",
    brand: "Levi's",
    description:
      'The original button-fly jean since 1873. Straight leg, regular fit and legendary durability.',
    categoryName: 'Jeans',
    images: imgs('p16'),
    price: 3999,
    listPrice: 5499,
    countInStock: 12,
    sizes: waistSizes,
    tags: ['jeans', 'denim', 'original', "levi's"],
    numSales: 55,
  },

  // Shoes
  {
    name: 'Nike Air Zoom Pegasus 40',
    brand: 'Nike',
    description:
      'Responsive Air Zoom cushioning and a breathable mesh upper for your daily run.',
    categoryName: 'Shoes',
    images: imgs('p21'),
    price: 6999,
    listPrice: 8999,
    countInStock: 15,
    sizes: shoeSizes,
    tags: ['shoes', 'running', 'sneakers', 'nike'],
    numSales: 38,
  },
  {
    name: 'Adidas Ultraboost 22',
    brand: 'Adidas',
    description:
      'Incredible energy return from BOOST midsole with a Primeknit upper that adapts to your stride.',
    categoryName: 'Shoes',
    images: imgs('p22'),
    price: 7999,
    listPrice: 10999,
    countInStock: 10,
    sizes: shoeSizes,
    tags: ['shoes', 'running', 'sneakers', 'adidas'],
    numSales: 24,
  },
  {
    name: 'Puma Smash v2 Sneakers',
    brand: 'Puma',
    description:
      'A timeless court-inspired sneaker with a soft leather upper for everyday comfort.',
    categoryName: 'Shoes',
    images: imgs('p23'),
    price: 2999,
    listPrice: 4499,
    countInStock: 28,
    sizes: shoeSizes,
    tags: ['shoes', 'sneakers', 'casual', 'puma'],
    numSales: 46,
  },
  {
    name: 'Reebok Classic Leather',
    brand: 'Reebok',
    description:
      'The 1983 legend returns in soft garment leather with a die-cut EVA midsole.',
    categoryName: 'Shoes',
    images: imgs('p24'),
    price: 4499,
    listPrice: 5999,
    countInStock: 20,
    sizes: shoeSizes,
    tags: ['shoes', 'sneakers', 'classic', 'reebok'],
    numSales: 29,
  },
  {
    name: 'New Balance 574',
    brand: 'New Balance',
    description:
      'An everyday icon blending suede and mesh with ENCAP cushioning for all-day support.',
    categoryName: 'Shoes',
    images: imgs('p25'),
    price: 5999,
    listPrice: 7499,
    countInStock: 14,
    sizes: shoeSizes,
    tags: ['shoes', 'sneakers', 'newbalance'],
    numSales: 21,
  },
  {
    name: 'Vans Old Skool',
    brand: 'Vans',
    description:
      'The classic side-stripe skate shoe with a durable suede and canvas upper.',
    categoryName: 'Shoes',
    images: imgs('p26'),
    price: 3499,
    listPrice: 4999,
    countInStock: 24,
    sizes: shoeSizes,
    tags: ['shoes', 'sneakers', 'skate', 'vans'],
    numSales: 34,
  },

  // T-Shirts
  {
    name: "Levi's Housemark Graphic Tee",
    brand: "Levi's",
    description:
      'A soft cotton crew-neck tee finished with the iconic Housemark logo.',
    categoryName: 'T-Shirts',
    images: imgs('p31'),
    price: 899,
    listPrice: 1299,
    countInStock: 50,
    sizes: teeSizes,
    tags: ['t-shirts', 'cotton', 'crew-neck', "levi's"],
    numSales: 88,
  },
  {
    name: 'U.S. Polo Assn. Crew Neck Tee',
    brand: 'U.S. Polo Assn.',
    description:
      'Pure cotton crew-neck tee with a comfortable regular fit and subtle branding.',
    categoryName: 'T-Shirts',
    images: imgs('p32'),
    price: 799,
    listPrice: 1199,
    countInStock: 45,
    sizes: teeSizes,
    tags: ['t-shirts', 'cotton', 'casual', 'uspa'],
    numSales: 73,
  },
  {
    name: 'Allen Solly Solid Polo',
    brand: 'Allen Solly',
    description:
      'A smart-casual pique polo with a ribbed collar and three-button placket.',
    categoryName: 'T-Shirts',
    images: imgs('p33'),
    price: 1299,
    listPrice: 1799,
    countInStock: 35,
    sizes: teeSizes,
    tags: ['t-shirts', 'polo', 'smart-casual', 'allen-solly'],
    numSales: 40,
  },
  {
    name: 'Van Heusen Cotton T-Shirt',
    brand: 'Van Heusen',
    description:
      'Breathable combed cotton in a tailored fit that works from desk to dinner.',
    categoryName: 'T-Shirts',
    images: imgs('p34'),
    price: 999,
    listPrice: 1499,
    countInStock: 40,
    sizes: teeSizes,
    tags: ['t-shirts', 'cotton', 'formal', 'van-heusen'],
    numSales: 36,
  },
  {
    name: 'H&M Regular Fit Tee',
    brand: 'H&M',
    description:
      'A wardrobe staple in soft jersey with a relaxed regular fit.',
    categoryName: 'T-Shirts',
    images: imgs('p35'),
    price: 599,
    listPrice: 899,
    countInStock: 60,
    sizes: teeSizes,
    tags: ['t-shirts', 'jersey', 'basics', 'hm'],
    numSales: 95,
  },
  {
    name: 'Zara Basic Crew Tee',
    brand: 'Zara',
    description:
      'Minimal crew-neck tee with a refined neckline and premium cotton feel.',
    categoryName: 'T-Shirts',
    images: imgs('p36'),
    price: 1199,
    listPrice: 1599,
    countInStock: 33,
    sizes: teeSizes,
    tags: ['t-shirts', 'cotton', 'minimal', 'zara'],
    numSales: 44,
  },

  // Wrist Watches
  {
    name: 'Titan Neo Analog Watch',
    brand: 'Titan',
    description:
      'A slim analog watch with a stainless-steel case and a clean white dial.',
    categoryName: 'Wrist Watches',
    images: imgs('p41'),
    price: 2499,
    listPrice: 3499,
    countInStock: 20,
    tags: ['watches', 'analog', 'titan'],
    numSales: 52,
  },
  {
    name: 'Fossil Gen 5 Smartwatch',
    brand: 'Fossil',
    description:
      'A Wear OS smartwatch with heart-rate tracking, GPS and always-on display.',
    categoryName: 'Wrist Watches',
    images: imgs('p42'),
    price: 19999,
    listPrice: 24999,
    countInStock: 8,
    tags: ['watches', 'smartwatch', 'fossil'],
    numSales: 17,
  },
  {
    name: 'Casio Edifice Chronograph',
    brand: 'Casio',
    description:
      'A motorsport-inspired chronograph with a tachymeter bezel and stopwatch.',
    categoryName: 'Wrist Watches',
    images: imgs('p43'),
    price: 8999,
    listPrice: 11999,
    countInStock: 12,
    tags: ['watches', 'chronograph', 'casio'],
    numSales: 23,
  },
  {
    name: 'Fastrack Reflex V2',
    brand: 'Fastrack',
    description:
      'A lightweight fitness band with activity, sleep and heart-rate tracking.',
    categoryName: 'Wrist Watches',
    images: imgs('p44'),
    price: 1799,
    listPrice: 2499,
    countInStock: 26,
    tags: ['watches', 'smartwatch', 'fitness', 'fastrack'],
    numSales: 61,
  },
  {
    name: 'Daniel Wellington Classic',
    brand: 'Daniel Wellington',
    description:
      'A minimalist Swedish design with an ultra-thin case and interchangeable straps.',
    categoryName: 'Wrist Watches',
    images: imgs('p45'),
    price: 12999,
    listPrice: 15999,
    countInStock: 10,
    tags: ['watches', 'minimal', 'dw'],
    numSales: 14,
  },
  {
    name: 'Seiko 5 Sports Automatic',
    brand: 'Seiko',
    description:
      'A self-winding automatic movement with day-date display and a durable bracelet.',
    categoryName: 'Wrist Watches',
    images: imgs('p46'),
    price: 15999,
    listPrice: 19999,
    countInStock: 7,
    tags: ['watches', 'automatic', 'seiko'],
    numSales: 11,
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
    image: '/images/banner1.jpg',
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
    image: '/images/banner2.jpg',
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
    image: '/images/banner3.jpg',
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
    image: '/images/banner1.jpg',
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
    image: '/images/banner2.jpg',
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
