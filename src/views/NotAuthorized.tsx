'use client'
// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'
// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
// Type Imports
import type { Mode } from '@core/types'
// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
// React Imports
import { useState, useEffect } from 'react'
const NotAuthorized = ({ mode }: { mode: Mode }) => {
  // Vars
  const darkImg = '/images/pages/misc-mask-4-dark.png'
  const lightImg = '/images/pages/misc-mask-4-light.png'
  // Hooks
  const { lang: locale } = useParams()
  const miscBackground = useImageVariant(mode, lightImg, darkImg)
  const [subdomain, setSubdomain] = useState('')
  return (
    <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center gap-10'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset]'>
          <Typography className='text-8xl font-medium' color='text.primary'>
            401
          </Typography>
          <Typography variant='h4'>Enter valid domain! demo</Typography>
          <Typography>
            or You don&#39;t have permission to access this page. Go Home!
          </Typography>
        </div>
        <img
          alt='error-illustration'
          src='/images/illustrations/characters/6.png'
          className='object-cover bs-[300px] md:bs-[350px] lg:bs-[300px]'
        />
        <TextField
          label='School URL (subdomain)'
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value)}
          fullWidth
        />
        <Button
          component={Link}
          href={subdomain ? `https://${subdomain}.${"icbapp.site"}` : '/'}
          variant='contained'
          sx={{ mt: 2 }}
        >
          Go to your school
        </Button>
      </div>
      <img
        src={miscBackground}
        className='absolute bottom-0 z-[-1] is-full max-md:hidden'
      />
    </div>
  )
}
export default NotAuthorized
