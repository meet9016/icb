'use client'

import { useEffect, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import { OTPInput } from 'input-otp'
import type { SlotProps } from 'input-otp'
import classnames from 'classnames'

import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

import { useSettings } from '@core/hooks/useSettings'
import { useImageVariant } from '@core/hooks/useImageVariant'
import { getLocalizedUrl } from '@/utils/i18n'
import { api } from '@/utils/axiosInstance'
import Loader from '@/components/Loader'

import Link from '@components/Link'
import Form from '@components/Form'

import styles from '@/libs/styles/inputOtp.module.css'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { toast } from 'react-toastify'

type FormData = {
  otp: string
}

type ErrorType = {
  message: string[]
}

const Slot = (props: SlotProps) => (
  <div className={classnames(styles.slot, { [styles.slotActive]: props.isActive })}>
    {props.char !== null && <div>{props.char}</div>}
    {props.hasFakeCaret && <FakeCaret />}
  </div>
)

const FakeCaret = () => (
  <div className={styles.fakeCaret}>
    <div className='w-px h-5 bg-textPrimary' />
  </div>
)


const TwoStepsV2 = ({ mode }: { mode: Mode }) => {
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  // const userId = searchParams.get('userId') || ''
  const userId = atob(decodeURIComponent(searchParams.get('Id') || ''));

  const logo = '/images/apps/ecommerce/product-25.png'

  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const { register, handleSubmit, setValue, watch } = useForm<FormData>()
  const [loading, setLoading] = useState(false)
  const [bgUrl, setBgUrl] = useState<string>('')

  const otp = watch('otp')

  const storedSchool = localStorage.getItem('school')
  const schoolDetails = storedSchool ? JSON.parse(storedSchool) : {}


  const adminStore = useSelector((state: RootState) => state.admin)

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {

      setLoading(true)

      const formData = new FormData()
      formData.append("user_id", userId || '')
      formData.append('otp', data.otp)
      formData.append('school_id', adminStore.school_id.toString() || '')
      formData.append('tenant_id', adminStore.tenant_id || '')

      const response = await api.post('auth/verify-otp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log("response", response.data);

      if (response.data?.status === 200) {
        toast.success(response.data?.message || 'OTP verified successfully')
        router.replace(getLocalizedUrl('/reset-password?userId', locale as Locale))
        const redirectURL = searchParams.get('redirectTo') ?? `/reset-password?userId=${encodeURIComponent(userId)}`
        router.replace(getLocalizedUrl(redirectURL, locale as Locale))
      }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors && typeof errors === 'object') {
        const messages = Object.values(errors).flat()
        setErrorState({ message: messages as string[] })

      } else {
        setErrorState({ message: ['Something went wrong. Please try again.'] })
      }
      toast.error(error?.response.data.message)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (adminStore?.background_image) {
      setBgUrl(adminStore?.background_image)
    }
  }, [adminStore])

  const resendOTP = async () => {
    setValue('otp', '');
    try {
      setLoading(true)

      const formData = new FormData()

      formData.append('username', adminStore.username || '')
      formData.append('school_id', adminStore.school_id.toString() || '')
      formData.append('tenant_id', adminStore.tenant_id || '')

      const response = await api.post('auth/forgot-password-check', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (response.data?.status === 200) {
        toast.success(response.data?.message || 'OTP sent successfully')
      }

    } catch (error: any) {
      const errors = error.response?.data?.message
      if (errors && typeof errors === 'object') {
        const messages = Object.values(errors).flat()
        setErrorState({ message: messages as string[] })
      } else {
        setErrorState({ message: ['Something went wrong. Please try again.'] })
      }
      toast.error(errors)
    }
    finally {
      setLoading(false)

    }
  }

  const handleOtpChange = (val: string) => {
    setValue('otp', val)
  }

  const authBackground = useImageVariant(
    mode,
    '/images/pages/auth-v2-mask-2-light.png',
    '/images/pages/auth-v2-mask-2-dark.png'
  )

  const characterIllustration = useImageVariant(
    mode,
    '/images/illustrations/auth/v2-two-steps-light.png',
    '/images/illustrations/auth/v2-two-steps-dark.png',
    '/images/illustrations/auth/v2-two-steps-light-border.png',
    '/images/illustrations/auth/v2-two-steps-dark-border.png'
  )

  return (
    <div className='flex bs-full justify-center'>
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
      {loading && <Loader />}



      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='self-center m-5 "w-[50px]"'>
            {adminStore?.l_logo &&
              <img src={adminStore?.l_logo || logo}
                className='max-bs-[73px] max-is-full bs-auto'
                alt='School Logo' />}
          </div>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Two Step Verification 💬</Typography>
            <Typography>
              We sent a verification code to your Email. Enter the code from the email in the field below.
            </Typography>
            <Typography className='font-medium capitalize' color='text.primary'>
              {/* {userId} */}
            </Typography>
          </div>

          <Form noValidate autoComplete='off' className='flex flex-col gap-5' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-2'>
              <Typography>Type your 6 digit security code</Typography>
              <OTPInput
                value={otp ?? ''}
                maxLength={6}
                onChange={handleOtpChange}
                containerClassName='group flex items-center'
                render={({ slots }) => (
                  <div className='flex items-center justify-between w-full gap-4'>
                    {slots.slice(0, 6).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>
                )}
              />
              {errorState?.message?.[0] && (
                <Typography variant='caption' color='error'>
                  {errorState.message[0]}
                </Typography>
              )}
            </div>

            <Button fullWidth variant='contained' type='submit'>
              Verify OTP
            </Button>

            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Didn&#39;t get the code?</Typography>
              <Typography className='cursor-pointer' color='primary.main' onClick={resendOTP}>
                Resend
              </Typography>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default TwoStepsV2
