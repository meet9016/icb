'use client'
import '@tanstack/table-core'
// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'

import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { api } from '@/utils/axiosInstance'
import { Button, Typography, Skeleton, Tooltip, CardContent, TextField, TextFieldProps, Box, Grid } from '@mui/material'
import endPointApi from '@/utils/endPointApi'
import ReactTable from '@/comman/table/ReactTable'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Locale } from '@/configs/i18n'
import { toast } from 'react-toastify'
import { useSettings } from '@/@core/hooks/useSettings'
import CampaignViewLogDialog from '@/components/dialogs/campaign-view-log'
import CustomAvatar from '@/@core/components/mui/Avatar'
import dayjs from 'dayjs'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface UsersTypeWithAction {
  id: number | string
  action?: string
  note?: string
  campaign_status_name?: string
  channel_name?: string
  frequency_type_name?: string
  campaign_date?: string
  campaign_time?: string
  formatted_campaign_time?: string
  frequency_count?: number
  schedule_name?: 'now' | 'schedule'
  publish_mode_name?: 'one_time' | 'recurring'
}
type DataType = {
  title: string
  value: string
  color: string
  iconClass: string
  bg: string
}
type EmailLogType = {
  title: string
  value: string
  color: string
  iconClass: string
  bg: string
}

const fackeddata: DataType[] = [
  {
    title: 'Whatsapp',
    value: '1,250',
    color: '#25D366',
    iconClass: '<i class="ri-whatsapp-line"></i>',
    bg: '#E8F5E9'
  },
  {
    title: 'Sms',
    value: '60',
    color: '#DB2777',
    iconClass: '<i class="ri-message-2-line"></i>',
    bg: '#FCE7F3'
  },
  {
    title: 'Email',
    value: '82',
    color: '#4338CA',
    iconClass: '<i class="ri-mail-line"></i>',
    bg: '#E0E7FF'
  },
  {
    title: 'Notification',
    value: '14',
    color: '#CA8A04',
    iconClass: '<i class="ri-notification-3-line"></i>',
    bg: '#FEF9C3'
  }
]

