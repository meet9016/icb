/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// React Imports
import { useEffect, useState, type ReactNode } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Button, Card, CardContent, Grid, useTheme } from '@mui/material'
import Typography from '@mui/material/Typography'
import { lighten } from '@mui/material/styles'

// Type Imports
import type { ApexOptions } from 'apexcharts'
import type { ThemeColor } from '@core/types'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import Loader from '@/components/Loader'

// Dynamically imported chart component
// const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { api } from '@/utils/axiosInstance'
import endPointApi from '@/utils/endPointApi'

type DataType = {
  title: string
  value: string
  color: ThemeColor
  icon: ReactNode
}

// Data array extracted outside component
const data: DataType[] = [
  {
    title: 'Total Students',
    value: '1,250',
    color: 'primary',
    icon: <img src='/images/avatars/5.png' alt='icon' className='rounded-full w-[38px] h-[38px] object-cover' />
  },
  {
    title: 'Total Teachers',
    value: '60',
    color: 'info',
    icon: <img src='/images/avatars/8.png' alt='icon' className='rounded-full w-[38px] h-[38px] object-cover' />
  },
  {
    title: 'Total Staff',
    value: '82',
    color: 'info',
    icon: <img src='/images/avatars/3.png' alt='icon' className='rounded-full w-[38px] h-[38px] object-cover' />
  },
  {
    title: 'Course Completed',
    value: '14',
    color: 'warning',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 38 38' fill='none'>
        <path
          opacity='0.2'
          d='M8.08984 29.9102C6.72422 28.5445 7.62969 25.6797 6.93203 24.0023C6.23438 22.325 3.5625 20.8555 3.5625 19C3.5625 17.1445 6.20469 15.7344 6.93203 13.9977C7.65938 12.2609 6.72422 9.45547 8.08984 8.08984C9.45547 6.72422 12.3203 7.62969 13.9977 6.93203C15.675 6.23438 17.1445 3.5625 19 3.5625C20.8555 3.5625 22.2656 6.20469 24.0023 6.93203C25.7391 7.65938 28.5445 6.72422 29.9102 8.08984C31.2758 9.45547 30.3703 12.3203 31.068 13.9977C31.7656 15.675 34.4375 17.1445 34.4375 19C34.4375 20.8555 31.7953 22.2656 31.068 24.0023C30.3406 25.7391 31.2758 28.5445 29.9102 29.9102C28.5445 31.2758 25.6797 30.3703 24.0023 31.068C22.325 31.7656 20.8555 34.4375 19 34.4375C17.1445 34.4375 15.7344 31.7953 13.9977 31.068C12.2609 30.3406 9.45547 31.2758 8.08984 29.9102Z'
          fill='white'
        />
        <path
          d='M25.5312 15.4375L16.818 23.75L12.4687 19.5937M8.08984 29.9102C6.72422 28.5445 7.62969 25.6797 6.93203 24.0023C6.23437 22.325 3.5625 20.8555 3.5625 19C3.5625 17.1445 6.20469 15.7344 6.93203 13.9977C7.65937 12.2609 6.72422 9.45547 8.08984 8.08984C9.45547 6.72422 12.3203 7.62969 13.9977 6.93203C15.675 6.23437 17.1445 3.5625 19 3.5625C20.8555 3.5625 22.2656 6.20469 24.0023 6.93203C25.7391 7.65937 28.5445 6.72422 29.9102 8.08984C31.2758 9.45547 30.3703 12.3203 31.068 13.9977C31.7656 15.675 34.4375 17.1445 34.4375 19C34.4375 20.8555 31.7953 22.2656 31.068 24.0023C30.3406 25.7391 31.2758 28.5445 29.9102 29.9102C28.5445 31.2758 25.6797 30.3703 24.0023 31.068C22.325 31.7656 20.8555 34.4375 19 34.4375C17.1445 34.4375 15.7344 31.7953 13.9977 31.068C12.2609 30.3406 9.45547 31.2758 8.08984 29.9102Z'
          stroke='white'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    )
  }
]

