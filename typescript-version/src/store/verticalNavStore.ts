import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
import { produce } from 'immer'
import themeConfig from '@configs/themeConfig'
export type VerticalNavState = {
  width?: number
  isToggled?: boolean
  isBreakpointReached?: boolean
  transitionDuration?: number
}
export type VerticalNavContextProps = {
  verticalNavState: VerticalNavState
  updateVerticalNavState: (values: VerticalNavState) => void
  toggleVerticalNav: (value?: VerticalNavState['isToggled']) => void
}
const useStore = create<VerticalNavContextProps>(set => ({
  verticalNavState: {
    width: themeConfig.compactContentWidth,
    isToggled: false,
    isBreakpointReached: false,
    transitionDuration: 300
  },
  updateVerticalNavState: (value: VerticalNavState) => {
    set(
      produce(state => {
        {
          state.verticalNavState = {
            ...state.verticalNavState,
            ...value
          }
        }
      })
    )
  },
  toggleVerticalNav: (value?: VerticalNavState['isToggled']) =>
    set(
      produce(state => {
        state.verticalNavState.isToggled = value ?? !state.verticalNavState.isToggled
      })
    )
}))
export default useStore
