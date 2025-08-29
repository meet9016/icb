
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import classnames from 'classnames'
import { api } from '@/utils/axiosInstance'
import Loader from '@/components/Loader'

import {
  Typography,
  TextField,
  Button
} from '@mui/material'

import type { Locale } from '@configs/i18n'
import type { Mode } from '@core/types'

import Logo from '@components/layout/shared/Logo'
import DirectionalIcon from '@components/DirectionalIcon'

import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { getLocalizedUrl } from '@/utils/i18n'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { toast } from 'react-toastify'
import endPointApi from '@/utils/endPointApi'

type FormData = {
  email: string
  phone: string
  userName: string
}

type ErrorType = {
  message: string[]
}

const ForgotPasswordV2 = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const adminStore = useSelector((state: RootState) => state.admin)
  const searchParams = useSearchParams()

  const { settings } = useSettings()
  const { lang: locale } = useParams()

  const authBackground = useImageVariant(
    mode,
    '/images/pages/auth-v2-mask-4-light.png',
    '/images/pages/auth-v2-mask-4-dark.png'
  )

  const logo = '/images/apps/ecommerce/product-25.png'

  const [errorState, setErrorState] = useState<ErrorType | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [bgUrl, setBgUrl] = useState<string>('')

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(prev => prev - 1), 500)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setLoading(true)

      const formData = new FormData()

      formData.append('username', data.userName)
      formData.append('school_id', adminStore.school_id.toString() || '')
      formData.append('tenant_id', adminStore.tenant_id || '')

      const response = await api.post(`${endPointApi.forgotPassword}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // if (response.data?.success === true) {
      //   const redirectURL = searchParams.get('redirectTo') ?? `/otp?email=${encodeURIComponent(data.email)}`
      //   router.replace(getLocalizedUrl(redirectURL, locale as Locale))
      // }

      if (response.data?.success === true) {
        const redirectURL = searchParams.get('redirectTo') ?? `/otp?Id=${encodeURIComponent(btoa(response.data.user_id))}`
        router.replace(getLocalizedUrl(redirectURL, locale as Locale))
        toast.success(response.data.message || 'OTP sent successfully')
      }
    } catch (error: any) {
      setCooldown(30)
      const errors = error.response?.data?.message
      if (errors && typeof errors === 'object') {
        const messages = Object.values(errors).flat()
        setErrorState({ message: messages as string[] })
      } else {
        setErrorState({ message: ['Something went wrong. Please try again.'] })
      }
      toast.error(errors)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (adminStore?.background_image) {
      setBgUrl(adminStore?.background_image)
    }
  }, [adminStore])


  return (
    <div className='flex bs-full justify-center'>
      {loading && <Loader />}

      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
        className={classnames(
          'flex items-center justify-center bs-full flex-1 min-bs-[100dvh] relative max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>

      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='self-center m-5 "w-[50px]"'>
            {adminStore?.l_logo &&
              <img src={adminStore?.l_logo || logo}
                className='max-bs-[73px] max-is-full bs-auto'
                alt='School Logo' />}
          </div>
          <div>
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <Typography className='mbs-1'>
              Enter your email and we&#39;ll send you instructions to reset your password
            </Typography>
          </div>

          <form
            noValidate
            autoComplete='off'
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-5'
          >
            <TextField
              fullWidth
              label='Username'
              {...register('userName', {
                required: 'Username is required',
              })}
              error={!!errorState || !!errors.userName}
              helperText={errors.userName?.message || errorState?.message?.[0]}
            />

            <Button fullWidth variant='contained' type='submit' disabled={cooldown > 0}>
              Send OTP
            </Button>

            <Typography className='flex justify-center items-center' color='primary.main'>
              <Link href='/login' className='flex items-center gap-1.5'>
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

export default ForgotPasswordV2
