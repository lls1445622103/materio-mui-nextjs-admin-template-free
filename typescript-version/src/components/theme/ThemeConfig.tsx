
import React from 'react'
import { Drawer, Typography, Chip, Divider, Grid, Badge } from '@mui/material'
import CachedIcon from '@mui/icons-material/Cached';
import CloseIcon from '@mui/icons-material/Close';
import * as  colors from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import settingStore from '@/store/settingStore'
import style from './theme.module.scss'
type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}
// type Colors = typeof colors
type K = keyof typeof colors
type ColorEntry = {
  name: K
  color: typeof colors[K];
};
export default function ThemeConfig({ open, setOpen }: Props) {
  const theme = useTheme();
  const { updateSettings, isSettingsChanged, resetSettings } = settingStore()
  console.log(isSettingsChanged())
  let colorsList: ColorEntry[] = []
  for (let key in colors) {
    if (key !== 'common') {
      colorsList.push({
        name: (key as K),
        color: colors[(key as K)]
      })
    }
  }
  return (
    <Drawer anchor='right' open={open} onClose={() => setOpen(false)}>
      <div className={style.themeDrawer}>
        <div className='flex justify-between items-center px-6 py-4'>
          <div>
            <Typography variant="h6" >
              Theme Customizer
            </Typography>
            <Typography variant="subtitle1" >
              Customize & Preview in Real Time
            </Typography>
          </div>
          <div className='h-[44px] flex items-center'>
            <Badge invisible={!isSettingsChanged()} color="error" variant="dot" className={`mr-2`}>
              <CachedIcon className='cursor-pointer' onClick={() => {
                if (isSettingsChanged()) {
                  resetSettings()
                }
              }} />
            </Badge>

            <CloseIcon className='cursor-pointer' onClick={() => setOpen(false)} />
          </div>
        </div>
        <Divider />
        <div className='p-5'>
          <Grid container spacing={6}>
            <Grid container item >
              <Chip size="small" label="theming" variant="text" color="primary" />
            </Grid>
            <Grid container item >
              <Typography variant="h6" mb={1.5}>
                Primary Color
              </Typography>
              <Grid container item gap={2}>
                {
                  colorsList.map((color: ColorEntry) => (
                    <div
                      onClick={() => updateSettings({
                        primaryColor: (color as any).color[500]
                      })}
                      key={color.name}
                      className={`${(color as any).color[500] === theme.palette.primary.main ? style.colorItemActive : ''} ${style.colorItem}`
                      }>
                      <div className={style.colorItemBg} style={{
                        background: (color as any).color[500]
                      }}></div>
                    </div>
                  ))
                }

              </Grid>
            </Grid>
          </Grid>
        </div>

      </div>
    </Drawer>
  )
}
