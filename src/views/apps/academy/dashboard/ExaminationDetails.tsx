"use client"

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

type ResultDataType = {
    status: string
    count: number
    color: 'success' | 'error' | 'warning' | 'info'
    message: string
    icon: string
}

const ExaminationDetails = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const resultData: ResultDataType[] = [
        {
            status: 'Pass',
            count: 158,
            color: 'success',
            message: 'Ready to move to Next Grade',
            icon: 'ri-check-line'
        },
        {
            status: 'Fail',
            count: 30,
            color: 'error',
            message: 'Restart the Grade',
            icon: 'ri-close-line'
        },
        {
            status: 'Retest',
            count: 25,
            color: 'warning',
            message: 'Restart the Exams',
            icon: 'ri-refresh-line'
        },
        {
            status: 'In Progress',
            count: 50,
            color: 'info',
            message: 'Students are now examining',
            icon: 'ri-time-line'
        }
    ]

    const totalStudents = resultData.reduce((acc, item) => acc + item.count, 0)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pass': return '#36d7b7'
            case 'Fail': return '#ff4d6b'
            case 'Retest': return '#ffb74d'
            case 'In Progress': return '#7367f0'
            default: return 'primary.main'
        }
    }

    return (
        <Card >
            <CardContent sx={{ p: theme => [`${theme.spacing(2)} !important`, `${theme.spacing(4)} !important`] }}>
                <Typography variant='h5' sx={{ mb: 3 }}>Examination Results Overview</Typography>
                <Typography variant='body2' sx={{ mb: 2 }}>Total Students: {totalStudents}</Typography>

                <Box display="flex" flexDirection="column"  gap={4}>
                    {resultData.map((item, index) => {
                        const percentage = Math.round((item.count / totalStudents) * 100)

                        return (
                            <Box key={index} >
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={4}>
                                        <Box display="flex" alignItems="center">
                                            <CustomAvatar
                                                skin='light'
                                                color={item.color}
                                                sx={{ mr: 1.5, width: 30, height: 30 }}
                                            >
                                                <i className={item.icon}></i>
                                            </CustomAvatar>
                                            <Typography
                                                variant='subtitle1'
                                                sx={{
                                                    color: getStatusColor(item.status),
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {item.status}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={8}>
                                        <Box
                                            display="flex"
                                            flexDirection={isMobile ? 'column' : 'row'}
                                            justifyContent="space-between"
                                            alignItems={isMobile ? 'flex-start' : 'center'}
                                            gap={isMobile ? 0.5 : 2}
                                        >
                                            <Typography variant='body2' fontWeight="medium">
                                                Students: {item.count}
                                            </Typography>
                                            <Typography variant='body2' fontWeight="medium">
                                                Percentage: {percentage}%
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 2 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={percentage}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 5,
                                                bgcolor: getStatusColor(item.status)
                                            },
                                            bgcolor: '#f5f5f7'
                                        }}
                                    />
                                </Box>

                                <Typography
                                    variant='body2'
                                    sx={{ color: getStatusColor(item.status), mt: 1 }}
                                >
                                    {item.message}
                                </Typography>
                            </Box>
                        )
                    })}
                </Box>
            </CardContent>
        </Card>
    )
}

export default ExaminationDetails
