' use client '
import React from 'react'
import { Drawer, Typography, Chip, Divider, Grid } from '@mui/material'
import style from './theme.module.scss'
import CachedIcon from '@mui/icons-material/Cached';
import CloseIcon from '@mui/icons-material/Close';
import * as  colors from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  setPrimaryColor: (color: string) => void
}
// type Colors = typeof colors
type ColorEntry = {
  name: keyof typeof colors;
  color: typeof colors[keyof typeof colors];
};
export default function ThemeConfig({ open, setOpen, setPrimaryColor }: Props) {
  const theme = useTheme();
  console.log('Primary Color Name:', theme); // 输出: blue
  console.log('Primary Color Name:222', colors); // 输出: blue

  let colorsList: ColorEntry[] = []
  for (let key in colors) {
    colorsList.push({
      name: key as keyof typeof colors,
      color: colors[key as keyof typeof colors]
    })
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
          <div>
            <CachedIcon className='cursor-pointer' />
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
                      onClick={() => setPrimaryColor((color as any).color[500])}
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
