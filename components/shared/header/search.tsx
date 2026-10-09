import { SearchIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { getAllCategories } from '@/lib/actions/product.actions'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select'
import { getSetting } from '@/lib/actions/setting.actions'

export default async function Search() {
  const {
    site: { name },
  } = await getSetting()
  const categories = await getAllCategories()

  return (
    <form
      action='/search'
      method='GET'
      className='flex items-stretch gap-1.5 h-10'
    >
      <div className='flex items-center flex-1 overflow-hidden rounded-full bg-white shadow-inner-soft focus-within:ring-2 focus-within:ring-gold/70'>
        <Select name='category'>
          <SelectTrigger className='w-auto h-full border-0 bg-white text-black/70 rounded-none pl-4 pr-1 focus:ring-0'>
            <SelectValue placeholder='All' />
          </SelectTrigger>
          <SelectContent position='popper'>
            <SelectItem value='all'>All</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className='flex-1 h-full rounded-none border-0 bg-white text-black text-base focus-visible:ring-0'
          placeholder={`Search ${name}`}
          name='q'
          type='search'
        />
      </div>
      <button
        type='submit'
        aria-label='Search'
        className='flex w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#f6c344] to-[#d99a12] text-[#3d1a00] shadow-soft transition-all duration-200 hover:brightness-110 active:scale-95'
      >
        <SearchIcon className='h-5 w-5' />
      </button>
    </form>
  )
}
