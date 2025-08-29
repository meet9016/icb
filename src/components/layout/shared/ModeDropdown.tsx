'use client'

// React Imports
import { useRef, useState } from 'react'

// MUI Imports
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { Mode } from '@core/types'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import endPointApi from '@/utils/endPointApi'
import { api } from '@/utils/axiosInstance'
import { toast } from 'react-toastify'

const ModeDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Hooks
  const { settings, updateSettings } = useSettings()

  const handleClose = () => {
    setOpen(false)
    setTooltipOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleModeSwitch = (mode: Mode) => {
    handleClose()
console.log("mode",mode);

    if (settings.mode !== mode) {
      updateSettings({ mode: mode })
    }
      const body = {
        // primaryColor: settings.primaryColor,
        mode: mode,
        // skin: settings.skin,
        // semiDark: settings.semiDark,
        // layout: settings.layout,
        // navbarContentWidth: settings.navbarContentWidth,
        // contentWidth: settings.contentWidth,
        // footerContentWidth: settings.footerContentWidth
      }
  
      api.post(`${endPointApi.themeSettingSave}`, body, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }).then((response) => {
            if( response?.data?.message === 'Colors saved successfully') {
              getThemeData()
              toast.success('Colors saved successfully!')
              // window.location.reload();
            }
          }).catch((error) => {
            console.error('Error saving theme:', error);
          })
  }

   const getThemeData = () => {
      // Fetch theme data logic here
      api.get(`${endPointApi.getTheme}`)
        .then(response => {
          if(response.data.status === 200) {
            updateSettings({
              primaryColor: response?.data?.primaryColor || '#1F5634',
              mode: response?.data?.mode || 'light',
              skin: response?.data?.skin || 'default',
              // semiDark: Boolean(response?.data?.semiDark) ?? false,
              layout: response?.data?.layout || 'vertical',
              // navbarContentWidth: response?.data?.navbarContentWidth || 'full',
              contentWidth: response?.data?.contentWidth || 'compact',
              // footerContentWidth: response?.data?.footerContentWidth || 'full'
            })
        }
        })
        .catch(error => {
          console.error('Error fetching theme data:', error)
        })
    }
  const getModeIcon = () => {
    if (settings.mode === 'system') {
      return 'ri-macbook-line'
    } else if (settings.mode === 'dark') {
      return 'ri-moon-clear-line'
    } else {
      return 'ri-sun-line'
    }
  }

    const saveTheame = () => {
      // Save theme logic here
    
    }

  return (
    <>
      <Tooltip
        title={settings.mode + ' Mode'}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
        open={open ? false : tooltipOpen ? true : false}
        PopperProps={{ className: 'capitalize' }}
      >
        <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
          <i className={getModeIcon()} />
        </IconButton>
      </Tooltip>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-start'
        anchorEl={anchorRef.current}
        className='min-is-[160px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top' }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList onKeyDown={handleClose}>
                  <MenuItem
                    className='gap-3 pli-4'
                    onClick={() => handleModeSwitch('light')}
                    selected={settings.mode === 'light'}
                  >
                    <i className='ri-sun-line' />
                    Light
                  </MenuItem>
                  <MenuItem
                    className='gap-3 pli-4'
                    onClick={() => handleModeSwitch('dark')}
                    selected={settings.mode === 'dark'}
                  >
                    <i className='ri-moon-clear-line' />
                    Dark
                  </MenuItem>
                  {/* <MenuItem
                    className='gap-3 pli-4'
                    onClick={() => handleModeSwitch('system')}
                    selected={settings.mode === 'system'}
                  >
                    <i className='ri-computer-line' />
                    System
                  </MenuItem> */}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default ModeDropdown
