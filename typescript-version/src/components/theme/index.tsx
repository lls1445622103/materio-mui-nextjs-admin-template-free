'use client'

// React Imports
import { useMemo, useState } from 'react'
import ThemeConfigDiv from './ThemeConfig'
// MUI Imports
import { deepmerge } from '@mui/utils'
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
  lighten,
  darken
} from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import type { } from '@mui/material/themeCssVarsAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build
import type { } from '@mui/lab/themeAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build
import './theme.module.scss'
// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '@configs/themeConfig'
import primaryColorConfig from '@configs/primaryColorConfig'



import settingStore from '@/store/settingStore'
// Core Theme Imports
import defaultCoreTheme from '@core/theme'

type Props = ChildrenType & {
  direction: Direction
}

const ThemeProvider = (props: Props) => {
  // Props
  const { children, direction } = props
  const [primaryColor, setPrimaryColor] = useState(primaryColorConfig[0].main)
  // Hooks
  const { settings } = settingStore()

  // Merge the primary color scheme override with the core theme
  const theme = useMemo(() => {
    const newColorScheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: primaryColor,
              light: lighten(primaryColor as string, 0.2),
              dark: darken(primaryColor as string, 0.1)
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: primaryColor,
              light: lighten(primaryColor as string, 0.2),
              dark: darken(primaryColor as string, 0.1)
            }
          }
        }
      },
      components: {
        MuiChip: {
          variants: [
            {
              props: { variant: 'text', },
              style: {
                // border: `4px dashed ${red[500]}`,
                backgroundColor: 'var(--mui-palette-primary-lightOpacity)',
                color: 'var(--mui-palette-primary-main)',
                borderRadius: '4px'
              }
            }
          ]

        }
      }
    }

    const coreTheme = deepmerge(defaultCoreTheme(settings.mode || 'light', direction), newColorScheme)

    return extendTheme(coreTheme)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mode, primaryColor])
  const [open, setOpen] = useState(true);

  return (
    <AppRouterCacheProvider options={{ prepend: true }}>
      <CssVarsProvider
        theme={theme}
        defaultMode={settings.mode}
        modeStorageKey={`${themeConfig.templateName.toLowerCase().split(' ').join('-')}-mui-template-mode`}
      >
        <>
          <ModeChanger />
          <CssBaseline />
          {children}
          <ThemeConfigDiv open={open} setOpen={setOpen} setPrimaryColor={setPrimaryColor} />
        </>
      </CssVarsProvider>
    </AppRouterCacheProvider>
  )
}

export default ThemeProvider
