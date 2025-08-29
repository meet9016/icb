'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Button,
  LinearProgress,
  Tooltip
} from '@mui/material'

import type { RoleType } from '@/types/apps/roleType'
import { api } from '@/utils/axiosInstance'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import { toast } from 'react-toastify'
import ReactTable from '@/comman/table/ReactTable'
import { createColumnHelper } from '@tanstack/react-table'
import { ColumnDef } from '@tanstack/table-core'

type CampaignDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  selectedChannel: string[]
  viewLogData: any
  setViewEmailLog: any
  viewNotificationLog: any

  totalRowsNotification: any
  paginationEmail: any
  setPaginationEmail: any

  totalRowsEmail: any
  paginationNotification: any
  setPaginationNotification: any

  totalRowsSms: any
  paginationSms: any
  setPaginationSms: any

  loaderEmailView: boolean
  loaderNotifiView?: boolean
  loaderSmsView?: boolean
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

interface UsersTypeWithAction {
  id: number | string
  name: string
  email: string
  status: string
  sent_time?: string
  sent_date?: string
  delivered_time?: string
  read_time?: string
  action?: string
  hours?: string
  full_name?: string
}
const columnHelper = createColumnHelper<UsersTypeWithAction>()

type StatusType = 'queued' | 'sending' | 'failed' | 'open'

type StatusInfo = {
  icon: string
  color: string
  label: string
}

