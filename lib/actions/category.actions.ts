'use server'

import { connectToDatabase } from '@/config/db'
import Category, { ICategory } from '@/lib/models/category.model'
import Product from '@/lib/models/product.model'
import BlogPost from '@/lib/models/blog-post.model'
import { revalidatePath } from 'next/cache'
import { formatError, toSlug } from '../utils'
import { CategoryInputSchema, CategoryUpdateSchema } from '../validator'
import { z } from 'zod'

const revalidateCategoryPaths = () => {
  revalidatePath('/admin/categories')
  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath('/blog')
}

const findDuplicate = async (
  name: string,
  type: string,
  excludeId?: string
) => {
  const categories = await Category.find(
    excludeId ? { type, _id: { $ne: excludeId } } : { type }
  )
  const normalized = name.trim().toLowerCase()
  return categories.some((c) => c.name.trim().toLowerCase() === normalized)
}

// CREATE
export async function createCategory(
  data: z.infer<typeof CategoryInputSchema>
) {
  try {
    const values = CategoryInputSchema.parse(data)
    await connectToDatabase()
    if (await findDuplicate(values.name, values.type)) {
      throw new Error(
        `A ${values.type} category named "${values.name.trim()}" already exists`
      )
    }
    await Category.create({
      ...values,
      name: values.name.trim(),
      slug: toSlug(values.name),
    })
    revalidateCategoryPaths()
    return { success: true, message: 'Category created successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE (rename cascades to products/posts; type stays locked after creation)
export async function updateCategory(
  data: z.infer<typeof CategoryUpdateSchema>
) {
  try {
    const values = CategoryUpdateSchema.parse(data)
    await connectToDatabase()
    const category = await Category.findById(values._id)
    if (!category) throw new Error('Category not found')

    const oldName = category.name
    const newName = values.name.trim()
    if (await findDuplicate(newName, values.type, values._id)) {
      throw new Error(
        `A ${values.type} category named "${newName}" already exists`
      )
    }

    const nameChanged = oldName !== newName
    category.name = newName
    category.slug = toSlug(newName)
    category.description = values.description
    category.imageUrl = values.imageUrl
    category.status = values.status
    await category.save()

    if (nameChanged) {
      const model = values.type === 'blog' ? BlogPost : Product
      await model.updateMany(
        { category: category._id },
        { categoryName: newName }
      )
    }

    revalidateCategoryPaths()
    return { success: true, message: 'Category updated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// DELETE (soft delete; blocked while products/posts still use it)
export async function deleteCategory(id: string) {
  try {
    await connectToDatabase()
    const category = await Category.findById(id)
    if (!category) throw new Error('Category not found')

    const model = category.type === 'blog' ? BlogPost : Product
    const count = await model.countDocuments({
      category: category._id,
      status: { $ne: 'delete' },
    })
    if (count > 0) {
      throw new Error(
        `Cannot delete: ${
          count > 1 ? `${count} ` : ''
        }${category.type === 'blog' ? 'post' : 'product'}${
          count > 1 ? 's' : ''
        } still use this category. Remove or reassign them first.`
      )
    }

    category.status = 'delete'
    await category.save()
    revalidateCategoryPaths()
    return { success: true, message: 'Category deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ACTIVE CATEGORIES BY TYPE (public consumers + forms)
export async function getCategoriesByType(
  type: 'product' | 'blog'
): Promise<ICategory[]> {
  await connectToDatabase()
  const categories = await Category.find({ type, status: 'public' }).sort({
    name: 1,
  })
  return JSON.parse(JSON.stringify(categories)) as ICategory[]
}

// GET ALL CATEGORIES FOR ADMIN (both types, active + inactive)
export async function getAllCategoriesForAdmin(): Promise<ICategory[]> {
  await connectToDatabase()
  const categories = await Category.find({ status: { $ne: 'delete' } }).sort({
    type: 1,
    name: 1,
  })
  return JSON.parse(JSON.stringify(categories)) as ICategory[]
}

// GET ONE CATEGORY BY ID
export async function getCategoryById(id: string): Promise<ICategory | null> {
  await connectToDatabase()
  const category = await Category.findById(id)
  if (!category) return null
  return JSON.parse(JSON.stringify(category)) as ICategory
}
