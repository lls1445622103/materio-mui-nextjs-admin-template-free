import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'
import themeConfig from '@configs/themeConfig'
import type { Mode } from '@core/types'
import Cookies from 'js-cookie'
export type Settings = {
  mode?: Mode
  primaryColor?: string
}
interface StoreState {
  settings: Settings

  isSettingsChanged: () => boolean
  updateSettings: (settings: Partial<Settings>) => void
  resetSettings: () => void
}
const { mode, primaryColor } = themeConfig
const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      settings: {
        mode: mode,
        primaryColor: primaryColor
      },
      // 判断是否已更改
      isSettingsChanged: () => {
        return (
          JSON.stringify(get().settings) !==
          JSON.stringify({
            mode,
            primaryColor
          })
        )
      },

      updateSettings(settings: Partial<Settings>) {
        set(
          produce(state => {
            state.settings = {
              ...state.settings,
              ...settings
            }
          })
        )
      },
      resetSettings() {
        set(
          produce(state => {
            state.settings = {
              mode: mode,
              primaryColor: primaryColor
            }
          })
        )
      }
    }),
    {
      name: themeConfig.settingsCookieName,
      storage: {
        getItem: (key: string) => {
          const item = Cookies.get(key)
          console.log(item)
          return item ? JSON.parse(item) : null
        }, // 获取 Cookie
        setItem: (key: string, value: any) => {
          // console.log(json.stringify(value))
          Cookies.set(key, JSON.stringify(value), { expires: 7 })
        }, // 设置 Cookie，过期时间为 7 天
        removeItem: (key: string) => Cookies.remove(key) // 移除 Cookie
      }
    }
  )
)
export default useStore
