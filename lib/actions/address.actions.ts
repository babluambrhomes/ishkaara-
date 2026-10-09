'use server'

import { auth } from '@/auth'
import { IAddressWithId } from '@/types'
import { AddressInputSchema } from '@/lib/validator'
import { connectToDatabase } from '@/config/db'
import User from '../models/user.model'
import { formatError } from '../utils'
import { revalidatePath } from 'next/cache'
import { Types } from 'mongoose'
import { z } from 'zod'

const ADDRESS_LIMIT = 10

// GET
export async function getUserAddresses() {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session?.user?.id) return { data: [] as IAddressWithId[] }
    const user = await User.findById(session.user.id)
    if (!user) return { data: [] as IAddressWithId[] }
    return {
      data: JSON.parse(JSON.stringify(user.addresses)) as IAddressWithId[],
    }
  } catch (error) {
    return { data: [], message: formatError(error) }
  }
}

// CREATE / UPDATE
export async function saveAddress(
  data: z.infer<typeof AddressInputSchema>
) {
  try {
    AddressInputSchema.parse(data)
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')

    const addresses = currentUser.addresses as unknown as IAddressWithId[]
    const { _id, ...rest } = data
    const isFirst = addresses.length === 0

    if (_id) {
      const target = addresses.find((a) => a._id.toString() === _id)
      if (!target) throw new Error('Address not found')
      Object.assign(target, rest)
    } else {
      if (addresses.length >= ADDRESS_LIMIT)
        throw new Error('Maximum 10 addresses allowed')
      addresses.push({
        _id: new Types.ObjectId().toString(),
        ...rest,
        isDefault: isFirst || !!rest.isDefault,
      })
    }

    if (rest.isDefault) {
      const targetId = _id
        ? _id
        : addresses[addresses.length - 1]._id.toString()
      addresses.forEach((a) => {
        a.isDefault = a._id.toString() === targetId
      })
    }

    await currentUser.save()
    revalidatePath('/account/addresses')
    return { success: true, message: 'Address saved successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function setDefaultAddress(addressId: string) {
  try {
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')

    const addresses = currentUser.addresses as unknown as IAddressWithId[]
    const exists = addresses.some((a) => a._id.toString() === addressId)
    if (!exists) throw new Error('Address not found')

    addresses.forEach((a) => {
      a.isDefault = a._id.toString() === addressId
    })

    await currentUser.save()
    revalidatePath('/account/addresses')
    return { success: true, message: 'Default address updated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// DELETE
export async function deleteAddress(addressId: string) {
  try {
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')

    const addresses = currentUser.addresses as unknown as IAddressWithId[]
    const index = addresses.findIndex((a) => a._id.toString() === addressId)
    if (index === -1) throw new Error('Address not found')

    const wasDefault = addresses[index].isDefault
    addresses.splice(index, 1)
    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true
    }

    await currentUser.save()
    revalidatePath('/account/addresses')
    return { success: true, message: 'Address deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}