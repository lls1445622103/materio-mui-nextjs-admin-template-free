import '@mui/material/Chip'

declare module '@mui/material/Chip' {
  // interface ButtonPropsVariantOverrides {
  //   dashed: true
  // }
  interface ChipPropsVariantOverrides {
    text: true
  }
}
