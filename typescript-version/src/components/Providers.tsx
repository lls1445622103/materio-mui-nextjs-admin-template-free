// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'

import ThemeProvider from '@components/theme'

// Component Imports
import UpgradeToProButton from '@components/upgrade-to-pro-button'

// Util Imports
import { getMode, getSettingsFromCookie } from '@core/utils/serverHelpers'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = (props: Props) => {
  // Props
  const { children, direction } = props

  // Vars
  const mode = getMode()
  const settingsCookie = getSettingsFromCookie()

  return (
    // <VerticalNavProvider>
    <ThemeProvider direction={direction}>
      {children}
      <UpgradeToProButton />
    </ThemeProvider>
    // </VerticalNavProvider>
  )
}

export default Providers
