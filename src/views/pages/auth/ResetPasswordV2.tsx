'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'

import classnames from 'classnames'

import type { Locale } from '@configs/i18n'
import type { Mode } from '@core/types'

import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'

import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

import { getLocalizedUrl } from '@/utils/i18n'
import { api } from '@/utils/axiosInstance'
import Loader from '@/components/Loader'
import { toast } from 'react-toastify'

type FormData = {
  password: string
  confirmPassword: string
}

type ErrorType = {
  message: string[]
}

const ResetPasswordV2 = ({ mode }: { mode: Mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [loading, setLoading] = useState(false)

  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const router = useRouter()

  const storedSchool = localStorage.getItem('school')
  const schoolDetails = storedSchool ? JSON.parse(storedSchool) : {}

  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm<FormData>()

  const authBackground = useImageVariant(mode, '/images/pages/auth-v2-mask-3-light.png', '/images/pages/auth-v2-mask-3-dark.png')

  const characterIllustration = useImageVariant(
    mode,
    '/images/illustrations/auth/v2-reset-password-light.png',
    '/images/illustrations/auth/v2-reset-password-dark.png',
    '/images/illustrations/auth/v2-reset-password-light-border.png',
    '/images/illustrations/auth/v2-reset-password-dark-border.png'
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match' })
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()

      formData.append('user_id', schoolDetails.school?.id || '')
      formData.append('school_id', schoolDetails.school?.id || '')
      formData.append('tenant_id', schoolDetails.school?.tenant_id || '')
      formData.append('new_password', data.password)
      formData.append('new_password_confirmation', data.confirmPassword)

      const response = await api.post('auth/reset-password', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data?.status === true) {
        // router.replace(getLocalizedUrl('/login', locale as Locale))
      }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors && typeof errors === 'object') {
        const messages = Object.values(errors).flat()
        setErrorState({ message: messages as string[] })
        // alert(errorState)


      } else {
        setErrorState({ message: ['Something went wrong. Please try again.'] })
        alert(errorState)

      }
    }
    finally {
      setLoading(false)

    }
  }

  return (
    <div className='flex bs-full justify-center'>
      {loading && <Loader />}

      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          { 'border-ie': settings.skin === 'bordered' }
        )}
      >
        {schoolDetails?.school?.background_image && (
          <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
            <img
              src={schoolDetails?.school?.background_image}
              alt='character-illustration'
              className='max-bs-[677px] max-is-full bs-auto'
            />
          </div>
        )}
        <img src={authBackground} className='absolute z-[-1] bottom-[4%] is-full max-md:hidden' />
      </div>

      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4'>Reset Password 🔒</Typography>
            <Typography className='mbs-1'>
              Your new password must be different from previously used passwords
            </Typography>
          </div>

          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <TextField
              fullWidth
              label='New Password'
              type={isPasswordShown ? 'text' : 'password'}
              {...register('password', { required: 'Password is required' })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={handleClickShowPassword} edge='end'>
                      <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label='Confirm Password'
              type={isConfirmPasswordShown ? 'text' : 'password'}
              {...register('confirmPassword', { required: 'Please confirm your password' })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={handleClickShowConfirmPassword} edge='end'>
                      <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {errorState?.message?.[0] && (
              <Typography variant='caption' color='error'>
                {errorState.message[0]}
              </Typography>
            )}

            <Button fullWidth variant='contained' type='submit'>
              Set New Password
            </Button>

            <Typography className='flex justify-center items-center' color='primary.main'>
              <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center gap-1.5'>
                <DirectionalIcon
                  ltrIconClass='ri-arrow-left-s-line'
                  rtlIconClass='ri-arrow-right-s-line'
                  className='text-xl'
                />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordV2