// Column Definitions
const columnHelper = createColumnHelper<UsersTypeWithAction>()

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const CampaignListPage = ({ tableData }: { tableData?: UsersType[] }) => {
  const permissions = useSelector((state: RootState) => state.sidebarPermission)
  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const searchParams = useSearchParams()
  const ids = atob(decodeURIComponent(searchParams.get('campaignId') || ''))

  const [data, setData] = useState<UsersType[]>([])
  const [loaderMain, setloaderMain] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [paginationInfo, setPaginationInfo] = useState({
    page: 0,
    perPage: 10
  })

  // Email
  const [paginationEmail, setPaginationEmail] = useState({ page: 0, perPage: 10 })
  const [totalRowsEmail, setTotalRowsEmail] = useState(0)

  // Notification
  const [paginationNotification, setPaginationNotification] = useState({ page: 0, perPage: 10 })
  const [totalRowsNotification, setTotalRowsNotification] = useState(0)

  // Whatsapp
  const [paginationWhatsapp, setPaginationWhatsapp] = useState({ page: 0, perPage: 10 })
  const [totalRowWhatsapp, setTotalRowsWhatsapp] = useState(0)

  // Sms
  const [paginationSms, setPaginationSms] = useState({ page: 0, perPage: 10 })
  const [totalRowsSms, setTotalRowsSms] = useState(0)

  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [channelName, setChannelName] = useState('')
  const [viewLogId, setViewLogId] = useState('')
  const [channelCounts, setChannelCounts] = useState<DataType[]>([])

  const [viewEmailLog, setViewEmailLog] = useState<EmailLogType[]>([])
  const [viewNotificationLog, setViewNotificationLog] = useState<EmailLogType[]>([])
  const [viewWhatsappLog, setViewWhatsappLog] = useState<EmailLogType[]>([])
  const [viewSmsLog, setViewSmsLog] = useState<EmailLogType[]>([])

  const [loaderEmailView, setLoaderEmailView] = useState(false)
  const [loaderNotifiView, setLoaderNotifiView] = useState(false)
  const [loaderSmsView, setLoaderSmsView] = useState(false)
  const [loaderWpView, setLoaderWpView] = useState(false)

  const [globalFilterLog, setGlobalFilterLog] = useState('')

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor('note', {
        header: 'Title',
        // cell: ({ row }) => <Typography>{row.original.note}</Typography>
        cell: ({ row }) => {
          const htmlToText = (html: string): string => {
            const temp = document.createElement('div')
            temp.innerHTML = html
            return temp.textContent || temp.innerText || ''
          }

          const text = htmlToText(row.original.note || '')
          const truncated = text.length > 25 ? `${text.slice(0, 25)}...` : text

          return (
            <Tooltip title={text} arrow placement='bottom-start'>
              <Typography noWrap>{truncated}</Typography>
            </Tooltip>
          )
        }
      }),
      columnHelper.accessor('campaign_status_name', {
        header: 'Campaign Status',
        cell: ({ row }) => {
          const status = row.original.campaign_status_name

          const statusDisplay: Record<
            string,
            {
              icon: string
              colorClass: string
              animate?: boolean
              label: string
            }
          > = {
            Stopped: {
              icon: 'ri-close-circle-line',
              colorClass: 'text-red-600',
              label: 'Stopped'
            },
            'In Progress': {
              icon: 'ri-loader-4-line',
              colorClass: 'text-blue-600',
              animate: true,
              label: 'In Progress'
            },
            Completed: {
              icon: 'ri-check-line',
              colorClass: 'text-green-600',
              label: 'Completed'
            },
            Done: {
              icon: 'ri-check-line',
              colorClass: 'text-green-600',
              label: 'Done'
            }
          }

          const display =
            status && statusDisplay[status]
              ? statusDisplay[status]
              : {
                  icon: '',
                  colorClass: '',
                  label: status || 'Unknown'
                }
          return (
            <div className='flex items-center gap-2'>
              <i className={`${display.icon} ${display.colorClass} ${display.animate ? 'animate-spin' : ''}`} />
              <Typography>{display.label}</Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('channel_name', {
        header: 'channel',
        cell: ({ row }) => <Typography>{row.original.channel_name}</Typography>
      }),
      columnHelper.accessor('frequency_type_name', {
        header: 'frequency Type',
        cell: ({ row }) => <Typography>{row.original.frequency_type_name}</Typography>
      }),
      columnHelper.accessor('campaign_date', {
        header: 'campaign date',
        cell: ({ row }) => {
          const raw = row.original.campaign_date
          const d = raw ? dayjs(raw) : null
          const formatted = d && d.isValid() ? d.format('DD-MM-YYYY') : '-'
          return <Typography>{formatted}</Typography>
        }
      }),
      columnHelper.accessor('campaign_time', {
        header: 'campaign time',
        // cell: ({ row }) => <Typography>{row.original.campaign_time}</Typography>
        cell: ({ row }) => {
          const raw = row.original.campaign_time
          const formatted = raw
            ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(
                new Date(`1970-01-01T${raw}`)
              )
            : '-'
          return <Typography>{formatted}</Typography>
        }
      }),
      columnHelper.accessor('frequency_count', {
        header: 'Repeat',
        cell: ({ row }) => <Typography>{row.original.frequency_count}</Typography>
      }),
      columnHelper.accessor('schedule_name', {
        header: 'schedule',
        cell: ({ row }) => <Typography>{row.original.schedule_name}</Typography>
      }),
      columnHelper.accessor('publish_mode_name', {
        header: 'publish mode',
        cell: ({ row }) => <Typography>{row.original.publish_mode_name}</Typography>
      }),

      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <>
              <Tooltip title='Edit'>
                <IconButton
                  size='small'
                  disabled={row.original.campaign_status_name === 'Done'}
                  onClick={() =>
                    router.push(
                      `${getLocalizedUrl('/apps/announcement/add-campaign', locale as Locale)}?id=${encodeURIComponent(btoa(String(row.original.id)))}`
                    )
                  }
                >
                  <i className='ri-pencil-line' style={{ color: 'green' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title='View Log'>
                <IconButton
                  size='small'
                  onClick={() => {
                    setOpenDialog(true)
                    setChannelName(row.original.channels)
                    setViewLogId(row.original.id as string)
                  }}
                >
                  <i className='ri-eye-line' style={{ color: '' }} />
                </IconButton>
              </Tooltip>
              {/* <Tooltip title='Delete'>
                <IconButton size='small' onClick={() => handleDeleteClick(Number(row.original.id))}>
                  <i className='ri-delete-bin-7-line text-red-600' />
                </IconButton>
              </Tooltip> */}
            </>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false
      })
    ],
    [data, permissions]
  )

  const fetchUsers = async () => {
    setloaderMain(true)
    try {
      const res = await api.get(`${endPointApi.getCampaignAnnounceWise}`, {
        params: {
          announcement_id: ids,
          search: globalFilter,
          per_page: paginationInfo.perPage.toString(),
          page: (paginationInfo.page + 1).toString()
        }
      })

      setTotalRows(res.data.data.total)
      setData(res.data.data.data)
      setloaderMain(false)
    } catch (err: any) {
      setloaderMain(false)
      if (err.response?.status === 500) {
        toast.error('Internal Server Error.')
      } else {
        toast.error(err?.response?.data?.message || 'Something went wrong')
      }
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [paginationInfo.page, paginationInfo.perPage, globalFilter])

  const getCampaignCount = async () => {
    try {
      const res = await api.get(`${endPointApi.getcampaignCount}`, {
        params: {
          announcement_id: ids
        }
      })

      const response = res.data // real response

      const updatedData: DataType[] = [
        {
          title: 'WhatsApp',
          value: response.cp_wp?.toString() || '0',
          color: '#25D366',
          iconClass: '<i class="ri-whatsapp-line"></i>',
          bg: '#E8F5E9'
        },
        {
          title: 'SMS',
          value: response.cp_sms?.toString() || '0',
          color: '#DB2777',
          iconClass: '<i class="ri-message-2-line"></i>',
          bg: '#FCE7F3'
        },
        {
          title: 'Email',
          value: response.cp_email?.toString() || '0',
          color: '#4338CA',
          iconClass: '<i class="ri-mail-line"></i>',
          bg: '#E0E7FF'
        },
        {
          title: 'Mobile App Notification',
          value: response.cp_push_noti?.toString() || '0',
          color: '#CA8A04',
          iconClass: '<i class="ri-notification-3-line"></i>',
          bg: '#FEF9C3'
        }
      ]

      setChannelCounts(updatedData)
    } catch (err: any) {
      if (err.response?.status === 500) {
        toast.error('Internal Server Error.')
      } else {
        toast.error(err?.response?.data?.message || 'Something went wrong')
      }
    }
  }

  useEffect(() => {
    getCampaignCount()
  }, [ids])

  const getViewLog = async () => {
    if (channelName === 'email') {
      setLoaderEmailView(true)
      const formdata = new FormData()

      formdata.append('announcement_id', ids || '')
      formdata.append('campaign_id', viewLogId)
      formdata.append('search', globalFilterLog)
      formdata.append('per_page', paginationEmail.perPage.toString())
      formdata.append('page', (paginationEmail.page + 1).toString())
      try {
        const res = await api.post(`${endPointApi.postCampaignEmailLogGet}`, formdata)
        setViewEmailLog(res.data)
        setTotalRowsEmail(res.data.total)
        setLoaderEmailView(false)
      } catch (err: any) {
        if (err.response?.status === 500) {
          toast.error('Internal Server Error.')
          setLoaderEmailView(false)
        } else {
          toast.error(err?.response?.data?.message || 'Something went wrong')
          setLoaderEmailView(false)
        }
      }
    }
  }

  useEffect(() => {
    if (openDialog) {
      getViewLog()
    }
  }, [viewLogId, openDialog, paginationEmail.page, paginationEmail.perPage, globalFilterLog])

  const getNotificationViewLog = async () => {
    if (channelName === 'push_notification') {
      setLoaderNotifiView(true)
      const formdata = new FormData()

      formdata.append('announcement_id', ids || '')
      formdata.append('campaign_id', viewLogId)
      formdata.append('search', globalFilterLog)
      formdata.append('per_page', paginationNotification.perPage.toString())
      formdata.append('page', (paginationNotification.page + 1).toString())
      try {
        const res = await api.post(`${endPointApi.postCampaignPushNotificationslogGet}`, formdata)

        setViewNotificationLog(res.data)
        setTotalRowsNotification(res.data.total)
        setLoaderNotifiView(false)
      } catch (err: any) {
        if (err.response?.status === 500) {
          toast.error('Internal Server Error.')
          setLoaderNotifiView(false)
        } else {
          toast.error(err?.response?.data?.message || 'Something went wrong')
          setLoaderNotifiView(false)
        }
      }
    }
  }

  useEffect(() => {
    if (openDialog) {
      getNotificationViewLog()
    }
  }, [viewLogId, openDialog, paginationNotification.page, paginationNotification.perPage, globalFilterLog])

  const getWhatsappViewLog = async () => {
    if (channelName === 'wp') {
      setLoaderWpView(true)
      const formdata = new FormData()

      formdata.append('announcement_id', ids || '')
      formdata.append('campaign_id', viewLogId)
      formdata.append('search', globalFilterLog)
      formdata.append('per_page', paginationWhatsapp.perPage.toString())
      formdata.append('page', (paginationWhatsapp.page + 1).toString())
      try {
        const res = await api.post(`${endPointApi.postcampaignWhatsappLogGet}`, formdata)

        setViewWhatsappLog(res.data)
        setTotalRowsWhatsapp(res.data.total)
        setLoaderWpView(false)
      } catch (err: any) {
        if (err.response?.status === 500) {
          toast.error('Internal Server Error.')
          setLoaderWpView(false)
        } else {
          toast.error(err?.response?.data?.message || 'Something went wrong')
          setLoaderWpView(false)
        }
      }
    }
  }

  useEffect(() => {
    if (openDialog) {
      getWhatsappViewLog()
    }
  }, [viewLogId, openDialog, paginationWhatsapp.page, paginationWhatsapp.perPage, globalFilterLog])
  const getSmsViewLog = async () => {
    if (channelName === 'sms') {
      setLoaderSmsView(true)
      const formdata = new FormData()

      formdata.append('announcement_id', ids || '')
      formdata.append('campaign_id', viewLogId)
      formdata.append('search', globalFilterLog)
      formdata.append('per_page', paginationSms.perPage.toString())
      formdata.append('page', (paginationSms.page + 1).toString())
      try {
        const res = await api.post(`${endPointApi.postcampaignSmsLogGet}`, formdata)

        setViewSmsLog(res.data)
        setTotalRowsSms(res.data.total)
        setLoaderSmsView(false)
      } catch (err: any) {
        if (err.response?.status === 500) {
          toast.error('Internal Server Error.')
          setLoaderSmsView(false)
        } else {
          toast.error(err?.response?.data?.message || 'Something went wrong')
          setLoaderSmsView(false)
        }
      }
    }
  }

  useEffect(() => {
    if (openDialog) {
      getSmsViewLog()
    }
  }, [viewLogId, openDialog, paginationSms.page, paginationSms.perPage, globalFilterLog])

  const [expanded, setExpanded] = useState(false)

  const description =
    'Notify users about Diwali special discounts. Notify users about Diwali special discounts. Notify users about Diwali special discounts. Notify users about Diwali special discounts. Notify users about Diwali special discounts. Notify users about Diwali special discounts. Notify users about Diwali special discounts. Notify users about Diwali special discounts.'

  const shortDescription = description.length > 70 ? description.slice(0, 70) + '...' : description
  return (
    <>
      <p style={{ color: settings.primaryColor }} className='font-bold flex items-center gap-2 mb-6'>
        <span
          className='inline-flex items-center justify-center border border-gray-400 rounded-md p-2 cursor-pointer'
          onClick={() => router.replace(getLocalizedUrl('/apps/announcement', locale as Locale))}
        >
          <i className='ri-arrow-go-back-line text-lg'></i>
        </span>
        Announcement / Campaign
      </p>

      <Grid container spacing={6} className='mb-6'>
        {channelCounts.map((item, i) => (
          <Grid key={i} item xs={12} sm={6} md={3}>
            <Card>
              <CardContent className='flex flex-wrap items-center gap-4'>
                <CustomAvatar variant='rounded'>
                  {/* <i className={item.iconClass} /> */}
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      backgroundColor: item.bg,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      boxShadow: 2,
                      mb: 0
                    }}
                    dangerouslySetInnerHTML={{ __html: item.iconClass }}
                  />
                </CustomAvatar>

                <div className='flex flex-col'>
                  <div className='flex items-center gap-2'>
                    <Typography variant='h5'>{item.value}</Typography>
                  </div>
                  <Typography>{item.title}</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <div className='bg-white shadow rounded-lg p-4 mb-4'>
        <h2 className='text-xl font-semibold mb-2'>Announcement Detail</h2>
        <div className='flex flex-wrap gap-6 text-sm text-gray-600'>
          <div>
            <span className='font-medium text-gray-800'>Announcement Title: </span>
            Testing
          </div>
          <div>
            <span className='font-medium text-gray-800'>Announcement Status: </span>
            In Progress
          </div>
          <div>
            <span className='font-medium text-gray-800'>Location: </span>
            India
          </div>
          <div>
            <span className='font-medium text-gray-800'>Description: </span>
            {expanded ? description : shortDescription}
            {description.length > 100 && (
              <button className='text-blue-600 ml-1 hover:underline cursor-pointer' onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      </div>
      <Card>
        {/* <CardHeader title='Filters' className='pbe-4' /> */}
        <Divider />

        <CardContent className='flex justify-between flex-col items-start sm:flex-row sm:items-center max-sm:gap-4'>
          {loading ? (
            <>
              <Skeleton variant='rectangular' height={40} width={200} className='rounded-md' />
              <Skeleton variant='rectangular' height={40} width={200} className='rounded-md' />
            </>
          ) : (
            <>
              <div className='flex flex-col !items-start max-sm:w-full sm:flex-row sm:items-center gap-4'>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  className='max-sm:w-full min-w-[220px]'
                  onChange={value => setGlobalFilter(String(value))}
                  placeholder='Search Campaign...'
                />
              </div>

              <Button
                variant='contained'
                onClick={() => {
                  router.replace(getLocalizedUrl('/apps/announcement/add-campaign', locale as Locale))
                }}
                className='w-full sm:w-auto'
                startIcon={<i className='ri-add-line' />}
              >
                Add Campaign
              </Button>
            </>
          )}
        </CardContent>

        {loaderMain ? (
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  {[...Array(8)].map((_, index) => (
                    <th key={index}>
                      <Skeleton variant='text' height={50} width={100} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {[...Array(8)].map((_, colIndex) => (
                      <td key={colIndex}>
                        <Skeleton variant='text' height={50} width='100%' />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Your real table goes here when loading = false
          <div className='overflow-x-auto'>
            <ReactTable
              data={data}
              columns={columns}
              count={totalRows}
              page={paginationInfo.page}
              rowsPerPage={paginationInfo.perPage}
              onPageChange={(_, newPage) => setPaginationInfo(prev => ({ ...prev, page: newPage }))}
              onRowsPerPageChange={newSize => setPaginationInfo({ page: 0, perPage: newSize })}
            />
            {/* <AgGridTable data={data} columnDefs={columnDefs}/> */}
          </div>
        )}
      </Card>
      {openDialog && (
        <CampaignViewLogDialog
          open={openDialog}
          setOpen={setOpenDialog}
          selectedChannel={channelName}
          setPaginationEmail={setPaginationEmail}
          setPaginationNotification={setPaginationNotification}
          setPaginationWhatsapp={setPaginationWhatsapp}
          setPaginationSms={setPaginationSms}
          paginationEmail={paginationEmail}
          paginationNotification={paginationNotification}
          paginationWhatsapp={paginationWhatsapp}
          paginationSms={paginationSms}
          loaderEmailView={loaderEmailView}
          loaderNotifiView={loaderNotifiView}
          loaderWpView={loaderWpView}
          loaderSmsView={loaderSmsView}
          viewLogData={viewEmailLog}
          viewNotificationLog={viewNotificationLog}
          viewWhatsappLog={viewWhatsappLog}
          viewSmsLog={viewSmsLog}
          totalRowsNotification={totalRowsNotification}
          totalRowsEmail={totalRowsEmail}
          totalRowWhatsapp={totalRowWhatsapp}
          totalRowsSms={totalRowsSms}
          setViewEmailLog={setViewEmailLog}
          setViewNotificationLog={setViewNotificationLog}
          setViewWhatsappLog={setViewWhatsappLog}
          setViewSmsLog={setViewSmsLog}
          globalFilterLog={globalFilterLog}
          getViewLog={getViewLog}
          getNotificationViewLog={getNotificationViewLog}
          getWhatsappViewLog={getWhatsappViewLog}
          getSmsViewLog={getSmsViewLog}
        />
      )}
    </>
  )
}

export default CampaignListPage
