'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import type { ThemeColor } from '@core/types'

import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

type StudentDataType = {
  name: string
  grade: string
  subject: string
  department: string
  attendance: number
  achievements: string[]
  color: ThemeColor
}

const studentData: StudentDataType[] = [
  {
    name: 'Emma Johnson',
    grade: 'A+',
    subject: 'Mathematics',
    department: 'Science ',
    attendance: 98,
    achievements: ['Math Olympiad Winner', 'Perfect Score in Calculus'],
    color: 'primary'
  },
  {
    name: 'Noah Williams',
    grade: 'A',
    subject: 'Physics',
    department: 'Science ',
    attendance: 95,
    achievements: ['Science Fair Gold Medal', 'Research Publication'],
    color: 'info'
  },
  {
    name: 'Olivia Davis',
    grade: 'A+',
    subject: 'Literature',
    department: 'Humanities',
    attendance: 97,
    achievements: ['Essay Competition Winner', 'Published Poet'],
    color: 'success'
  }
]

const TopCourses = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  return (
    <Card>
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
        <Typography variant='h6' sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Top Performing Students
        </Typography>
        <OptionMenu options={['Current Semester', 'Last Semester', 'Academic Year']} />
      </Box>
      <CardContent className='flex flex-col gap-4'>
        {studentData.map((student, i) => (
          <div key={i} className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-${isMobile ? 'center' : 'start'} gap-3`}>
            <CustomAvatar
              variant='rounded'
              skin='light'
              color={student.color}
              src={`/images/avatars/avatar-${i + 1}.png`}
              alt={student.name}
              sx={{
                width: isMobile ? 60 : 50,
                height: isMobile ? 60 : 50,
                mb: isMobile ? 2 : 0
              }}
            >
              {student.name.charAt(0)}
            </CustomAvatar>
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between w-full`}>
              <div className={`flex-1 ${isMobile ? 'text-center mb-3' : ''}`}>
                <Typography className='font-medium text-base' color='text.primary'>
                  {student.name}
                </Typography>
                <Box className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2 mt-1`}>
                  <Typography variant='body2' color='text.secondary'>
                    {student.subject}
                  </Typography>
                  <Typography variant='caption' className='text-xs' color='text.disabled'>
                    |
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {student.department}
                  </Typography>
                </Box>
                <Box className={`flex items-center flex-wrap ${isMobile || isTablet ? 'justify-center' : ''} gap-2 mt-2`}>
                  <Tooltip title="Attendance Rate">
                    <Chip
                      label={`${student.attendance}% Attendance`}
                      size='small'
                      variant='outlined'
                      className='h-6'
                    />
                  </Tooltip>
                  {student.achievements.map((achievement, idx) => (
                    <Tooltip key={idx} title={achievement}>
                      <Chip
                        label={achievement.split(' ')[0]}
                        size='small'
                        variant='outlined'
                        className='h-6'
                      />
                    </Tooltip>
                  ))}
                </Box>
              </div>
              <Box className={`flex ${isMobile ? 'flex-row justify-center mt-2' : 'flex-col items-end min-w-24 ml-4'} gap-2`}>
                <Chip
                  label={student.grade}
                  variant='tonal'
                  size='small'
                  color={student.color}
                  className='min-w-16 justify-center'
                />
                <Typography variant='caption' color='text.secondary' className='text-xs whitespace-nowrap'>
                  Top {i + 1} Rank
                </Typography>
              </Box>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default TopCourses
