'use client'

// React Imports
import { Fragment, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

type ConfirmationType = 'delete-account' | 'unsubscribe' | 'suspend-account' | 'delete-order' | 'delete-customer' | 'delete-user' | 'role-change' | 'delete-role'

type ConfirmationDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  type: ConfirmationType
  onConfirm: () => void;
  selectedDeleteStatus?: string | null;
}

const DeleteDialog = ({ open, setOpen, type, onConfirm, selectedDeleteStatus }: ConfirmationDialogProps) => {

  // Vars
  const Wrapper = type === 'suspend-account' ? 'div' : Fragment

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
          <Wrapper
            {...(type === 'suspend-account' && {
              className: 'flex flex-col items-center gap-2'
            })}
          >
            <Typography variant='h4'>
              {type === 'delete-user' && (
                selectedDeleteStatus === '1' ? (
                  <Typography variant='h4'>
                    Are you sure that you want to activate this user?
                  </Typography>
                ) : (
                  <Typography variant='h4'>
                    Are you sure that you want to delete this user?
                  </Typography>
                )
              )}
              {type === 'delete-account' && 'Are you sure you want to deactivate your account?'}
              {type === 'unsubscribe' && 'Are you sure to cancel your subscription?'}
              {type === 'suspend-account' && 'Are you sure?'}
              {type === 'delete-order' && 'Are you sure?'}
              {type === 'delete-customer' && 'Are you sure?'}
              {type === 'role-change' && 'Do you want to proceed with changing multiple user roles?'}
              {type === 'delete-role' && 'Are you sure to delete this role?'}
            </Typography>
            {type === 'suspend-account' && (
              <Typography color='text.primary'>You won&#39;t be able to revert user!</Typography>
            )}
            {type === 'delete-customer' && (
              <Typography color='text.primary'>You won&#39;t be able to revert customer!</Typography>
            )}
          </Wrapper>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={() => handleConfirmation(true)}>
            {type === 'suspend-account'
              ? 'Yes, Suspend User!'
              : type === 'delete-order'
                ? 'Yes, Delete!'
                : type === 'delete-customer'
                  ? 'Yes, Delete Customer!'
                  : 'Yes'}
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              handleConfirmation(false)
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DeleteDialog
