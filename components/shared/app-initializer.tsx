import React, { useEffect, useState } from 'react'
import useSettingStore from '@/hooks/use-setting-store'
import useCartStore from '@/hooks/use-cart-store'
import useWishlistStore from '@/hooks/use-wishlist-store'
import { ClientSetting } from '@/types'

export default function AppInitializer({
  setting,
  children,
}: {
  setting: ClientSetting
  children: React.ReactNode
}) {
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    setRendered(true)
  }, [setting])

  useEffect(() => {
    useCartStore.getState().loadCart()
    useWishlistStore.getState().loadWishlist()
  }, [])

  if (!rendered) {
    useSettingStore.setState({
      setting,
    })
  }

  return children
}