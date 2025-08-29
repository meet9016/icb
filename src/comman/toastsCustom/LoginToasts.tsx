// MUI Imports
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { toast } from 'react-toastify'

const ToastsCustom = (name: string, message: string, avatar?: string) => {
  return toast(t => (
    <div className='is-full flex items-center justify-between'>
      <div className='flex items-center'>
        <Avatar alt={name} src={avatar || '/images/avatars/3.png'} className='mie-3 is-10 bs-10' />
        <div className='flex flex-col gap-0.5'>
          <Typography color='text.primary' className='font-medium'>
            {name}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {message}
          </Typography>
        </div>
      </div>
      <IconButton size='small' onClick={() => toast.dismiss(t.toastProps.toastId)}>
        <i className='ri-close-line text-xl text-textPrimary' />
      </IconButton>
    </div>
  ), {
    style: {
      minWidth: '300px'
    },
    closeButton: false
  })
}

export default ToastsCustom