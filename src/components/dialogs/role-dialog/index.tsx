'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/redux-store'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  DialogActions,
  Button
} from '@mui/material'

import type { RoleType } from '@/types/apps/roleType'
import tableStyles from '@core/styles/table.module.css'
import { api } from '@/utils/axiosInstance'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import { useSettings } from '@core/hooks/useSettings'
import Loader from '@/components/Loader'
import { toast } from 'react-toastify'

type RoleDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  item?: RoleType
  title?: string
}
type ErrorType = {
  message: string[]
}
const defaultData: string[] = [
  'User Management',
  'Content Management',
  'Disputes Management',
  'Database Management',
  'Financial Management',
  'Reporting',
  'API Control',
  'Repository Management',
  'Payroll'
]

const RoleDialog = ({ open, setOpen, item, title }: RoleDialogProps) => {
  const [selectedCheckbox, setSelectedCheckbox] = useState<string[]>([])
  const [roleName, setRoleName] = useState<string>('')
  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState<boolean>(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [loading, setLoading] = useState(false)

  const storedSchool = localStorage.getItem('school')
  const schoolDetails = storedSchool ? JSON.parse(storedSchool) : {}

  const dispatch = useDispatch<AppDispatch>()
  const roleStore = useSelector((state: { roleReducer: RoleType[] }) => state.roleReducer)

  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()

  useEffect(() => {
    if (title && item) {
      setRoleName(item.title)
      setSelectedCheckbox(item.permission || [])
    } else {
      setRoleName('')
      setSelectedCheckbox([])
    }
    setIsIndeterminateCheckbox(false)
  }, [title, item, open])

  useEffect(() => {
    const totalPermissions = defaultData.length * 3
    setIsIndeterminateCheckbox(
      selectedCheckbox.length > 0 && selectedCheckbox.length < totalPermissions
    )
  }, [selectedCheckbox])

  const togglePermission = (id: string) => {
    setSelectedCheckbox(prev =>
      prev.includes(id) ? prev.filter(perm => perm !== id) : [...prev, id]
    )
  }

  const handleSelectAllCheckbox = () => {
    if (selectedCheckbox.length === defaultData.length * 3) {
      setSelectedCheckbox([])
    } else {
      const allPermissions = defaultData.flatMap(item => {
        const id = item.toLowerCase().replace(/\s+/g, '-')
        return [`${id}-read`, `${id}-write`, `${id}-create`]
      })
      setSelectedCheckbox(allPermissions)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    const id = item?.id ?? (roleStore.length + 1).toString()

    // const newRole: RoleType = {
    //   id,
    //   title: roleName,
    //   totalUsers: item?.totalUsers ?? 0,
    //   avatars: item?.avatars ?? [],
    //   permission: selectedCheckbox
    // }

    try {
      if (loading) return;
      setLoading(true)

      // const resultAction = await dispatch(addRoleToDB(newRole))

      const payload = {
        name: roleName,
        permissions: [],
        tenant_id: schoolDetails.school?.tenant_id || '',
        school_id: schoolDetails.school?.id || ''
      }

      const response = await api.post('/roles', payload)

      if (response.data?.status === true) {
        router.replace(getLocalizedUrl('/roles', locale as Locale))
      }

      // if (addRoleToDB.fulfilled.match(resultAction)) {
      //   handleClose()
      // } else {
      //   console.error(' Failed to save:', resultAction.payload)
      // }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors && typeof errors === 'object') {
        const messages = Object.values(errors).flat()
        setErrorState({ message: messages as string[] })
        toast.error("something went wrong, please try again later.")

      } else {
        setErrorState({ message: ['Something went wrong. Please try again.'] })
        toast.error("something went wrong, please try again later.")
      }
    }
    finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRoleName('')
    setSelectedCheckbox([])
    setIsIndeterminateCheckbox(false)
    setOpen(false)
  }

  return (
    <Dialog fullWidth maxWidth='md' scroll='body' open={open} onClose={handleClose}>
      {/* {loading && <Loader />} */}

      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center'>
        {title ? 'Edit Role' : 'Add Role'}
        <Typography component='span'>Set Role Permissions</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible'>
          <IconButton onClick={handleClose} className='absolute top-4 right-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          <TextField
            label='Role Name'
            variant='outlined'
            fullWidth
            value={roleName}
            placeholder='Enter Role Name'
            onChange={e => setRoleName(e.target.value)}
          />

          <Typography variant='h5' className='my-6'>
            Role Permissions
          </Typography>

          <div className='flex flex-col overflow-x-auto'>
            <table className={tableStyles.table}>
              <tbody>
                <tr>
                  <th>
                    <Typography className='font-medium'>Administrator  Access</Typography>
                  </th>
                  <th className='text-end'>
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleSelectAllCheckbox}
                          indeterminate={isIndeterminateCheckbox}
                          checked={selectedCheckbox.length === defaultData.length * 3}
                        />
                      }
                      label='Select All'
                    />
                  </th>
                </tr>

                {defaultData.map((label, index) => {
                  const id = label.toLowerCase().replace(/\s+/g, '-')

                  return (
                    <tr key={index}>
                      <td>
                        <Typography className='font-medium'>{label}</Typography>
                      </td>
                      <td className='text-end'>
                        <FormGroup row className='justify-end gap-6'>
                          {['read', 'write', 'create'].map(type => (
                            <FormControlLabel
                              key={type}
                              control={
                                <Checkbox
                                  checked={selectedCheckbox.includes(`${id}-${type}`)}
                                  onChange={() => togglePermission(`${id}-${type}`)}
                                />
                              }
                              label={type.charAt(0).toUpperCase() + type.slice(1)}
                            />
                          ))}
                        </FormGroup>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </DialogContent>

        <DialogActions className='justify-center py-6'>
          <Button variant='contained' type='submit'>
            Submit
          </Button>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RoleDialog
