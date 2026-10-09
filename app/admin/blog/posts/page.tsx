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
import { IPost } from '@/lib/models/blog-post.model'

import React, { useCallback, useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { formatDateTime, formatId } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/use-debounce'

type PostListDataProps = {
  posts: IPost[]
  totalPages: number
  totalPosts: number
  to: number
  from: number
}

export default function AdminBlog() {
  const [page, setPage] = useState<number>(1)
  const [query, setQuery] = useState<string>('')
  const [data, setData] = useState<PostListDataProps>()
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebouncedValue(query, 500)

  const loadData = useCallback(
    (searchQuery: string, pageNumber: number) => {
      startTransition(async () => {
        const data = await getAllBlogPostsForAdmin({
          query: searchQuery,
          page: pageNumber,
        })
        setData(data)
      })
    },
    [startTransition]
  )

  useEffect(() => {
    setPage(1)
    loadData(debouncedQuery, 1)
  }, [debouncedQuery, loadData])

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    setPage(newPage)
    loadData(debouncedQuery, newPage)
  }

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
              <TableHead>Status</TableHead>
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
                <TableCell>{post.categoryName}</TableCell>
                <TableCell>
                  {formatDateTime(new Date(post.date)).dateOnly}
                </TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell className='capitalize'>{post.status}</TableCell>
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
                    callbackAction={() => loadData(debouncedQuery, page)}
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