const CampaignViewLogDialog = ({
  open = false,
  setOpen,
  selectedChannel = '',
  setViewEmailLog,
  setViewNotificationLog,
  viewLogData = [],
  viewNotificationLog = [],

  totalRowsEmail = 0,
  paginationEmail = {},
  setPaginationEmail = {},

  totalRowsNotification = 0,
  paginationNotification = {},
  setPaginationNotification = {},

  totalRowsSms = 0,
  paginationSms = {},
  setPaginationSms = {},

  loaderEmailView,
  loaderNotifiView,
  loaderSmsView
}: CampaignDialogProps) => {
  console.log('selectedChannel', selectedChannel)

  const [selectedCheckbox, setSelectedCheckbox] = useState<string[]>([])
  const [roleName, setRoleName] = useState<string>('')
  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState<boolean>(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [loading, setLoading] = useState(false)

  const storedSchool = localStorage.getItem('school')
  const schoolDetails = storedSchool ? JSON.parse(storedSchool) : {}

  const roleStore = useSelector((state: { roleReducer: RoleType[] }) => state.roleReducer)

  const router = useRouter()
  const { lang: locale } = useParams()

  // Hooks
  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(() => {
    if (selectedChannel === 'email') {
      return [
        // columnHelper.accessor('hours', {
        //   header: 'Name',
        //   cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        // }),
        columnHelper.accessor('email', {
          header: 'Email',
          cell: ({ row }) => <Typography>{row.original.email}</Typography>
        }),
        columnHelper.accessor('status', {
          header: 'Status',
          cell: ({ row }) => {
            const status = String(row.original.status || '').toLowerCase()

            const statusMap: Record<StatusType, StatusInfo> = {
              queued: { icon: 'ri-time-line', color: 'text-yellow-500', label: 'Queued' },
              sending: { icon: 'ri-send-plane-line', color: 'text-blue-500', label: 'Send' },
              failed: { icon: 'ri-close-circle-line', color: 'text-red-500', label: 'Failed' },
              open: { icon: 'ri-mail-open-line', color: 'text-green-500', label: 'Opened' }
            }

            const { icon, color, label } =
              status in statusMap
                ? statusMap[status as StatusType]
                : { icon: 'ri-question-line', color: 'text-gray-500', label: row.original.status || 'Unknown' }

            return (
              <div className='flex items-center gap-2'>
                <Tooltip title={row.original.status}>
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 ${color}`}>
                    <i className={`${icon} text-lg`} />
                  </span>
                </Tooltip>
              </div>
            )
          }
        }),
        columnHelper.accessor('sent_date', {
          header: 'SentDate',
          cell: ({ row }) => <Typography>{row.original.sent_date}</Typography>
        }),
        columnHelper.accessor('sent_time', {
          header: 'SentTime',
          cell: ({ row }) => <Typography>{row.original.sent_time}</Typography>
        }),
        columnHelper.accessor('delivered_time', {
          header: 'delivered Time'
          // cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('read_time', {
          header: 'Read Time'
          // cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        })
        // columnHelper.accessor('action', {
        //   header: 'Action',
        //   cell: ({ row }) => (
        //     <div className='flex items-center'>
        //       <>
        //         <Tooltip title='Delete'>
        //           <IconButton size='small'>
        //             <i className='ri-delete-bin-7-line text-red-600' />
        //           </IconButton>
        //         </Tooltip>
        //       </>
        //     </div>
        //   )
        // })
      ]
    } else if (selectedChannel === 'sms') {
      return [
        columnHelper.accessor('full_name', {
          header: 'Name',
          cell: ({ row }) => <Typography>{row.original.full_name}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Phone',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Message',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('sent_time', {
          header: 'SentTime',
          cell: ({ row }) => <Typography>{row.original.sent_time}</Typography>
        }),
        columnHelper.accessor('status', {
          header: 'Status',
          cell: ({ row }) => {
            const status = String(row.original.status || '').toLowerCase()

            const statusMap: Record<StatusType, StatusInfo> = {
              queued: { icon: 'ri-time-line', color: 'text-yellow-500', label: 'Queued' },
              sending: { icon: 'ri-send-plane-line', color: 'text-blue-500', label: 'Send' },
              failed: { icon: 'ri-close-circle-line', color: 'text-red-500', label: 'Failed' },
              open: { icon: 'ri-mail-open-line', color: 'text-green-500', label: 'Opened' }
            }

            const { icon, color, label } =
              status in statusMap
                ? statusMap[status as StatusType]
                : { icon: 'ri-question-line', color: 'text-gray-500', label: row.original.status || 'Unknown' }

            return (
              <div className='flex items-center gap-2'>
                <Tooltip title={row.original.status}>
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 ${color}`}>
                    <i className={`${icon} text-lg`} />
                  </span>
                </Tooltip>
              </div>
            )
          }
        }),
        columnHelper.accessor('hours', {
          header: 'delivered Time',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        })
      ]
    } else if (selectedChannel === 'push_notification') {
      return [
        columnHelper.accessor('full_name', {
          header: 'Name',
          cell: ({ row }) => <Typography>{row.original.full_name}</Typography>
        }),
        // columnHelper.accessor('hours', {
        //   header: 'Phone',
        //   cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        // }),
        columnHelper.accessor('hours', {
          header: 'Message',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('sent_time', {
          header: 'SentTime',
          cell: ({ row }) => <Typography>{row.original.sent_time}</Typography>
        }),
        columnHelper.accessor('status', {
          header: 'Status',
          cell: ({ row }) => {
            const status = String(row.original.status || '').toLowerCase()

            const statusMap: Record<StatusType, StatusInfo> = {
              queued: { icon: 'ri-time-line', color: 'text-yellow-500', label: 'Queued' },
              sending: { icon: 'ri-send-plane-line', color: 'text-blue-500', label: 'Sent' },
              failed: { icon: 'ri-close-circle-line', color: 'text-red-500', label: 'Failed' },
              open: { icon: 'ri-mail-open-line', color: 'text-green-500', label: 'Opened' }
            }

            const { icon, color, label } =
              status in statusMap
                ? statusMap[status as StatusType]
                : { icon: 'ri-question-line', color: 'text-gray-500', label: row.original.status || 'Unknown' }

            return (
              <div className='flex items-center gap-2'>
                <Tooltip title={row.original.status}>
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 ${color}`}>
                    <i className={`${icon} text-lg`} />
                  </span>
                </Tooltip>
              </div>
            )
          }
        }),
        columnHelper.accessor('hours', {
          header: 'delivered Time',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        })
      ]
    } else {
      return [
        columnHelper.accessor('hours', {
          header: 'Name',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Phone',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Message Preview',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Attachments',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'SentTime',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Status',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Read Time',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        }),
        columnHelper.accessor('hours', {
          header: 'Delivered Time',
          cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        })
      ]
    }
  }, [selectedChannel])

  useEffect(() => {
    const totalPermissions = defaultData.length * 3
    setIsIndeterminateCheckbox(selectedCheckbox.length > 0 && selectedCheckbox.length < totalPermissions)
  }, [selectedCheckbox])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (loading) return
      setLoading(true)
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
        toast.error('something went wrong, please try again later.')
      } else {
        setErrorState({ message: ['Something went wrong. Please try again.'] })
        toast.error('something went wrong, please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRoleName('')
    setSelectedCheckbox([])
    setIsIndeterminateCheckbox(false)
    setOpen(false)
    setViewEmailLog([])
    setViewNotificationLog([])
  }

  const channelMap: Record<string, string> = {
    wp: 'WhatsApp',
    push_notification: 'Push Notification',
    email: 'Email',
    sms: 'SMS'
  }

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      open={open}
      onClose={handleClose}
      sx={{ '& .MuiDialog-paper': { width: '100%', maxWidth: '1200px' } }}
    >
      {/* {loading && <Loader />} */}
      {(loaderEmailView || loaderNotifiView || loaderSmsView) && (
        <div className='absolute inset-0 flex items-center justify-center bg-white/60 z-50'>
          <div className='w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
        </div>
      )}
      <DialogTitle className='flex flex-col gap-1 text-center'>
        <span className='text-xl font-semibold'>Campaign Performance Logs ({channelMap[selectedChannel] || ''})</span>
        <hr className='my-2 border-t border-gray-300' />
        <div className='flex justify-center gap-4 text-sm'>
          <div className='flex items-center gap-1'>Status of delivery :</div>
          <div className='flex items-center gap-1 text-yellow-500'>
            <i className='ri-time-line' /> Queued
          </div>
          <div className='flex items-center gap-1 text-blue-500'>
            <i className='ri-send-plane-line' /> Send
          </div>
          <div className='flex items-center gap-1 text-red-500'>
            <i className='ri-close-circle-line' /> Failed
          </div>
          <div className='flex items-center gap-1 text-green-500'>
            <i className='ri-mail-open-line' /> Open
          </div>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible'>
          <IconButton onClick={handleClose} className='absolute top-4 right-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <div className='flex flex-col overflow-x-auto'>
            <ReactTable
              data={
                viewLogData?.data?.length > 0
                  ? viewLogData?.data
                  : viewNotificationLog?.data?.length > 0
                    ? viewNotificationLog?.data
                    : []
              }
              columns={columns}
              count={
                selectedChannel === 'email'
                  ? totalRowsEmail
                  : selectedChannel === 'push_notification'
                    ? totalRowsNotification
                    : totalRowsSms
              }
              page={
                selectedChannel === 'email'
                  ? paginationEmail.page
                  : selectedChannel === 'push_notification'
                    ? paginationNotification.page
                    : paginationSms.page
              }
              rowsPerPage={
                selectedChannel === 'email'
                  ? paginationEmail.perPage
                  : selectedChannel === 'push_notification'
                    ? paginationNotification.perPage
                    : paginationSms.perPage
              }
              onPageChange={(_, newPage) => {
                if (selectedChannel === 'email') {
                  setPaginationEmail((prev: any) => ({ ...prev, page: newPage }))
                } else if (selectedChannel === 'push_notification') {
                  setPaginationNotification((prev: any) => ({ ...prev, page: newPage }))
                } else {
                  setPaginationSms((prev: any) => ({ ...prev, page: newPage }))
                }
              }}
              onRowsPerPageChange={newSize => {
                if (selectedChannel === 'email') {
                  setPaginationEmail({ page: 0, perPage: newSize })
                } else if (selectedChannel === 'push_notification') {
                  setPaginationNotification({ page: 0, perPage: newSize })
                } else {
                  setPaginationSms({ page: 0, perPage: newSize })
                }
              }}
            />
          </div>
        </DialogContent>

        {/* <DialogActions className='justify-center py-6'>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions> */}
      </form>
    </Dialog>
  )
}

export default CampaignViewLogDialog
