'use client'

// MUI Imports
import Button from '@mui/material/Button'

type ConfirmationButtonProps = {
  name: string
  onClick?: () => void
  disabled?: boolean
  type?: 'submit' | 'reset' | 'button'
}

const SaveButton = ({ name, onClick, type = 'button', disabled = false }: ConfirmationButtonProps) => {
  return (
    <div className='flex gap-4'>
      <Button 
        variant='contained'
        type={type}
        onClick={onClick} 
        disabled={disabled}
      >
        {name}
      </Button>
    </div>
  )
}

export default SaveButton
