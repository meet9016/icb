"use client"

// MUI Imports
import { useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

type DataType = {
  icon: string
  title: string
  value: string
}

type EventDataType = {
  name: string
  type: 'exam' | 'event'
  date: string
  time: string
  location: string
  image: string
}

// Sample data for upcoming events/exams
const events: EventDataType[] = [
  {
    name: 'Final Exam',
    type: 'exam',
    date: '25 May 2025',
    time: '09:00 AM - 11:00 AM',
    location: 'Main Hall',
    image: '/images/illustrations/characters/1.png'
  },
  {
    name: 'Science Fair',
    type: 'event',
    date: '30 May 2025',
    time: '01:00 PM - 04:00 PM',
    location: 'Science Block',
    image: '/images/illustrations/characters/2.png'
  }
]

const UpcomingWebinar = () => {
  // State to track which event is currently shown
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentEvent = events[currentIndex]

  // Event details to display in the component
  const eventDetails: DataType[] = [
    { icon: 'ri-calendar-line', title: currentEvent.date, value: 'Date' },
    { icon: 'ri-time-line', title: currentEvent.time, value: 'Duration' },

    // { icon: 'ri-map-pin-line', title: currentEvent.location, value: 'Location' }
  ]

  // Function to navigate to a specific event
  const navigateToEvent = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex justify-center pli-3 pbs-3
         rounded bg-[var(--mui-palette-primary-lightOpacity)]'>
          <img src={currentEvent.image} className='bs-[140px]' alt={currentEvent.name} />
        </div>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center justify-between'>
            <Typography variant='h5'>Upcoming {currentEvent.type === 'exam' ? 'Exam' : 'Event'}</Typography>
            <Chip 
              label={currentEvent.type === 'exam' ? 'Exam' : 'Event'} 
              color={currentEvent.type === 'exam' ? 'error' : 'success'} 
              size="small" 
            />
          </div>
          <Typography>{currentEvent.name}</Typography>
        </div>
        <div className='flex flex-wrap justify-between gap-4'>
          {eventDetails.map((item, i) => (
            <div key={i} className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary'>
                <i className={item.icon} />
              </CustomAvatar>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary'>{item.title}</Typography>
                <Typography>{item.value}</Typography>
              </div>
            </div>
          ))}
        </div>
        <Button variant='contained'>{currentEvent.type === 'exam' ? 'View Details' : 'Register'}</Button>
        
        <Box 
  sx={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    gap: 2, 
    mt: 1 
  }}
>
  {/* Left Arrow */}
  <IconButton 
    onClick={() => navigateToEvent((currentIndex - 1 + events.length) % events.length)}
    sx={{ visibility: events.length > 1 ? 'visible' : 'hidden', pointerEvents: 'auto' }}
    size="small"
  >
    <i className="ri-arrow-left-s-line" />
  </IconButton>

  {/* Navigation Dots */}
  <Box sx={{ display: 'flex', gap: 1 }}>
    {events.map((_, index) => (
      <Box
        key={index}
        onClick={() => navigateToEvent(index)}
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          cursor: 'pointer',
          backgroundColor: index === currentIndex ? 'primary.main' : 'action.disabled',
          transition: 'background-color 0.3s ease'
        }}
      />
    ))}
  </Box>

  {/* Right Arrow */}
  <IconButton 
    onClick={() => navigateToEvent((currentIndex + 1) % events.length)}
    sx={{ visibility: events.length > 1 ? 'visible' : 'hidden', pointerEvents: 'auto' }}
    size="small"
  >
    <i className="ri-arrow-right-s-line" />
  </IconButton>
</Box>

      </CardContent>
    </Card>
  )
}

export default UpcomingWebinar
