/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Link from 'next/link'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  deleteBlogPost,
  getAllBlogPostsForAdmin,
} from '@/lib/actions/blog.actions'
import { IPost } from '@/lib/db/models/blog-post.model'

import React, { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { formatDateTime, formatId } from '@/lib/utils'

type PostListDataProps = {
  posts: IPost[]
  totalPages: number
  totalPosts: number
  to: number
  from: number
}
const PostList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<PostListDataProps>()
  const [isPending, startTransition] = useTransition()

  const loadData = (query: string, pageNumber: number) => {
    startTransition(async () => {
      const data = await getAllBlogPostsForAdmin({
        query,
        page: pageNumber,
      })
      setData(data)
    })
  }

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    setPage(newPage)
    loadData(inputValue, newPage)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    clearTimeout((window as any).debounce)
    ;(window as any).debounce = setTimeout(() => {
      setPage(1)
      loadData(value, 1)
    }, 500)
  }

  useEffect(() => {
    loadData('', 1)
  }, [])

  const totalPages = data?.totalPages ?? 0

  return (
    <div className='space-y-2'>
      <div className='flex-between flex-wrap gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='font-bold text-lg'>Blog Posts</h1>
          <div className='flex flex-wrap items-center gap-2'>
            <Input
              className='w-auto'
              type='text'
              value={inputValue}
              onChange={handleInputChange}
              placeholder='Filter title...'
            />
            {isPending ? (
              <p>Loading...</p>
            ) : (
              <p>
                {data?.totalPosts === 0
                  ? 'No'
                  : `${data?.from}-${data?.to} of ${data?.totalPosts}`}
                {' results'}
              </p>
            )}
          </div>
        </div>

        <Button asChild variant='default'>
          <Link href='/admin/blog/posts/create'>Create Post</Link>
        </Button>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.posts.map((post: IPost) => (
              <TableRow key={post._id}>
                <TableCell>{formatId(post._id)}</TableCell>
                <TableCell>
                  <Link href={`/admin/blog/posts/${post._id}`}>
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>
                  {formatDateTime(new Date(post.date)).dateOnly}
                </TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>{post.isPublished ? 'Yes' : 'No'}</TableCell>
                <TableCell className='flex gap-1'>
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/admin/blog/posts/${post._id}`}>Edit</Link>
                  </Button>
                  <Button asChild variant='outline' size='sm'>
                    <Link target='_blank' href={`/blog/${post.slug}`}>
                      View
                    </Link>
                  </Button>
                  <DeleteDialog
                    id={post._id}
                    action={deleteBlogPost}
                    callbackAction={() => loadData(inputValue, page)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => handlePageChange('prev')}
              disabled={Number(page) <= 1}
              className='w-24'
            >
              Previous
            </Button>
            Page {page} of {totalPages}
            <Button
              variant='outline'
              onClick={() => handlePageChange('next')}
              disabled={Number(page) >= totalPages}
              className='w-24'
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostList