'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  AlertTitle
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/redux-store'
import { api } from '@/utils/axiosInstance'
import { useParams, useRouter } from 'next/navigation'
import { addPermission, updatePermission } from '@/redux-store/slices/permission'
import Loader from '@/components/Loader'

import type { Locale } from '@configs/i18n'
import type { PermissionRowType } from '@/types/apps/permissionTypes'
import { toast } from 'react-toastify'

type PermissionDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: string
  id?: number
}

type EditProps = {
  handleClose: () => void
  data: string
  handleSummit: (data: string) => void
}

const AddContent = ({
  handleClose,
  handleSummit
}: {
  handleClose: () => void
  handleSummit: (data: string) => void
}) => {
  const [permissionName, setPermissionName] = useState<string>('')

  return (
    <>
      <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-16'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>
        <TextField
          fullWidth
          label='Permission Name'
          variant='outlined'
          placeholder='Enter Permission Name'
          className='mbe-5'
          value={permissionName}
          onChange={e => setPermissionName(e.target.value)}
        />
        <FormControlLabel control={<Checkbox />} label='Set as core permission' />
      </DialogContent>
      <DialogActions className='max-sm:flex-col max-sm:items-center justify-center pbs-0 sm:pbe-16 sm:pli-16 gap-y-4'>
        <Button type='submit' variant='contained' onClick={() => handleSummit(permissionName)}>
          Create Permission
        </Button>
        <Button onClick={handleClose} variant='outlined'>
          Discard
        </Button>
      </DialogActions>
    </>
  )
}

const EditContent = ({ handleClose, data, handleSummit }: EditProps) => {
  const [permissionName, setPermissionName] = useState<string>(data)

  return (
    <DialogContent className='overflow-visible pbs-0 sm:pbe-16 sm:pli-16'>
      <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line text-textSecondary' />
      </IconButton>
      <Alert severity='warning' className='mbe-5'>
        <AlertTitle>Warning!</AlertTitle>
        By editing the permission name, you might break the system permissions functionality. Please ensure you&#39;re
        absolutely certain before proceeding.
      </Alert>
      <div className='flex items-center gap-4 mbe-5'>
        <TextField
          fullWidth
          size='small'
          defaultValue={permissionName}
          variant='outlined'
          placeholder='Enter Permission Name'
          onChange={(e) => setPermissionName(e.target.value)}
        />
        <Button variant='contained' onClick={() => handleSummit(permissionName)}>
          Update
        </Button>
      </div>
      <FormControlLabel control={<Checkbox />} label='Set as core permission' />
    </DialogContent>
  )
}

const PermissionDialog = ({ open, setOpen, data, id }: PermissionDialogProps) => {
  const permissionStore = useSelector((state: { permissionReducer: PermissionRowType[] }) => state.permissionReducer)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { lang: locale } = useParams()
  const [loading, setLoading] = useState(false)


  const storedSchool = localStorage.getItem('school')
  const schoolDetails = storedSchool ? JSON.parse(storedSchool) : {}

  const handleClose = () => {
    setOpen(false)
  }

  const handleSummit = async (permissionName: string) => {
    const obj: PermissionRowType = {
      id: id ? id : permissionStore.length + 1,
      name: permissionName,
      createdDate: new Date().toLocaleDateString(),
      assignedTo: ['administrator']
    }

    if (id) {
      dispatch(updatePermission({ id: obj.id, data: obj }))
    } else {
      dispatch(addPermission(obj))

      const payload = {
        name: permissionName,
        gp: 'management',
        tenant_id: schoolDetails?.school?.tenant_id || '',
        school_id: schoolDetails?.school?.id || ''
      }

      try {
        setLoading(true)

        const response = await api.post('/permissions', payload)

        if (response.data?.status === true) {
          handleClose()

        } else {
          console.error('❌ Failed to create permission:', response.data)
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'API Error'
        toast.error(message ?? "something went wrong, please try again later.")
      }
      finally {
        setLoading(false)

      }
    }

    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} closeAfterTransition={false}>
      {loading && <Loader />}

      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {data ? 'Edit Permission' : 'Add New Permission'}
        <Typography component='span' className='flex flex-col text-center'>
          {data ? 'Edit permission as per your requirements.' : 'Permissions you may use and assign to your users.'}
        </Typography>
      </DialogTitle>
      {data ? (
        <EditContent handleClose={handleClose} data={data} handleSummit={handleSummit} />
      ) : (
        <AddContent handleClose={handleClose} handleSummit={handleSummit} />
      )}
    </Dialog>
  )
}

export default PermissionDialog
