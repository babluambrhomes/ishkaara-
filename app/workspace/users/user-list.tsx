'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronLeft, ChevronRight, Circle } from 'lucide-react'

import DeleteDialog from '@/components/shared/delete-dialog'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useDebouncedValue } from '@/hooks/use-debounce'
import { deleteUser, getAllUsers } from '@/lib/actions/user.actions'
import { IUser } from '@/lib/models/user.model'
import { formatId } from '@/lib/utils'

type UserListDataProps = {
  data: IUser[]
  totalPages: number
  totalUsers: number
}

export default function UserList({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast()
  const [page, setPage] = useState<number>(1)
  const [query, setQuery] = useState<string>('')
  const [data, setData] = useState<UserListDataProps>()
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebouncedValue(query, 500)

  const loadData = useCallback(
    (searchQuery: string, pageNumber: number) => {
      startTransition(async () => {
        try {
          const res = await getAllUsers({
            page: pageNumber,
            query: searchQuery,
          })
          setData(res)
        } catch (error) {
          toast({
            variant: 'destructive',
            description:
              error instanceof Error ? error.message : 'Failed to load users',
          })
        }
      })
    },
    [startTransition, toast]
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

  return (
    <div className='space-y-2'>
      <div className='flex-between flex-wrap gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='h1-bold'>Users</h1>
          <Input
            className='w-auto'
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search name, email or phone...'
          />
          {isPending ? (
            <p>Loading...</p>
          ) : (
            <p>
              {data?.totalUsers === 0
                ? 'No'
                : `${data?.totalUsers ?? 0}`}
              {' results'}
            </p>
          )}
        </div>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((user: IUser) => (
              <TableRow key={user._id}>
                <TableCell className='text-muted-foreground'>
                  {formatId(user._id)}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <UserAvatar
                      src={user.profile}
                      name={user.name}
                      size={36}
                    />
                    <div className='min-w-0'>
                      <div className='font-medium'>{user.name}</div>
                      <div className='truncate text-xs text-muted-foreground'>
                        {user.email || '—'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.phone ? (
                    <span className='inline-flex items-center gap-1.5'>
                      {user.phone}
                      {user.phoneVerified ? (
                        <CheckCircle2
                          className='h-3.5 w-3.5 text-green-600'
                          aria-label='Verified'
                        />
                      ) : (
                        <Circle
                          className='h-3.5 w-3.5 text-muted-foreground/50'
                          aria-label='Not verified'
                        />
                      )}
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className='flex gap-1'>
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/workspace/users/${user._id}`}>Edit</Link>
                  </Button>
                  {isAdmin && (
                    <DeleteDialog
                      id={user._id}
                      action={deleteUser}
                      callbackAction={() => loadData(debouncedQuery, page)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(data?.totalPages ?? 0) > 1 && (
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => handlePageChange('prev')}
              disabled={Number(page) <= 1}
              className='w-24'
            >
              <ChevronLeft /> Previous
            </Button>
            Page {page} of {data?.totalPages}
            <Button
              variant='outline'
              onClick={() => handlePageChange('next')}
              disabled={Number(page) >= (data?.totalPages ?? 0)}
              className='w-24'
            >
              Next <ChevronRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
