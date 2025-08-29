/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { ThemeColor } from '@core/types'

// Components Imports
import CustomIconButton from '@core/components/mui/IconButton'
import OptionMenu from '@core/components/option-menu'
import DirectionalIcon from '@components/DirectionalIcon'

type FacilityDataType = {
  name: string
  icon: string
  bookedToday: number
  isBooked: boolean
  weeklyUsage: number
  lastBookedBy: string
  color: ThemeColor
}

const facilityData: FacilityDataType[] = [
  {
    name: 'Science Lab',
    icon: '🔬',
    bookedToday: 3,
    isBooked: true,
    weeklyUsage: 12,
    lastBookedBy: 'Grade 9 – Mr. Shah',
    color: 'primary'
  },
  {
    name: 'Chemistry Lab',
    icon: '🧪',
    bookedToday: 2,
    isBooked: true,
    weeklyUsage: 9,
    lastBookedBy: 'Grade 10 – Mrs. Patel',
    color: 'success'
  },
  {
    name: 'Computer Lab',
    icon: '🖥️',
    bookedToday: 4,
    isBooked: true,
    weeklyUsage: 15,
    lastBookedBy: 'Grade 8 – Ms. Joshi',
    color: 'info'
  },
  {
    name: 'Sports Ground',
    icon: '🏀',
    bookedToday: 2,
    isBooked: true,
    weeklyUsage: 7,
    lastBookedBy: 'Grade 7 – Mr. Rana',
    color: 'warning'
  }
]

const FacilityUsage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Card sx={{ borderRadius: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'row', sm: 'row' },
          px: { xs: 2, sm: 4 },
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.30rem' }
          }}
        >
          🏫 Facility Usage Summary
        </Typography>
        <OptionMenu options={['Refresh', 'Download Report', 'View All Bookings']} />
      </Box>
      <CardContent sx={{ pt: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={4}>
          {facilityData.map((facility, index) => (
            <Box key={index}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={7} lg={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: { xs: 40, sm: 48, md: 56 },
                        height: { xs: 40, sm: 48, md: 56 },
                        bgcolor: `var(--mui-palette-${facility.color}-lighter)`,
                        color: `var(--mui-palette-${facility.color}-main)`,
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                        fontWeight: 'bold'
                      }}
                    >
                      {facility.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {facility.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: facility.isBooked ? 'success.lighter' : 'error.lighter',
                            color: facility.isBooked ? 'success.main' : 'error.main',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          <i className="ri-time-line" style={{ fontSize: '0.875rem' }}></i>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {facility.isBooked ? `${facility.bookedToday} times today` : 'Not booked today'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: 'primary.lighter',
                            color: 'primary.main',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          <i className="ri-calendar-line" style={{ fontSize: '0.875rem' }}></i>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {`${facility.weeklyUsage} weekly sessions`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={5} lg={4}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: { xs: 'space-between', md: 'flex-end' },
                      alignItems: 'center',
                      gap: 2,
                      height: '100%',
                      mt: { xs: 2, md: 0 },
                      flexWrap: 'wrap'
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {facility.lastBookedBy}
                      </Typography>
                    </Box>

                    <CustomIconButton
                      variant="contained"
                      color={facility.color}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ boxShadow: 1, flexShrink: 0 }}
                    >
                      <DirectionalIcon ltrIconClass="ri-arrow-right-s-line" rtlIconClass="ri-arrow-left-s-line" />
                    </CustomIconButton>
                  </Box>
                </Grid>
              </Grid>
              {index !== facilityData.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default FacilityUsage
