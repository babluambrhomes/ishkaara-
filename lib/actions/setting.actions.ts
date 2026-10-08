'use server'
import { ISettingInput } from '@/types'
import data from '../data'

export const getSetting = async (): Promise<ISettingInput> => {
  return data.settings[0] as ISettingInput
}
