'use client'

// React Imports
import { Fragment, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

type ConfirmationType = 'delete-account' | 'unsubscribe' | 'suspend-account' | 'delete-order' | 'delete-customer' | 'delete-user' | 'role-change' | 'microsoft-disconnect'

type ConfirmationDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  type: ConfirmationType
  onConfirm: () => void;
  setRoleName: React.Dispatch<React.SetStateAction<{ id: string | number; name: string }[]>>
  setSelectedUserIds: React.Dispatch<React.SetStateAction<number[]>>
}

const ConfirmDialog = ({ open, setOpen, type, onConfirm, setRoleName, setSelectedUserIds }: ConfirmationDialogProps) => {

  const handleConfirmation = async (value: boolean) => {
     if (value) {
      await onConfirm(); // ✅ Call API logic from parent component
    }
    setOpen(false)
  }

  return (
    <>
      <Dialog fullWidth maxWidth='xs' open={open} onClose={() => setOpen(false)} closeAfterTransition={false}>
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='ri-error-warning-line text-[88px] mbe-6 text-warning' />
            <Typography variant='h4'>
              {type === 'role-change' && 'Do you want to proceed with changing multiple user roles?'}
              {type === 'microsoft-disconnect' && 'Do you want to proceed with microsoft disconnect?'}
            </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={() => handleConfirmation(true)}>
            Yes
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              handleConfirmation(false)
              setRoleName && setRoleName([])
              setSelectedUserIds && setSelectedUserIds([])
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConfirmDialog
