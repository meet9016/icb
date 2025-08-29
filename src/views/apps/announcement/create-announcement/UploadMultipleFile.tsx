'use client'

// React Imports
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'

// Third-party Imports
import { useDropzone } from 'react-dropzone'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import endPointApi from '@/utils/endPointApi'
import { api } from '@/utils/axiosInstance'
import { toast } from 'react-toastify'
import { getShortFileName } from '../../chat/utils'

export type FileProp = {
  id?: number // existing files will have ID
  name: string
  type: string
  size: number
  file?: File // for new uploads
  file_url?: string
  preview?: string
  file_path: string
}

interface UploadMultipleFileProps {
  files: FileProp[]
  setFiles: React.Dispatch<React.SetStateAction<FileProp[]>>
}
// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)<BoxProps>(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(7),
    border: `2px solid ${theme.palette.divider}`, // ✅ solid border instead of dashed
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper, // optional for white bg
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(1)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

const UploadMultipleFile: React.FC<UploadMultipleFileProps> = ({ files, setFiles }) => {
  // Hooks

  const MAX_TOTAL_FILES = 5
  const MAX_TOTAL_SIZE_MB = 20

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const currentFiles = Array.isArray(files) ? [...files] : []

      // Combine new + existing
      const totalFiles = [...currentFiles, ...acceptedFiles]

      if (totalFiles.length > MAX_TOTAL_FILES) {
        toast.error(`Maximum ${MAX_TOTAL_FILES} files allowed.`)
        return
      }

      const totalSizeBytes = totalFiles.reduce((acc, file) => acc + file.size, 0)
      const maxBytes = MAX_TOTAL_SIZE_MB * 1024 * 1024

      // if (totalSizeBytes > maxBytes) {
      //   toast.error(`Total file size should not exceed ${MAX_TOTAL_SIZE_MB} MB.`);
      //   return;
      // }

      const newFiles: FileProp[] = acceptedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
        file_path: '',
        file_url: URL.createObjectURL(file),
        preview: URL.createObjectURL(file)
      }))

      setFiles([...currentFiles, ...newFiles])
    },
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'video/mp4': ['.mp4'],
      'audio/mpeg': ['.mp3'],
      'application/pdf': ['.pdf']
    }
  })

  const renderFilePreview = (file: FileProp | any) => {
    const isImage =
      file?.type?.startsWith('image') ||
      file?.file_type?.startsWith('image') ||
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file?.file_path || '')

    if (isImage) {
      let src = ''

      if (file?.preview) {
        src = file.preview
      } else if (file?.file?.preview) {
        src = file.file.preview
      } else if (file?.file_path?.startsWith('http')) {
        src = file.file_path
      } else {
        src = file?.file_url || ''
      }

      return <img width={38} height={38} alt={file.name || 'file'} src={src} onLoad={() => URL.revokeObjectURL(src)} />
    }

    return <i className='ri-file-text-line' />
  }

  const handleRemoveFile = (fileToRemove: FileProp) => {
    if (fileToRemove.id) {
      api.delete(`${endPointApi.deleteImageAnnouncements}/${fileToRemove.id}`).then(response => {
        if (response.data.status === 200) {
          toast.success('File deleted successfully!')
        }
      })
    }

    setFiles(prevFiles =>
      prevFiles.filter(file => (file.id ? file.id !== fileToRemove.id : file.name !== fileToRemove.name))
    )
  }

  const fileList = files?.map((file: FileProp) => (
    <ListItem key={file.name} className='pis-4 plb-3'>
      <div className='file-details'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div>
          <Typography className='file-name font-medium' color='text.primary'>
            {getShortFileName(file.name || file.file_path?.split('/').pop() || '')}
          </Typography>
          {/* <Typography className='file-size' variant='body2'>
            {file.size
                ? Math.round(file.size / 100) / 10 > 1000
                ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
                : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`
                : file.file_type?.toUpperCase()}
            </Typography> */}
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <i className='ri-delete-bin-6-line text-xl' />
      </IconButton>
    </ListItem>
  ))

  return (
    <Dropzone>
      <Card className="shadow-none border border-gray-100">
        {' '}
        {/* Removes shadow */}
        <CardContent>
          {' '}
          {/* Removes padding */}
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <div className='flex items-center flex-col gap-2 text-center'>
              <CustomAvatar variant='rounded' skin='light' color='secondary'>
                <i className='ri-upload-2-line' />
              </CustomAvatar>
              <Typography variant='h4'>Drag and Drop Your items.</Typography>
              <Typography color='text.disabled'>accepted png,jpg,jpeg,mp4,pdf</Typography>
              <Button variant='outlined' size='small'>
                Browse Image
              </Button>
            </div>
          </div>
          {files?.length ? (
            <>
              <List sx={{ maxHeight: 375, overflowY: 'auto' }}>{fileList}</List>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

export default UploadMultipleFile
