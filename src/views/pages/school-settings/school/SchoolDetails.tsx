'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import type { SelectChangeEvent } from '@mui/material/Select'
import { useParams, useRouter } from 'next/navigation'

import { api } from '@/utils/axiosInstance'
import Loader from '@/components/Loader'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { toast } from 'react-toastify'

type Data = {
  fullName: string
  full_name: string
  username: string
  email: string
  organization: string
  contact: number | string
  password: string
  confirm: string
  image: string
  language: string
  role: number[]
}

type RoleOption = {
  id: number
  name: string
}

// Vars
const initialData: Data = {
  fullName: '',
  full_name: '',
  username: '',
  email: '',
  organization: '',
  contact: '',
  password: '',
  confirm: '',
  image: '',
  language: '',
  role: [],
}

const languageData = ['English', 'Arabic', 'French', 'German', 'Portuguese']

const SchoolDetails = () => {
  const selectedUser = JSON.parse(localStorage.getItem('selectedUser') || 'null') || initialData
  const [loading, setLoading] = useState(false)

  // States
  const [formData, setFormData] = useState<Data>(selectedUser || initialData)
  const [fileInput, setFileInput] = useState<string>('')
  const [imgSrc, setImgSrc] = useState<string>(selectedUser.image ? selectedUser.image : '/images/avatars/2.png')
  const [language, setLanguage] = useState<string[]>(['English'])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [role, setRole] = useState<number[]>([]) // now it's array
  const [rolesList, setRolesList] = useState<RoleOption[]>([])

  const { lang: locale } = useParams()
  const router = useRouter()
  const adminStore = useSelector((state: RootState) => state.admin)


  useEffect(() => {
    if (formData?.role) {
      const selectedIds = formData?.role?.map((r: any) => r.id);
      setRole(selectedIds);
    }
    console.log('initialData :- ', initialData);

  }, []);

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 2000)

    // Optional: Clear timeout on unmount
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        const response = await api.get('roles')
        const roles: RoleOption[] = response.data.lenght > 0 && response.data.map((r: any) => ({ id: r.id, name: r.name }))

        console.log('response', response)
        setRolesList(response.data.data)
      } catch (err) {
        console.error('Error fetching Roles:', err)
        toast.error(err instanceof Error ? err.message : 'Failed to fetch roles')
      }
      finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [])

  const handleDelete = (value: string) => {
    setLanguage(current => current.filter(item => item !== value))
  }

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    setLanguage(event.target.value as string[])
  }

  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFileInputChange = (file: ChangeEvent) => {

    const { files } = file.target as HTMLInputElement

    if (files && files.length !== 0) {
      const selectedFile = files[0]

      // preview image
      const reader = new FileReader()
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(selectedFile)

      // store the actual file instead of base64 string
      setFileInput(selectedFile as any) // ❗ Type assertion since `fileInput` is string
    }
  }


  const handleFileInputReset = () => {
    setFileInput('')
    setImgSrc('/images/avatars/1.png')
  }

  const storedSchool = localStorage.getItem('user')
  const schoolDetails = storedSchool ? JSON.parse(storedSchool) : {}

  const onSubmit = async (data: Data) => {
    try {
      setLoading(true)

      const formdata = new FormData()
      formdata.append('image', fileInput)

      formdata.append('full_name', data.fullName)
      formdata.append('username', data.username)
      formdata.append('email', data.email)
      formdata.append('password', data.password)
      formdata.append('password_confirmation', data.confirm)
      formdata.append('phone', String(data.contact))
      formdata.append('school_id', adminStore.school_id.toString() || '')
      formdata.append('tenant_id', adminStore.tenant_id.toString() || '')
      formdata.append('id', selectedUser.id || 0)

      const response = await api.post('user-add', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data?.success === true) {
        try {
          const assignRoleData = {
            user_id: selectedUser.id,
            role_ids: role,
            tenant_id: adminStore.tenant_id.toString() || '',
            school_id: adminStore?.school_id.toString() || '',
          }
          await api.post('/assign-role', assignRoleData, {
            headers: { 'Content-Type': 'application/json' }
          })

          if (response.data?.success === true) {
            toast.success('User updated successfully')
          }
        } catch (assignError) {
          console.error('Error assigning role:', assignError);
          alert(assignError)

        }
        finally {
          setLoading(false)
        }
        setRole([])
        setImageFile(null)
        setFormData(initialData as Data)
        router.replace(getLocalizedUrl('/apps/user/list/', locale as Locale))

      } else {
        toast.error('User update failed')
        // alert(response.data?.message || 'User creation failed')

      }
      setRole([])
      setImageFile(null)
      setFormData(initialData as Data)
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.username?.[0] ||
        'Something went wrong'
      toast.error(message || 'Something went wrong')
    }
    finally {
      setLoading(false)

    }
  }

  return (
    <Card>
      {loading && <Loader />}

      <CardContent className='mbe-5'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button component='label' variant='contained' htmlFor='account-settings-upload-image'>
                Upload New Photo
                <input
                  hidden
                  type='file'
                  accept='image/png, image/jpeg'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                />

              </Button>
              <Button variant='outlined' color='error' onClick={handleFileInputReset}>
                Reset
              </Button>
            </div>
            <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <form
          onSubmit={e => {
            e.preventDefault()
            onSubmit(formData)
          }}
        >

          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Full Name'
                value={formData.fullName || formData.full_name || ''}
                placeholder='John Doe'
                onChange={e => handleFormChange('fullName', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                disabled
                fullWidth
                label='Username'
                value={formData.username}
                placeholder='Doe'
                onChange={e => handleFormChange('username', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Email'
                value={formData.email}
                placeholder='john.doe@gmail.com'
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Contact'
                value={formData.contact}
                placeholder='+1 (234) 567-8901'
                onChange={e => handleFormChange('contact', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Password'
                value={formData.password}
                placeholder='Password'
                onChange={e => handleFormChange('password', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Confirm Password'
                value={formData.confirm}
                placeholder='Password'
                onChange={e => handleFormChange('confirm', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Select Role</InputLabel>
                <Select
                  multiple
                  label="Role"
                  value={role}
                  onChange={(event: SelectChangeEvent<number[]>) => {
                    const value = event.target.value;
                    setRole(typeof value === 'string' ? value.split(',').map(Number) : value);
                  }}
                  renderValue={(selected) => (
                    <div className="flex flex-wrap gap-2">
                      {(selected as number[]).map((roleId) => {
                        const roleName = rolesList.find(r => r.id === roleId)?.name;
                        return (
                          <Chip
                            key={roleId}
                            label={roleName}
                            size="small"
                            onDelete={() => setRole(role.filter(id => id !== roleId))}
                            deleteIcon={
                              <i
                                className="ri-close-circle-fill"
                                onMouseDown={(event) => event.stopPropagation()}
                              />
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                >
                  {rolesList.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }} className='flex gap-4 flex-wrap pbs-6'>
              <Button variant='contained' type='submit'>
                Save Changes
              </Button>
              <Button variant='outlined' type='reset' color='secondary' onClick={() => setFormData(initialData)}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default SchoolDetails
