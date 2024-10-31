'use client'

// React Imports
import { useRef, useState } from 'react'

// MUI Imports
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import settingStore from '@/store/settingStore'
const ModeDropdown = () => {
  // States
  const [tooltipOpen, setTooltipOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Hooks
  const { settings, updateSettings } = settingStore()

  const handleToggle = () => {
    if (settings.mode === 'dark') {
      updateSettings({ mode: 'light' })
    }

    if (settings.mode === 'light') {
      updateSettings({ mode: 'dark' })
    }
  }

  const getModeIcon = () => {
    if (settings.mode === 'dark') {
      return 'ri-moon-clear-line'
    } else {
      return 'ri-sun-line'
    }
  }

  return (
    <>
      <Tooltip
        title={settings.mode + ' Mode'}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
        open={tooltipOpen}
        PopperProps={{ className: 'capitalize' }}
      >
        <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
          <i className={getModeIcon()} />
        </IconButton>
      </Tooltip>
    </>
  )
}

export default ModeDropdown
