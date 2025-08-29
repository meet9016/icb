'use client'

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Type Imports
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { clearToken } from '@/utils/tokenManager'

import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { clearUserPermissionInfo } from '@/redux-store/slices/userPermission'
import { clearSidebarPermission } from '@/redux-store/slices/sidebarPermission'
import { setUserSelectedRoleClearInfo } from '@/redux-store/slices/userSelectedRole'

// Styled badge dot
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ full_name?: string; email?: string; image?: string }>({})
  const adminStore = useSelector((state: RootState) => state.admin)
  const loginStore = useSelector((state: RootState) => state.login)
  const dispatch = useDispatch();


  const anchorRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const { settings } = useSettings()
  const { lang: locale } = useParams()

  const handleDropdownOpen = () => setOpen(prev => !prev)

  const handleDropdownClose = (
    event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent),
    url?: string
  ) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale as Locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.clear()
    localStorage.clear()
    clearToken()
    router.replace(getLocalizedUrl('/login', locale as Locale))
    dispatch(clearUserPermissionInfo());
    dispatch(clearSidebarPermission())
    dispatch(setUserSelectedRoleClearInfo())
  }

  // Set user info and preload dropdown on first render
  useEffect(() => {
    try {
      const localUser = localStorage.getItem('user')
      if (localUser) {
        setUser(JSON.parse(localUser))
      }
    } catch {
      setUser({})
    }
  }, [])

  return (
    <>
      <Badge
        overlap='circular'
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={user.full_name || ''}
          src={adminStore.f_logo || user.image}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>

      <Popper
        open={open}
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        <Paper
          elevation={settings.skin === 'bordered' ? 0 : 8}
          {...(settings.skin === 'bordered' && { className: 'border' })}
        >
          <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
            <MenuList>
              <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                <Avatar src={adminStore.f_logo}  />
                <div className='flex items-start flex-col'>
                  <Typography variant='body2' className='font-medium' color='text.primary'>
                    {loginStore.username || ''}
                  </Typography>
                  <Typography variant='caption'>
                    {loginStore.email || ''}
                  </Typography>
                </div>
              </div>

              <Divider className='mlb-1' />

              <MenuItem
                className='gap-3 pli-4'
                onClick={e => handleDropdownClose(e, !loginStore.super_admin ? '/pages/account-settings' : '/pages/school-settings')}
              >
                <i className='ri-settings-4-line' />
                <Typography color='text.primary'>Edit {!loginStore.super_admin ? 'Profile' : 'School'} </Typography>
              </MenuItem>

              <div className='flex items-center plb-1.5 pli-4'>
                <Button
                  fullWidth
                  variant='contained'
                  color='error'
                  size='small'
                  endIcon={<i className='ri-logout-box-r-line' />}
                  onClick={handleUserLogout}
                >
                  Logout
                </Button>
              </div>
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  )
}

export default UserDropdown