const recentActivities = [
  {
    icon: '📅',
    color: 'success' as ThemeColor,
    title: 'Staff Meeting',
    description: 'Meeting notes uploaded',
    time: '2 hours ago'
  },
  {
    icon: '👥',
    color: 'info' as ThemeColor,
    title: 'New Admission',
    description: '5 new students registered',
    time: 'Yesterday'
  },
  {
    icon: '⚠️',
    color: 'warning' as ThemeColor,
    title: 'Attendance Alert',
    description: 'Class 8B attendance below 70%',
    time: '2 days ago'
  },
  {
    icon: '💰',
    color: 'primary' as ThemeColor,
    title: 'Budget Approved',
    description: 'Science lab equipment',
    time: '3 days ago'
  }
]

interface CountCard {
  title: string
  value: number
  color: 'primary' | 'info' | 'warning' | string
  icon: ReactNode
}
const WelcomeCard = () => {
  const theme = useTheme()
  const belowMdScreen = useMediaQuery(theme.breakpoints.down('md'))

  const [loading, setLoading] = useState(false)
  const adminStore = useSelector((state: RootState) => state.admin)
  const loginStore = useSelector((state: RootState) => state.login)
  const [totalCount, setTotalCount] = useState<CountCard[]>([])

  // Static chart colors
  // Chart colors with fallback
  const getChartColors = () => [
    '#FF6B6B',
    '#6BCB77',
    '#4D96FF',
    '#FFC75F',
    '#845EC2',
    '#D65DB1',
    '#FF9671',
    '#00C9A7',
    '#2C73D2',
    '#F9F871',
    '#F5B971',
    '#9A0680'
  ]

  // Series data (ensure all entries are valid numbers)
  const series = [50, 60, 55, 70, 65, 80, 75, 60, 85, 90, 78, 55]

  // Labels (make sure it matches series length)
  const labels = [
    '1st Std',
    '2nd Std',
    '3rd Std',
    '4th Std',
    '5th Std',
    '6th Std',
    '7th Std',
    '8th Std',
    '9th Std',
    '10th Std',
    '11th Std',
    '12th Std'
  ]

  // Trim all arrays to same length to avoid index errors
  const minLength = Math.min(series.length, labels.length, getChartColors().length)

  const trimmedSeries = series.slice(0, minLength)
  const trimmedLabels = labels.slice(0, minLength)
  const trimmedColors = getChartColors().slice(0, minLength)
  // Chart options for ApexCharts

  // Chart options for ApexCharts
  const chartOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      background: 'transparent',
      sparkline: { enabled: false }
    },
    grid: {
      padding: { left: 20, right: 20 }
    },
    colors: trimmedColors,
    stroke: { width: 0 },
    legend: { show: false },
    dataLabels: { enabled: false },
    labels: trimmedLabels,
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    },
    tooltip: {
      y: { formatter: val => `${val}% collected` },
      theme: theme.palette.mode
    },
    plotOptions: {
      pie: {
        customScale: 0.9,
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { offsetY: 20, show: false },
            value: {
              offsetY: 5,
              fontWeight: 500,
              fontSize: '1.125rem',
              formatter: value => `${value}%`,
              color: theme.palette.text.primary
            },
            total: {
              show: true,
              fontSize: '0.8125rem',
              label: 'Total',
              color: theme.palette.text.disabled,
              formatter: () => '72%'
            }
          }
        }
      }
    }
  }

  // Helper: dynamic background color style for data cards
  const getCardStyle = (color: ThemeColor) => {
    const baseColor = `var(--mui-palette-${color}-mainChannel)`
    return {
      backgroundColor: theme.palette.mode === 'dark' ? `rgba(${baseColor} / 0.15)` : `rgba(${baseColor} / 0.05)`,
      border: `1px solid ${theme.palette.mode === 'dark' ? `rgba(${baseColor} / 0.3)` : `rgba(${baseColor} / 0.2)`}`
    }
  }

  const getUserCount = () => {
    api.get(`${endPointApi.getUserCount}`).then(res => {
      setTotalCount([
        {
          title: 'Total Students',
          value: res.data.data.studentIdCount, // 👈 correct key from API
          color: 'primary',
          icon: <img src='/images/avatars/5.png' alt='icon' className='rounded-full w-[38px] h-[38px] object-cover' />
        },
        {
          title: 'Total Teachers',
          value: res.data.data.tchIdCount,
          color: 'info',
          icon: <img src='/images/avatars/8.png' alt='icon' className='rounded-full w-[38px] h-[38px] object-cover' />
        },
        {
          title: 'Total Parent',
          value: res.data.data.guardianIdCount,
          color: 'info',
          icon: <img src='/images/avatars/3.png' alt='icon' className='rounded-full w-[38px] h-[38px] object-cover' />
        },
        {
          title: 'Total',
          value: res.data.data.active_count,
          color: 'warning',
          icon: (
            <svg xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 38 38' fill='none'>
              <path
                opacity='0.2'
                d='M8.08984 29.9102C6.72422 28.5445 7.62969 25.6797 6.93203 24.0023C6.23438 22.325 3.5625 20.8555 3.5625 19C3.5625 17.1445 6.20469 15.7344 6.93203 13.9977C7.65938 12.2609 6.72422 9.45547 8.08984 8.08984C9.45547 6.72422 12.3203 7.62969 13.9977 6.93203C15.675 6.23438 17.1445 3.5625 19 3.5625C20.8555 3.5625 22.2656 6.20469 24.0023 6.93203C25.7391 7.65938 28.5445 6.72422 29.9102 8.08984C31.2758 9.45547 30.3703 12.3203 31.068 13.9977C31.7656 15.675 34.4375 17.1445 34.4375 19C34.4375 20.8555 31.7953 22.2656 31.068 24.0023C30.3406 25.7391 31.2758 28.5445 29.9102 29.9102C28.5445 31.2758 25.6797 30.3703 24.0023 31.068C22.325 31.7656 20.8555 34.4375 19 34.4375C17.1445 34.4375 15.7344 31.7953 13.9977 31.068C12.2609 30.3406 9.45547 31.2758 8.08984 29.9102Z'
                fill='white'
              />
              <path
                d='M25.5312 15.4375L16.818 23.75L12.4687 19.5937M8.08984 29.9102C6.72422 28.5445 7.62969 25.6797 6.93203 24.0023C6.23437 22.325 3.5625 20.8555 3.5625 19C3.5625 17.1445 6.20469 15.7344 6.93203 13.9977C7.65937 12.2609 6.72422 9.45547 8.08984 8.08984C9.45547 6.72422 12.3203 7.62969 13.9977 6.93203C15.675 6.23437 17.1445 3.5625 19 3.5625C20.8555 3.5625 22.2656 6.20469 24.0023 6.93203C25.7391 7.65937 28.5445 6.72422 29.9102 8.08984C31.2758 9.45547 30.3703 12.3203 31.068 13.9977C31.7656 15.675 34.4375 17.1445 34.4375 19C34.4375 20.8555 31.7953 22.2656 31.068 24.0023C30.3406 25.7391 31.2758 28.5445 29.9102 29.9102C28.5445 31.2758 25.6797 30.3703 24.0023 31.068C22.325 31.7656 20.8555 34.4375 19 34.4375C17.1445 34.4375 15.7344 31.7953 13.9977 31.068C12.2609 30.3406 9.45547 31.2758 8.08984 29.9102Z'
                stroke='white'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          )
        }
      ])
    })
  }

  useEffect(() => {
    getUserCount()
  }, [])
  return (
    <>
      {/* {loading && <Loader />} */}
      {/* <Card className='mb-6 p-6'> */}
      <div className='rounded-xl'>
        {/* <div className="rounded-xl border" style={{ backgroundColor: '#FFFF' }}> */}

        {/* <div className='flex max-md:flex-col md:items-stretch gap-0'> */}
        {/* Left side */}
        {/* <div className='w-full md:12 p-2 sm:p-6'> */}
        {/* Welcome Header */}
        <Card>
          <div className='flex flex-wrap items-baseline gap-1 mb-3 px-6 pt-2'>
            <Typography variant='h5' className='font-medium' color='text.secondary'>
              Welcome back,
            </Typography>
            <Typography variant='h4' className='font-bold ml-1' color='text.primary'>
              {loginStore?.username ?? 'User'} 👋🏻
            </Typography>
          </div>
        </Card>
        {/* <Card className='mb-6 p-6'> */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6'>
          {totalCount.map((item, i) => (
            <Card>
              <div
                key={i}
                className='flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:shadow-lg'
                // style={getCardStyle(item.color)}
              >
                <CustomAvatar>{item.icon}</CustomAvatar>
                <div>
                  <Typography className='font-medium text-sm' color='text.secondary'>
                    {item.title}
                  </Typography>
                  <Typography
                    variant='h5'
                    className='font-bold mt-1'
                    style={{ color: `var(--mui-palette-${item.color}-main)` }}
                  >
                    {item.value}
                  </Typography>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {/* </Card> */}
        {/* <Grid container spacing={6}>
              {data.map((item, i) => {
                const isUp = item.trend >= 0
                const sign = isUp ? '+' : ''
                const trendColor = isUp ? 'success.main' : 'error.main'

                return (
                  <Grid item xs={12} sm={6} md={3} key={item.id ?? i}>
                    <Card
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        borderRadius: 2
                      }}
                    >
                      <CardContent className='flex flex-col gap-2'>
                        <div className='flex items-center gap-4'>
                          <CustomAvatar color={item.color} skin='light' variant='rounded'>
                            <i className={item.icon} />
                          </CustomAvatar>
                        </div>

                        <div className='flex flex-col'>
                          <Typography color='text.primary'>{item.title}</Typography>

                          <div className='flex items-center gap-2'>
                            <Typography className='font-medium' sx={{ color: trendColor }}>
                              {`${sign}${Math.abs(item.trend)}%`}
                            </Typography>
                            <Typography variant='body2' color='text.disabled'>
                              than last week
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid> */}
        {/* Recent Activities */}
      </div>
      {/* </div>
        </div> */}
      {/* </Card> */}
      <Card>
        <div
          className={`rounded-lg p-5 border ${
            theme.palette.mode === 'dark' ? 'bg-[#363b54] border-[#444b6e]' : 'bg-white border-gray-100'
          }`}
        >
          <div className='flex justify-between items-center mb-5'>
            <Typography variant='h6' className='font-bold' color='text.primary'>
              Recent Activities
            </Typography>
            <Button variant='text' color='primary' size='small'>
              View All
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
            {recentActivities.map((item, idx) => (
              <div key={idx} className='flex'>
                <div className='mr-4'>
                  <CustomAvatar skin='light' color={item.color} size={36}>
                    {item.icon}
                  </CustomAvatar>
                </div>
                <div className='flex-1'>
                  <div className='flex justify-between items-start mb-1'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.title}
                    </Typography>
                    <Typography variant='caption' color='text.disabled'>
                      {item.time}
                    </Typography>
                  </div>
                  <Typography variant='body2' color='text.secondary'>
                    {item.description}
                  </Typography>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-6 flex justify-center'>
            {/* <Button variant="outlined" color="primary" className="rounded-full">
                Load More Activities
              </Button> */}
            <Button variant='contained' className='rounded-full'>
              Load More Activities
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}

export default WelcomeCard
