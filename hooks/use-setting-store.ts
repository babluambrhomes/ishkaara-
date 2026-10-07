import data from '@/lib/data'
import { ClientSetting } from '@/types'
import { create } from 'zustand'

interface SettingState {
  setting: ClientSetting
  setSetting: (newSetting: ClientSetting) => void
}

const useSettingStore = create<SettingState>((set) => ({
  setting: data.settings[0] as ClientSetting,
  setSetting: (newSetting: ClientSetting) => {
    set({ setting: newSetting })
  },
}))

export default useSettingStore