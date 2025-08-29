'use client'

// MUI Imports
import Button from '@mui/material/Button'

type ConfirmationButtonProps = {
  name: string
  onClick?: () => void;
}

const CancelButtons = ({name, onClick }: ConfirmationButtonProps) => {
  return (
    <div className='flex gap-4'>
      <Button variant='outlined' color='secondary' onClick={onClick}>
        {name}
      </Button>
    </div>
  )
}

export default CancelButtons