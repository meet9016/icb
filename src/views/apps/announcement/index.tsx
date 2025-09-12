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

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { api } from '@/utils/axiosInstance'
import { Button, Typography, Skeleton, Tooltip, Chip, CardContent, TextField, TextFieldProps } from '@mui/material'
import endPointApi from '@/utils/endPointApi'
import DeleteGialog from '@/comman/dialog/DeleteDialog'
import ImageGallery from './ImageGallery'
import ReactTable from '@/comman/table/ReactTable'
import { getLocalizedUrl } from '@/utils/i18n'
import { useParams, useRouter } from 'next/navigation'
import { Locale } from '@/configs/i18n'
import { ShowErrorToast, ShowSuccessToast } from '@/comman/toastsCustom/Toast'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UserCount = {
  active_count: number
  inactive_count: number
  [key: string]: any // add more properties if needed
}

interface UsersTypeWithAction {
  id: number | string
  title: string
  description: string
  status: 'active' | 'inactive'
  total_campaigns?: number
  updated_by?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  attachments?: File[]
  action?: string
}
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

const AnnouncementListPage = ({ tableData }: { tableData?: UsersType[] }) => {
  const permissions = useSelector((state: RootState) => state.sidebarPermission)
  const router = useRouter()
  const { lang: locale } = useParams()

  const [imagemainPopUpOpen, setImagemainPopUpOpen] = useState(false)
  const [data, setData] = useState<UsersType[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null) // ideally type this
  const [loaderMain, setloaderMain] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [totalRows, setTotalRows] = useState(0)
  const [paginationInfo, setPaginationInfo] = useState({
    page: 0,
    perPage: 10
  })
  const [loading, setLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')

  const openPopUp = (id: number) => {
    const selectedData = data.find(item => item.id === id)
    if (selectedData) {
      setSelectedUser(selectedData.attachments)
    }
  }

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: ({ row }) => {
          const htmlToText = (html: string): string => {
            const temp = document.createElement('div')
            temp.innerHTML = html
            return temp.textContent || temp.innerText || ''
          }

          const text = htmlToText(row.original.title || '')
          const truncated = text.length > 20 ? `${text.slice(0, 20)}...` : text

          return (
            <Tooltip title={text} arrow placement='bottom-start'>
              <Typography noWrap>{truncated}</Typography>
            </Tooltip>
          )
        }
      }),

      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => {
          const htmlToText = (html: string): string => {
            const temp = document.createElement('div')
            temp.innerHTML = html
            return temp.textContent || temp.innerText || ''
          }

          const text = htmlToText(row.original.description || '')
          const truncated = text.length > 25 ? `${text.slice(0, 25)}...` : text

          return (
            <Tooltip title={text} arrow placement='bottom-start'>
              <Typography noWrap>{truncated}</Typography>
            </Tooltip>
          )
        }
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const statusObj: Record<
            string | number,
            { title: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' }
          > = {
            1: { title: 'Draft', color: 'secondary' },
            2: { title: 'Ready to Publish', color: 'warning' },
            3: { title: 'Published', color: 'success' }
          }

          const status = statusObj[row.original.status]

          return status ? (
            <Chip label={status.title} variant='tonal' color={status.color} size='small' />
          ) : (
            <Chip label='-' variant='outlined' color='default' size='small' />
          )
        }
      }),

      columnHelper.accessor('total_campaigns', {
        header: 'Campaigns'
      }),

      columnHelper.accessor('created_at', {
        header: 'Created At',
        cell: ({ row }: any) => <Typography>{row.original.created_at}</Typography>
      }),

      columnHelper.accessor('created_by', {
        header: 'Created By',
        cell: ({ row }: any) => (
          <Typography className=''>{row.original.created_by ? row.original.created_by.name : '-'}</Typography>
        )
      }),

      columnHelper.accessor('updated_at', {
        header: 'Updated At',
        cell: ({ row }: any) => <Typography>{row.original.updated_at}</Typography>
      }),

      columnHelper.accessor('updated_by', {
        header: 'Updated By',
        cell: ({ row }: any) => (
          <Typography className='text-gray-800 font-medium'>
            {row?.original?.updated_by ? row.original.updated_by.name : '-'}
          </Typography>
        )
      }),

      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <>
              <Tooltip title='Edit'>
                <IconButton
                  size='small'
                  onClick={() => {
                    editUser(Number(row.original.id))
                  }}
                >
                  <i className='ri-pencil-line' style={{ color: 'green' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title='Attachment'>
                <IconButton
                  size='small'
                  onClick={() => {
                    setImagemainPopUpOpen(true)
                    openPopUp(Number(row.original.id))
                  }}
                  disabled={(row.original.attachments?.length ?? 0) === 0}
                >
                  <i className='ri-multi-image-line text-blue-600' />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={Number(row.original.status) == 1 ? 'Cannot launch — campaign is still a draft' : 'Campaign'}
              >
                <span className='cursor-pointer'>
                  <IconButton
                    size='small'
                    onClick={() => {
                      if (row?.original?.id) {
                        router.replace(
                          getLocalizedUrl(
                            `/apps/announcement/campaign?campaignId=${encodeURIComponent(btoa(String(row.original.id)))}`,
                            locale as Locale
                          )
                        )
                        localStorage.setItem('announcementId', row.original.id.toString())
                      }
                    }}
                    disabled={Number(row.original.status) == 1}
                  >
                    <i className='ri-megaphone-line text-orange-500' />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip
                title={
                  Number(row.original.status) === 3
                    ? 'Cannot delete published item'
                    : (row.original.total_campaigns ?? 0) > 0
                      ? 'Deletion not allowed: announcement is attached to a campaign'
                      : 'Delete'
                }
              >
                <span className='cursor-pointer'>
                  <IconButton
                    size='small'
                    onClick={() => handleDeleteClick(Number(row.original.id))}
                    disabled={Number(row.original.status) == 3 || (row.original.total_campaigns ?? 0) > 0}
                  >
                    <i className='ri-delete-bin-7-line text-red-600' />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false
      })
    ],
    [data, permissions]
  )
  const getAvatar = (params: Pick<UsersType, 'avatar' | 'fullName'>) => {
    const { avatar, fullName } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(fullName as string)}
        </CustomAvatar>
      )
    }
  }

  const fetchUsers = async () => {
    setloaderMain(true)
    try {
      const formData = new FormData()
      formData.append('per_page', paginationInfo.perPage.toString())
      formData.append('page', (paginationInfo.page + 1).toString())
      formData.append('search', globalFilter)

      const res = await api.post(`${endPointApi.getAnnouncements}`, formData)

      setTotalRows(res.data.data.total)
      setData(res.data.data.data)
      setloaderMain(false)
    } catch (err: any) {
      setloaderMain(false)
      if (err.response?.status === 500) {
        ShowErrorToast('Internal Server Error.')
      } else {
        ShowErrorToast(err?.response?.data?.message)
      }
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [paginationInfo.page, paginationInfo.perPage, globalFilter])

  const handleDeleteClick = (id: number) => {
    setSelectedUserId(id)
    setDeleteOpen(true)
  }
  const editUser = async (id: number) => {
    const encodedId = encodeURIComponent(btoa(id.toString()))
    router.push(`${getLocalizedUrl('/apps/announcement/add-announcement', locale as Locale)}?id=${encodedId}`)
  }

  const deleteUser = async (id: number | null) => {
    // if (id === null) return;
    try {
      setDeleteOpen(false)
      setLoading(true)

      const response = await api.delete(`${endPointApi.deleteAnnouncements}/${id}`)

      if (response.data?.status === 200) {
        setLoading(false)
        fetchUsers()
        ShowSuccessToast(response.data.message)
      }
    } catch (error: any) {
      setLoading(false)
      ShowErrorToast(error?.response.data?.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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
                  placeholder='Search Announcement...'
                />
              </div>

              <Button
                variant='contained'
                onClick={() => {
                  router.replace(getLocalizedUrl('/apps/announcement/add-announcement', locale as Locale))
                }}
                className='w-full sm:w-auto'
                startIcon={<i className='ri-add-line' />}
              >
                Add Announcement
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

      {deleteOpen && (
        <DeleteGialog
          open={deleteOpen}
          setOpen={setDeleteOpen}
          type={'delete-order'}
          onConfirm={() => deleteUser(selectedUserId)}
          selectedDeleteStatus=''
        />
      )}

      {imagemainPopUpOpen && (
        <ImageGallery open={imagemainPopUpOpen} setOpen={() => setImagemainPopUpOpen(false)} images={selectedUser} />
      )}
    </>
  )
}

export default AnnouncementListPage
