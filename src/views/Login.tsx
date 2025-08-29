/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
// Third-party Imports

import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@/configs/i18n'
import axios from 'axios'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { saveToken } from '@/utils/tokenManager'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { Box, Checkbox, FormControlLabel, Skeleton } from '@mui/material'
import { toast } from 'react-toastify'
import { setLoginInfo } from '@/redux-store/slices/login'
import { setUserPermissionInfo } from '@/redux-store/slices/userPermission'
import endPointApi from '@/utils/endPointApi'
import showMsg from '@/utils/showMsg'
import { api } from '@/utils/axiosInstance'
import { setAdminInfo } from '@/redux-store/slices/admin'
import ToastsCustom from '@/comman/toastsCustom/LoginToasts'
import { setConnectDataLack } from '@/redux-store/slices/dataLack'

type ErrorType = {
  message: string[]
}
type School = {
  name: string
  logo: string
  background_image: string
  [key: string]: any
}

type FormData = InferInput<typeof schema>

export const schema = object({
  username: pipe(string(), nonEmpty('Username is required')),
  password: pipe(
    string(),
    nonEmpty('Password is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const adminStore = useSelector((state: RootState) => state.admin)

  const [loading, setLoading] = useState(false)
  const [disableBtn, setDisableBtn] = useState(false)
  const [bgUrl, setBgUrl] = useState<string>('')

  const dispatch = useDispatch()

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-1-light.png'
  const logo = '/images/apps/ecommerce/product-25.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')

    if (token) {
      const homeUrl = getLocalizedUrl('dashboards/academy/', locale as Locale)
      router.replace(homeUrl)
    } else {
      setShouldRender(true)
    }
  }, [])

  // if (!shouldRender) return null

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setDisableBtn(true)
    const formData = new FormData()
    formData.append('username', data.username)
    formData.append('password', data.password)
    formData.append('tenant_id', adminStore?.tenant_id || '')

    api
      .post(`${endPointApi.login}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(async response => {
        // if (response.data.status === 200 && response.data.message === 'Login Success') {

        saveToken(response.data.access_token)
        ToastsCustom(response.data.data.username, `${showMsg.login}`, '/images/avatars/1.png')
        // toast.success(`${showMsg.login}`);
        dispatch(setLoginInfo(response.data.data))

        const redirectURL = searchParams.get('redirectTo') ?? '/dashboards'
        router.replace(getLocalizedUrl(redirectURL, locale as Locale))

        // Fetch permission after login
        if (response.data.data.username !== response.data.data.tenant_id) {
          const rolesResponse = await api.get(`${endPointApi.getRole}?id=${response.data.data.id}`)
          dispatch(setUserPermissionInfo(rolesResponse.data.roles))
        }
        setDisableBtn(false)

        //DataLack Connection
        const res = await api.get(`${endPointApi.getConnectionView}`)
        dispatch(setConnectDataLack(res.data.data[0].status_view))
        // } else {
        //   const message = response?.data?.message || 'Login failed';
        //   toast.error(message);
        // }
      })
      .catch(error => {
        const message = error?.response?.data?.message || 'Username or Password is incorrect'

        if (error?.response?.status === 404) {
          toast.error(message)
          setDisableBtn(false)
          setLoading(false)
        } else {
          toast.error(message)
          setDisableBtn(false)
          setLoading(false)
        }
      })
      .finally(() => {
        setLoading(false)
        setDisableBtn(false)
      })
  }

  useEffect(() => {
    if (adminStore?.background_image) {
      setBgUrl(adminStore?.background_image)
    }
  }, [adminStore])

  const firstApiCall = async () => {
    // try {
    // setLoading(true);
    const hostNameParts = window.location.hostname.split('.')
    const hostNameData = hostNameParts.length > 2 ? hostNameParts[0] : 'icbmyschool'

    const baseURL = process.env.NEXT_PUBLIC_APP_URL

    if (!baseURL) {
      throw new Error('')
    }

    const formData = new URLSearchParams()
    formData.append('type', hostNameData)

    try {
      const res = await fetch(baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })

      const data = await res.json()

      if (data.status === 200) {
        dispatch(setAdminInfo(data.data))
        //   setLoading(false);
      }
    } catch (error) {
      console.error('Error calling API', error)
    }
  }

  useEffect(() => {
    firstApiCall()
  }, [])

  return (
    <div className='flex bs-full justify-center'>
      {/* {loading && <Loader />} */}
      {/* {loading || !adminStore?.background_image ? (
        <Skeleton
          variant="rectangular"
          width="100vw"
          height="100vh"
        />
          ) : ( */}
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${adminStore?.background_image})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        {/* <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' /> */}
      </div>
      {/* )} */}
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div className='self-center m-5 "w-[50px]"'>
            {loading || !adminStore?.l_logo ? (
              <Skeleton variant='rectangular' width={200} height={50} sx={{ borderRadius: '8px' }} />
            ) : (
              <img src={adminStore?.l_logo || ''} className='max-bs-[73px] max-is-full bs-auto' />
            )}
          </div>

          {loading ? (
            <LoginFormSkeleton />
          ) : (
            <>
              <div>
                <Typography variant='h5'>{adminStore && `Welcome to ${adminStore?.name}! 👋🏻`}</Typography>
              </div>
              <form
                noValidate
                action={() => {}}
                autoComplete='off'
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col gap-5'
              >
                <Controller
                  name='username'
                  control={control}
                  // rules={{ required: true }}

                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      autoFocus
                      type='username'
                      label='Username'
                      value={field.value ?? ''} // this prevents the warning!
                      onChange={e => {
                        field.onChange(e.target.value)

                        errorState !== null && setErrorState(null)
                      }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  height: '100%',
                                  backgroundColor: 'var(--mui-palette-primary-main)',
                                  color: '#fff !important',
                                  fontWeight: 600,
                                  padding: '15px 12px',
                                  borderTopRightRadius: '8px',
                                  borderBottomRightRadius: '8px'
                                }}
                              >
                                {adminStore?.tenant_id || 'School_ID'}
                              </span>
                            </InputAdornment>
                          )
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          pl: 0, // ✅ Removes left padding from input container
                          borderRadius: '8px',
                          paddingInlineEnd: '0px !important'
                        },
                        '& input': {
                          pl: 0 // ✅ Removes padding from actual input field
                        },
                        '& .mui-4d4ugy-MuiInputAdornment-root': {
                          color: '#fff'
                        },
                        '& .mui-pfniu1': {
                          color: '#fff'
                        }
                      }}
                      error={!!errors.username}
                      helperText={errors?.username?.message}
                    />
                  )}
                />
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      value={field.value ?? ''} // this prevents the warning!
                      label='Password'
                      id='login-password'
                      type={isPasswordShown ? 'text' : 'password'}
                      onChange={e => {
                        field.onChange(e.target.value)
                        errorState !== null && setErrorState(null)
                      }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                edge='end'
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                                aria-label='toggle password visibility'
                              >
                                <i className={isPasswordShown ? 'ri-eye-line' : 'ri-eye-off-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                      {...(errors.password && { error: true, helperText: errors.password.message })}
                    />
                  )}
                />
                <div className='flex justify-start items-center flex-wrap gap-x-3 gap-y-1'>
                  <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me ' />
                </div>
                <Button disabled={disableBtn} fullWidth variant='contained' type='submit'>
                  Log In
                </Button>

                <div className='flex justify-between items-center flex-wrap gap-2'>
                  <Typography
                    className=''
                    color=''
                    component={Link}
                    href={getLocalizedUrl('/forgot-username', locale as Locale)}
                  >
                    Forgot Username?
                  </Typography>
                  <Typography
                    className=''
                    color=''
                    component={Link}
                    href={getLocalizedUrl('/forgot-password', locale as Locale)}
                  >
                    Forgot Password?
                  </Typography>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      {/* <ToastsCustom /> */}
    </div>
  )
}

export default Login

const LoginFormSkeleton = () => {
  return (
    <Box className='flex flex-col gap-5'>
      {/* Welcome message */}
      <Typography variant='h5'>
        <Skeleton width={300} height={32} />
      </Typography>

      {/* Username Input Skeleton */}
      <Skeleton variant='rounded' height={56} />

      {/* Password Input Skeleton */}
      <Skeleton variant='rounded' height={56} />

      {/* Remember Me Checkbox */}
      <Box className='flex justify-start items-center gap-2'>
        <Skeleton sx={{ borderRadius: 2 }} width={20} height={35} />
        <Skeleton width={100} height={20} />
      </Box>

      {/* Login Button */}
      <Skeleton variant='rounded' width='100%' height={44} />

      {/* Links (Forgot Username / Password) */}
      <Box className='flex justify-between gap-2'>
        <Skeleton width={120} height={20} />
        <Skeleton width={120} height={20} />
      </Box>
    </Box>
  )
}
