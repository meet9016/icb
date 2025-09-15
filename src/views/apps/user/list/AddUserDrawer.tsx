// React Imports
'use client'
import { useState, useEffect } from 'react'
import Chip from '@mui/material/Chip'

// MUI Imports
import {
  Button, Drawer, FormControl, IconButton, InputLabel, MenuItem,
  Select, TextField, Typography, Divider,
  Box,
  Checkbox,
  ListItemText,
  OutlinedInput
} from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { api } from '@/utils/axiosInstance'
import Loader from '@/components/Loader'

import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
// Types Imports
import type { UsersType } from '@/types/apps/userTypes'
import { toast } from 'react-toastify'
import SaveButton from '@/comman/button/SaveButton'
import CancelButtons from '@/comman/button/CancelButtons'
import endPointApi from '@/utils/endPointApi'

type Props = {
  open: boolean
  handleClose: () => void
  editUserData?: UsersType
  fetchUsers: () => void
  selectedUser: any
}

type FormValidateType = {
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
  role: number[]
  phone: string
}

export type RoleOption = {
  id: number
  name: string
}

const AddUserDrawer = ({ open, handleClose, editUserData, fetchUsers, selectedUser }: Props) => {

  const [rolesList, setRolesList] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestName, setSuggestedName] = useState<string[]>([])
  const adminStore = useSelector((state: RootState) => state.admin)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    getValues,
    formState: { errors, isValid }
  } = useForm<FormValidateType>({
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: [],
      phone: ''
    },
    mode: 'onChange',
    shouldUnregister: true
  })

  useEffect(() => {
    if (editUserData) {
      resetForm({
        fullName: editUserData.full_name || '',
        username: editUserData.username || '',
        email: editUserData.email || '',
        password: '',
        confirmPassword: '',
        role: editUserData?.roles?.map((r: any) => r.id) || [],
        phone: editUserData.phone || ''
      })
    } else {
      resetForm()
    }
  }, [editUserData, resetForm])

  const fetchRoles = async () => {
    try {
      const response = await api.get(`${endPointApi.getRolesDropdown}`)

      // const roles: RoleOption[] = response.data.data
      //   .filter((r: any) =>
      //     selectedUser
      //       ? r.name !== 'Super Admin'
      //       : r.name !== 'default' && r.name !== 'Super Admin'
      //   )
      //   .map((r: any) => ({ id: r.id, name: r.name }));
      const roles: RoleOption[] = response.data.data
        .filter((r: any) => r.name !== 'Super Admin')
        .map((r: any) => ({ id: r.id, name: r.name }));
      setRolesList(roles)
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [selectedUser])

  const onSubmit = async (data: FormValidateType) => {
    try {
      setLoading(true)
      const formdata = new FormData()

      formdata.append('full_name', data.fullName || '')
      formdata.append('username', data.username)
      formdata.append('email', data.email || '')
      formdata.append('password', data.password || '')
      formdata.append('password_confirmation', data.password || '')
      formdata.append('phone', data.phone || '')
      formdata.append('school_id', adminStore?.school_id.toString() || '')
      formdata.append('tenant_id', adminStore?.tenant_id.toString() || '')
      formdata.append('id', editUserData?.id ? String(editUserData.id) : '0')

      const selectedRoles = getValues('role')

      selectedRoles.forEach((id, index) => {
        formdata.append(`role_ids[${index}]`, String(id))
      })

      const response = await api.post('user-add', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data?.status === 200) {
        toast.success(response.data.message)
        handleReset()
        setSuggestedName([])
        fetchUsers()
        setLoading(false)
      }
    } catch (error: any) {
      toast.error(error.response.data.message)
      setSuggestedName(error.response.data.data.suggested_usernames)
      setLoading(false)
    } 
  }

  const handleReset = () => {
    resetForm({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: [],
      phone: ''
    })
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: '100%', md: '100%', lg: '50%', xl: '50%' }
        }
      }}
    >
      {loading && <Loader />}

      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>{selectedUser ? 'Edit' : 'Add'} User</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5' autoComplete='off'>
          <Controller
            name='fullName'
            control={control}
            rules={{ required: 'Full Name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Full Name'
                placeholder='John Doe'
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                autoComplete='off'

              />
            )}
          />
          <Controller
            name='username'
            control={control}
            rules={{ required: 'Username is required' }}
            render={({ field }) => (
              <>
                <TextField
                  {...field}
                  fullWidth
                  label='Username'
                  placeholder='johndoe'
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  autoComplete='off'
                  disabled={!!selectedUser}
                />

                {suggestName?.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Suggested Usernames:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                      {suggestName?.map((name: any) => (
                        <Chip
                          key={name}
                          label={name}
                          size="small"
                          onClick={() => field.onChange(name)}
                          clickable
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}
          />
          <Controller
            name='email'
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='email'
                label='Email'
                placeholder='johndoe@gmail.com'
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete='off'
              />
            )}
          />
          <Controller
            name='phone'
            control={control}
            rules={{
              required: 'Phone is required',
              // pattern: {
              //   value: /^\d{10}$/,
              //   message: 'Phone number must be 10 digits'
              // }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Phone'
                placeholder='1234567890'
                error={!!errors.phone}
                helperText={errors.phone?.message}
                autoComplete='off'
                type="tel"
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  onInput: (e: React.FormEvent<HTMLInputElement>) => {
                    // Remove any non-digit characters on input
                    const target = e.currentTarget;
                    target.value = target.value.replace(/\D/g, '');
                    field.onChange(target.value);
                  }
                }}
              />
            )}
          />
          <Controller
            name='password'
            control={control}
            rules={
              !selectedUser
                ? { required: 'Password is required' } // Add mode: password is required
                : {} // Edit mode: password is optional
            }
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='password'
                label='Password'
                placeholder='Enter password'
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete='off'

              />
            )}
          />

          <FormControl fullWidth>
            <Controller
              name="role"
              control={control}
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel id="demo-multiple-checkbox-label">Select Roles</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-multiple-select"
                    multiple
                    value={field.value || []}
                    onChange={(event) => {
                      const value = event.target.value
                      field.onChange(typeof value === 'string' ? value.split(',').map(Number) : value)
                    }}
                    input={<OutlinedInput label="Select Roles" />}
                    renderValue={(selected) => (
                      <div className="flex flex-wrap gap-2">
                        {(selected as number[]).map((roleId) => {
                          const roleName = rolesList.find(r => r.id === roleId)?.name
                          return (
                            <Chip
                              key={roleId}
                              label={roleName}
                              size="small"
                              onDelete={() => {
                                if (roleName !== 'default') {
                                  field.onChange(field.value.filter((id: number) => id !== roleId));
                                }
                              }}
                              // onDelete={() =>
                              //   field.onChange(field.value.filter((id: number) => id !== roleId))
                              // }
                              deleteIcon={
                                <i
                                  className="ri-close-circle-fill"
                                  onMouseDown={(event) => event.stopPropagation()}
                                />
                              }
                            />
                          )
                        })}
                      </div>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          width: 250,
                        },
                      },
                    }}
                  >
                    {rolesList
                      .filter((item) => {
                        // Hide 'default' role when selectedUser exists
                        if (item.name === 'default' && selectedUser) return false;
                        return true;
                      })
                      .map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          <Checkbox checked={field.value?.includes(item.id)} />
                          <ListItemText primary={item.name} />
                        </MenuItem>
                      ))}
                  </Select>
                  {/* <FormHelperText>{errors.role?.message}</FormHelperText> */}
                </FormControl>
              )}
            />
            {/* <FormHelperText>Select one or more roles</FormHelperText> */}
          </FormControl>
          <div className='flex self-center items-center gap-4'>
            {/* <Button variant='contained' type='submit' disabled={!isValid && !selectedUser}>
              Submit
            </Button> */}
            <SaveButton name="Save" type='submit' disabled={!isValid && !selectedUser} />
            <CancelButtons name='Cancel' onClick={handleReset} />
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
