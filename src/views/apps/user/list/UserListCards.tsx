'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { api } from '@/utils/axiosInstance'
import Loader from '@/components/Loader'
// Type Imports
import type { ThemeColor } from '@core/types'
import { useEffect, useState } from 'react'

type UserDataType = {
  title: string
  stats: string
  avatarIcon: string
  avatarColor?: ThemeColor
  trend: 'positive' | 'negative'
  trendNumber: string
  subtitle: string
}

const data: UserDataType[] = [
  {
    title: 'Active Users',
    stats: '10',
    avatarIcon: 'ri-user-follow-line',
    avatarColor: 'success',
    trend: 'positive',
    trendNumber: '14%',
    subtitle: 'Total Active Users'
  },
  {
    title: 'Inactive Users',
    stats: '0',
    avatarIcon: 'ri-user-add-line',
    avatarColor: 'error',
    trend: 'negative',
    trendNumber: '18%',
    subtitle: 'Total Inactive Users'
  }
]
const UserListCards = () => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 2000)

    // Optional: Clear timeout on unmount
    return () => clearTimeout(timeout)
  }, [])



  return (
    <Grid container spacing={6}>

      <Grid item xs={12} sm={12} md={6} lg={6} component="div">
        <Card>
          <CardContent className="flex justify-between gap-1  items-center">
            <div className="flex flex-col gap-1 flex-grow">
              <Typography color="text.primary">Active Users</Typography>
              <div className="flex items-center gap-2 flex-wrap">
                <Typography variant="h4">10</Typography>
                <Typography
                  color='success.main'
                >
                  {/* {`${item.trend === 'negative' ? '-' : '+'}${item.trendNumber}`} */}
                </Typography>
              </div>
              <Typography variant="body2">total active user</Typography>
            </div>
            <CustomAvatar color='success' skin="light" variant="rounded" size={62}>
              <i className={classnames('ri-user-follow-line', 'text-[26px]')} />
            </CustomAvatar>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} component="div">
        <Card>
          <CardContent className="flex justify-between gap-1  items-center">
            <div className="flex flex-col gap-1 flex-grow">
              <Typography color="text.primary">Inactive Users</Typography>
              <div className="flex items-center gap-2 flex-wrap">
                <Typography variant="h4">0</Typography>
                <Typography
                  color='success.main'
                >
                  {/* {`${item.trend === 'negative' ? '-' : '+'}${item.trendNumber}`} */}
                </Typography>
              </div>
              <Typography variant="body2">total inactive user</Typography>
            </div>
            <CustomAvatar color='error' skin="light" variant="rounded" size={62}>
              <i className={classnames('ri-user-follow-line', 'text-[26px]')} />
            </CustomAvatar>
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  )
}

export default UserListCards
