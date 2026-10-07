'use client'
import React from 'react'
import { Toaster } from '../ui/toaster'
import AppInitializer from './app-initializer'
import { ClientSetting } from '@/types'

export default function ClientProviders({
  setting,
  children,
}: {
  setting: ClientSetting
  children: React.ReactNode
}) {
  return (
    <AppInitializer setting={setting}>
      <div>{children}</div>
      <Toaster />
    </AppInitializer>
  )
}
