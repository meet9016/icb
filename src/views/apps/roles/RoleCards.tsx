/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import AvatarGroup from '@mui/material/AvatarGroup'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import type { TypographyProps } from '@mui/material/Typography'
import type { CardProps } from '@mui/material/Card'

// Component Imports
import { useSelector } from 'react-redux'

import RoleDialog from '@components/dialogs/role-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'
import type { RoleType } from '@/types/apps/roleType'
import { useRouter } from 'next/navigation'

const RoleCards = () => {
  const typographyProps: TypographyProps = {
    children: 'Edit Role',
    component: Link,
    color: 'primary',
    onClick: e => e.preventDefault()
  }

  const roleStore = useSelector((state: { roleReducer: RoleType[] | string[] }) => state.roleReducer)

  const router = useRouter()

  const CardProps: CardProps = {
    className: 'cursor-pointer bs-full',
    children: (
      <Grid container className='bs-full'>
        <Grid size={{ xs: 5 }}>
          <div className='flex items-end justify-center bs-full'>
            <img alt='add-role' src='/images/illustrations/characters/9.png' height={130} />
          </div>
        </Grid>
        <Grid size={{ xs: 7 }}>
          <CardContent>
            <div className='flex flex-col items-end gap-4 text-right'>
              <Button variant='contained' size='small'>
                Add Role
              </Button>
              <Typography>
                Add new role, <br />
                if it doesn&#39;t exist.
              </Typography>
            </div>
          </CardContent>
        </Grid>
      </Grid>
    )
  }

  // Helper type guard
  const isRoleType = (item: unknown): item is RoleType => {
    return typeof item === 'object' && item !== null && 'totalUsers' in item && 'avatars' in item && 'title' in item
  }

  return (
    <>
      <Grid container spacing={6}>
        {/* {roleStore.length > 0 &&
          roleStore.map((item, index) => {
            if (!isRoleType(item)) {
              // fallback rendering if roleStore is string[]
              return (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
                  <Card>
                    <CardContent>
                      <Typography>{item}</Typography>
                      <Typography variant='body2'>No user count available</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )
            }

            // If RoleType object
            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
                <Card>
                  <CardContent className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between'>
                      <Typography className='flex-grow'>{`Total ${item.totalUsers} users`}</Typography>
                      <AvatarGroup total={item.totalUsers}>
                        {item.avatars.map((img, index: number) => (
                          <CustomAvatar key={index} alt={item.title} src={`/images/avatars/${img}`} size={40} />
                        ))}
                      </AvatarGroup>
                    </div>
                    <div className='flex justify-between items-center'>
                      <div className='flex flex-col items-start gap-1'>
                        <Typography variant='h5'>{item.title}</Typography>
                        <OpenDialogOnElementClick
                          element={Typography}
                          elementProps={typographyProps}
                          dialog={RoleDialog}
                          dialogProps={{ title: item.title, item }}
                        />
                      </div>
                      <IconButton>
                        <i className='ri-file-copy-line text-secondary' />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            )
          })} */}

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <OpenDialogOnElementClick element={Card} elementProps={CardProps} dialog={RoleDialog} />
        </Grid>
      </Grid>
    </>
  )
}

export default RoleCards
