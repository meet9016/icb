'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  TextField,
  Tooltip,
  TextFieldProps
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
import dayjs from 'dayjs'

type CampaignDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  selectedChannel: string[]
  viewLogData: any
  setViewEmailLog: any
  viewNotificationLog: any
  viewWhatsappLog: any
  viewSmsLog: any

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
  loaderWpView?: boolean
  loaderSmsView?: boolean

  totalRowsWhatsapp: any
  paginationWhatsapp: any
  setPaginationWhatsapp: any

  setGlobalFilter: any
  globalFilter: any
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
  sent_at?: string
  opened_at?: string
  scheduled_at?: string
  error_message?: string
  sid?: string
  phone?: string
  user_phone?: string
}
const columnHelper = createColumnHelper<UsersTypeWithAction>()

type StatusType = 'queued' | 'sending' | 'failed' | 'Opened'

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
  viewWhatsappLog = [],
  viewSmsLog = [],

  totalRowsEmail = 0,
  paginationEmail = {},
  setPaginationEmail = {},

  totalRowsNotification = 0,
  paginationNotification = {},
  setPaginationNotification = {},

  totalRowsSms = 0,
  paginationSms = {},
  setPaginationSms = {},

  totalRowsWhatsapp = 0,
  paginationWhatsapp = {},
  setPaginationWhatsapp = {},

  loaderEmailView,
  loaderNotifiView,
  loaderWpView,
  loaderSmsView
}: CampaignDialogProps) => {
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

  const DebouncedInput = ({
    value: initialValue,
    onEnter,
    debounce = 500,
    ...props
  }: {
    value: string | number
    onEnter: (value: string | number) => void
    debounce?: number
  } & Omit<TextFieldProps, 'onChange'>) => {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    // Debounce for empty value case
    useEffect(() => {
      if (String(value).trim() === '') {
        const timeout = setTimeout(() => {
          onEnter(value) // Call API when input cleared
        }, debounce)
        return () => clearTimeout(timeout)
      }
    }, [value, debounce, onEnter])

    return (
      <TextField
        {...props}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            onEnter(value) // Only run API call on Enter
          }
        }}
        size='small'
      />
    )
  }

  // Hooks
  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(() => {
    if (selectedChannel === 'email') {
      return [
        columnHelper.accessor('full_name', {
          header: 'Name',
          cell: ({ row }) => <Typography className='text-center'>{row.original.full_name}</Typography>
        }),
        columnHelper.accessor('email', {
          header: 'Email',
          cell: ({ row }) => <Typography className='text-center'>{row.original.email ?? '-'}</Typography>
        }),
        columnHelper.accessor('status', {
          header: 'Status',
          cell: ({ row }) => {
            const status = String(row.original.status || '').toLowerCase()

            const statusMap: Record<string, StatusInfo> = {
              queued: { icon: 'ri-time-line', color: 'text-yellow-500', label: 'Queued' },
              sent: { icon: 'ri-send-plane-line', color: 'text-blue-500', label: 'Send' },
              failed: { icon: 'ri-close-circle-line', color: 'text-red-500', label: 'Failed' },
              opened: { icon: 'ri-mail-open-line', color: 'text-green-500', label: 'Opened' }
            }

            const { icon, color, label } = status in statusMap ? statusMap[status] : '-'
            console.log('status', status)

            const tooltipTitle =
              status === 'failed'
                ? row.original.error_message || 'Failed'
                : status === 'queued'
                  ? 'In Queue'
                  : status === 'sending' || status === 'sent'
                    ? 'Sent'
                    : status === 'opened'
                    ? 'Open'
                    : row.original.status || 'Unknown'

            return (
              <div className='flex items-center gap-2 cursor-pointer justify-center'>
                <Tooltip title={tooltipTitle}>
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 ${color}`}>
                    <i className={`${icon} text-lg`} />
                  </span>
                </Tooltip>
              </div>
            )
          }
        }),
        columnHelper.accessor('scheduled_at', {
          header: 'Scheduled At',
          cell: ({ row }) => {
            const raw = row.original.scheduled_at
            const formatted = raw ? dayjs(raw).format('DD-MM-YYYY hh:mm A') : '-'
            return <Typography className='text-center'>{formatted}</Typography>
          }
        }),
        columnHelper.accessor('sent_at', {
          header: 'Sent At',
          cell: ({ row }) => {
            const raw = row.original.sent_at
            const formatted = raw ? dayjs(raw).format('DD-MM-YYYY hh:mm A') : '-'
            return <Typography className='text-center'>{formatted}</Typography>
          }
        }),
        // columnHelper.accessor('sent_time', {
        //   header: 'Delivered On',
        //   cell: ({ row }) => (
        //     <Typography>{row.original.sent_time ? row.original.sent_time.slice(0, 5) : '-'}</Typography>
        //   )
        // }),
        columnHelper.accessor('opened_at', {
          header: 'Open At',
          cell: ({ row }) => {
            const raw = row.original.opened_at
            const formatted = raw ? dayjs(raw).format('DD-MM-YYYY hh:mm A') : '-'
            return <Typography className='text-center'>{formatted}</Typography>
          }
        })
      ]
    } else if (selectedChannel === 'sms') {
      return [
        columnHelper.accessor('name', {
          header: 'Name',
          cell: ({ row }) => <Typography className='text-center'>{row.original.name ?? '-'}</Typography>
        }),
        columnHelper.accessor('user_phone', {
          header: 'phone',
          cell: ({ row }) => <Typography className='text-center'>{row.original.user_phone ?? '-'}</Typography>
        }),
        columnHelper.accessor('status', {
          header: 'Status',
          cell: ({ row }) => {
            const status = String(row.original.status || '').toLowerCase()

            const statusMap: Record<StatusType, StatusInfo> = {
              queued: { icon: 'ri-time-line', color: 'text-yellow-500', label: 'Queued' },
              sending: { icon: 'ri-send-plane-line', color: 'text-blue-500', label: 'Send' },
              failed: { icon: 'ri-close-circle-line', color: 'text-red-500', label: 'Failed' }
            }

            const { icon, color, label } = status in statusMap ? statusMap[status as StatusType] : '-'

            const tooltipTitle =
              status === 'failed'
                ? row.original.error_message || 'Failed'
                 : status === 'queued'
                  ? 'In Queue'
                : status === 'sending'
                  ? 'Sent'
                  : row.original.status || 'Unknown'

            return (
              <div className='flex items-center gap-2 cursor-pointer justify-center'>
                <Tooltip title={tooltipTitle}>
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 ${color}`}>
                    <i className={`${icon} text-lg`} />
                  </span>
                </Tooltip>
              </div>
            )
          }
        }),
        columnHelper.accessor('scheduled_at', {
          header: 'Scheduled At',
          cell: ({ row }) => {
            const raw = row.original.scheduled_at
            const formatted = raw ? dayjs(raw).format('DD-MM-YYYY hh:mm A') : '-'
            return <Typography className='text-center'>{formatted}</Typography>
          }
        }),
        columnHelper.accessor('sent_at', {
          header: 'Sent At',
          cell: ({ row }) => {
            const raw = row.original.sent_at
            const formatted = raw ? dayjs(raw).format('DD-MM-YYYY hh:mm A') : '-'
            return <Typography className='text-center'>{formatted}</Typography>
          }
        })
      ]
    } else if (selectedChannel === 'push_notification') {
      return [
        columnHelper.accessor('name', {
          header: 'Name',
          cell: ({ row }) => <Typography className='text-center'>{row.original.name ?? '-'}</Typography>
        }),
        columnHelper.accessor('user_phone', {
          header: 'phone',
          cell: ({ row }) => <Typography className='text-center'>{row.original.user_phone ?? '-'}</Typography>
        }),
        // columnHelper.accessor('user_phone', {
        //   header: 'Device Name',
        //   cell: ({ row }) => <Typography>{row.original.user_phone ?? '-'}</Typography>
        // }),
        columnHelper.accessor('status', {
          header: 'Status',
          cell: ({ row }) => {
            // main status info map
            const statusMap: Record<string, StatusInfo> = {
              queued: { icon: 'ri-time-line', color: 'text-yellow-500', label: 'Queued' },
              sending: { icon: 'ri-send-plane-line', color: 'text-blue-500', label: 'Send' },
              failed: { icon: 'ri-close-circle-line', color: 'text-red-500', label: 'Failed' }
            }

            const status = Number(row.original.status)
            const statusKeyMap: Record<number, keyof typeof statusMap> = {
              0: 'queued',
              1: 'sending',
              2: 'failed'
            }

            // get key from status number
            const statusKey = statusKeyMap[status]

            // pick values from statusMap safely
            // const { icon, color, label } = statusKey && statusMap[statusKey] ? statusMap[statusKey] : '-'

            const statusInfo: StatusInfo | undefined =
              statusKey && statusMap[statusKey] ? statusMap[statusKey] : undefined

            const { icon, color, label } = statusInfo || { icon: null, color: 'default', label: '-' }

            const tooltipTitle =
              status === 'failed'
                ? row.original.error_message || 'Failed'
                 : status == 0
                  ? 'In Queue'
                : status == 1
                  ? 'Sent'
                  : statusKey || 'Unknown'

            return (
              <div className='flex items-center gap-2 cursor-pointer justify-center'>
                <Tooltip title={tooltipTitle}>
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 ${color}`}>
                    <i className={`${icon} text-lg`} />
                  </span>
                </Tooltip>
              </div>
            )
          }
        }),
        columnHelper.accessor('scheduled_at', {
          header: 'Scheduled At',
          cell: ({ row }) => {
            const raw = row.original.scheduled_at
            const formatted = raw ? dayjs(raw).format('DD-MM-YYYY hh:mm A') : '-'
            return <Typography className='text-center'>{formatted}</Typography>
          }
        }),
        columnHelper.accessor('sent_at', {
          header: 'Sent At',
          cell: ({ row }) => {
            const raw = row.original.sent_at
            const formatted = raw ? dayjs(raw).format('DD-MM-YYYY hh:mm A') : '-'
            return <Typography className='text-center'>{formatted}</Typography>
          }
        })
        // columnHelper.accessor('hours', {
        //   header: 'Delivered At',
        //   cell: ({ row }) => <Typography>{row.original.hours ?? '-'}</Typography>
        // }),
        // columnHelper.accessor('hours', {
        //   header: 'Opened at',
        //   cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        // })
      ]
    } else {
      return [
        columnHelper.accessor('full_name', {
          header: 'Name',
          cell: ({ row }) => <Typography className='text-center'>{row.original.full_name}</Typography>
        }),
        columnHelper.accessor('phone', {
          header: 'Phone',
          cell: ({ row }) => <Typography className='text-center'>{row.original.phone ?? '-'}</Typography>
        }),
        columnHelper.accessor('status', {
          header: 'Status',
          cell: ({ row }) => {
            const status = String(row.original.status || '').toLowerCase()

            const statusMap: Record<StatusType, StatusInfo> = {
              queued: { icon: 'ri-time-line', color: 'text-yellow-500', label: 'Queued' },
              sending: { icon: 'ri-send-plane-line', color: 'text-blue-500', label: 'Send' },
              failed: { icon: 'ri-close-circle-line', color: 'text-red-500', label: 'Failed' }
            }

            const { icon, color, label } =
              status in statusMap
                ? statusMap[status as StatusType]
                : { icon: 'ri-question-line', color: 'text-gray-500', label: row.original.status || 'Unknown' }

            const tooltipTitle =
              status === 'failed'
                ? row.original.error_message || 'Failed'
                 : status === 'queued'
                  ? 'In Queue'
                : status === 'sending' || 'send'
                  ? 'Sent'
                  : row.original.status || 'Unknown'

            return (
              <div className='flex items-center gap-2 cursor-pointer justify-center'>
                <Tooltip title={tooltipTitle}>
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 ${color}`}>
                    <i className={`${icon} text-lg`} />
                  </span>
                </Tooltip>
              </div>
            )
          }
        }),
        columnHelper.accessor('scheduled_at', {
          header: 'Scheduled At',
          // cell: ({ row }) => <Typography>{row.original.scheduled_at ?? '-'}</Typography>
          cell: ({ row }) => {
            const raw = row.original.scheduled_at
            const formatted = raw ? dayjs(raw).format('DD-MM-YYYY hh:mm A') : '-'
            return <Typography className='text-center'>{formatted}</Typography>
          }
        }),
        columnHelper.accessor('sent_at', {
          header: 'Sent At',
          cell: ({ row }) => {
            const raw = row.original.sent_at
            const formatted = raw ? dayjs(raw).format('DD-MM-YYYY hh:mm A') : '-'
            return <Typography className='text-center'>{formatted}</Typography>
          }
        })

        // columnHelper.accessor('hours', {
        //   header: 'Delivered At',
        //   cell: ({ row }) => <Typography>{row.original.hours ?? '-'}</Typography>
        // }),
        // columnHelper.accessor('hours', {
        //   header: 'Read At',
        //   cell: ({ row }) => <Typography>{row.original.hours}</Typography>
        // })
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

  const channelConfig = {
    email: {
      data: viewLogData?.data ?? [],
      count: viewLogData?.total ?? totalRowsEmail ?? 0,
      pagination: paginationEmail,
      setPagination: setPaginationEmail
    },
    push_notification: {
      data: viewNotificationLog?.data ?? [],
      count: viewNotificationLog?.total ?? totalRowsNotification ?? 0,
      pagination: paginationNotification,
      setPagination: setPaginationNotification
    },
    wp: {
      data: viewWhatsappLog?.data ?? [],
      count: viewWhatsappLog?.total ?? 0,
      pagination: paginationWhatsapp,
      setPagination: setPaginationWhatsapp
    },
    sms: {
      data: viewSmsLog?.data ?? [],
      count: viewSmsLog?.total ?? totalRowsSms ?? 0,
      pagination: paginationSms,
      setPagination: setPaginationSms
    }
  } as const

  const { data, count, pagination, setPagination } =
    channelConfig[selectedChannel as keyof typeof channelConfig] ?? channelConfig.email

  // Optional: reset page to 0 whenever channel changes
  useEffect(() => {
    setPagination((prev: any) => ({ ...prev, page: 0 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannel])

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
      {(loaderEmailView || loaderNotifiView || loaderSmsView || loaderWpView) && (
        <div className='absolute inset-0 flex items-center justify-center bg-white/60 z-50'>
          <div className='w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
        </div>
      )}
      <DialogTitle className='flex flex-col gap-1 text-center !pb-0'>
        <span className='text-xl font-semibold'>Campaign Performance Logs ({channelMap[selectedChannel] || ''})</span>
        <hr className='my-2 border-t border-gray-300' />

        {/* ✅ One-line status legend */}
        <div className='flex justify-center items-center gap-6 text-sm flex-wrap'>
          <div className='flex items-center gap-1 text-yellow-500'>
            <i className='ri-time-line' /> Queued
          </div>
          <div className='flex items-center gap-1 text-blue-500'>
            <i className='ri-send-plane-line' /> Send
          </div>
          <div className='flex items-center gap-1 text-red-500'>
            <i className='ri-close-circle-line' /> Failed
          </div>
          {selectedChannel === 'email' && (
            <div className='flex items-center gap-1 text-green-500'>
              <i className='ri-mail-open-line' /> Open
            </div>
          )}
        </div>

        <div className='flex flex-col !items-start max-sm:w-full sm:flex-row sm:items-center gap-4'>
          {/* Search inputs commented */}
        </div>

        {/* ✅ Professional Note */}
        <div className='w-full bg-gray-100 border border-gray-300 text-gray-700 text-xs px-3 py-2 rounded-md text-left mt-2'>
          <strong className='text-gray-800'>Note:</strong> Hover over the status in the table to view detailed
          information (e.g. sent successfully, or failure reason).
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-auto'>
          <IconButton onClick={handleClose} className='absolute top-4 right-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <div className='flex flex-col overflow-x-auto'>
            <ReactTable
              key={`${selectedChannel}-${pagination.perPage}`} // force internal reset on channel/size change
              data={data}
              columns={columns}
              count={count ?? 0}
              page={pagination.page ?? 0} // ensure 0-based for UI
              rowsPerPage={pagination.perPage ?? 20}
              onPageChange={(_, newPage) => {
                setPagination((prev: any) => ({ ...prev, page: newPage }))
              }}
              onRowsPerPageChange={newSize => {
                setPagination({ page: 0, perPage: newSize })
              }}
              tableContainerClassName='max-h-[400px] overflow-y-auto'
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
