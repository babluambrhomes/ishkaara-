import { notFound } from 'next/navigation'

import { getProductById } from '@/lib/actions/product.actions'
import { getCategoriesByType } from '@/lib/actions/category.actions'
import Link from 'next/link'
import ProductForm from '../product-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Product',
}

type UpdateProductProps = {
  params: Promise<{
    id: string
  }>
}

const UpdateProduct = async (props: UpdateProductProps) => {
  const params = await props.params

  const { id } = params

  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategoriesByType('product'),
  ])
  if (!product) notFound()
  return (
    <main className='max-w-6xl mx-auto p-4'>
      <div className='flex mb-4'>
        <Link href='/workspace/products'>Products</Link>
        <span className='mx-1'>›</span>
        <Link href={`/workspace/products/${product._id}`}>{product._id}</Link>
      </div>

      <div className='my-8'>
        <ProductForm
          type='Update'
          product={product}
          productId={product._id}
          categories={categories}
        />
      </div>
    </main>
  )
}

export default UpdateProduct
