'use client'
import '@tanstack/table-core'
// React Imports
import { useEffect, useState, useMemo, MouseEvent, useRef } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'

import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import TableFilters from './TableFilters'
import AddUserDrawer from './AddUserDrawer'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { toast } from 'react-toastify'
import {
  Box,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Tooltip
} from '@mui/material'
import DeleteGialog from '@/comman/dialog/DeleteDialog'
import ConfirmDialog from '@/comman/dialog/ConfirmDialog'
import { api } from '@/utils/axiosInstance'
import endPointApi from '@/utils/endPointApi'
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress'

const MenuProps = {
  PaperProps: {
    sx: {
      maxHeight: 320, // ≈ 2 items * row height (adjust if needed)
      overflowY: 'auto',
      '& .MuiMenuItem-root': {
        py: 1
      },
      '& .dropdown-footer': {
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #e0e0e0',
        padding: '8px 16px',
        zIndex: 1
      }
    }
  }
}
declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UsersTypeWithAction = UsersType & {
  action?: string
  fullName: string
  name: string
  dl_contact_types: string
}

type UserStatusType = {
  [key: string]: ThemeColor
}

const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

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

const userStatusObj: UserStatusType = {
  active: 'success',
  inactive: 'secondary'
}

// Column Definitions
const columnHelper = createColumnHelper<UsersTypeWithAction>()

const UserListTable = ({ tableData }: { tableData?: UsersType[] }) => {
  const permissions = useSelector((state: RootState) => state.sidebarPermission)
  const adminStore = useSelector((state: RootState) => state.admin)
  const [statuConnected, setStatusConnected] = useState(0)
  const [dataBaseConnect, setDataBaseConnect] = useState(0)
  const [roleName, setRoleName] = useState<{ id: string | number; name: string }[]>([])
  useEffect(() => {
    api.get(`${endPointApi.microsoftAuthTokenValide}`).then(response => {
      setStatusConnected(response.data.satus)
    })
    api.get(`${endPointApi.getConnectionView}`).then(response => {
      setDataBaseConnect(response.data.data[0].status_view)
    })
  }, [])

  const hasPermission = (menuName: string, subMenuName: string) => {
    const menus = (permissions as any).menus
    const menu = menus?.find((m: any) => m.menu_name === menuName && m.checked)
    return menu?.sub_menus?.some((sub: any) => sub.name === subMenuName && sub.checked)
  }

  const [addUserOpen, setAddUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [contactSelection, setContactSelection] = useState([])
  const [role, setRole] = useState<UsersType['role']>('')
  const [status, setStatus] = useState<UsersType['status']>('')
  const [contactType, setContactType] = useState<string[]>([]) // Define as an array of strings
  const [data, setData] = useState<UsersType[]>([])
  const [editUserData, setEditUserData] = useState<UsersType | undefined>(undefined)
  const [searchData, setSearchData] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<any>(null) // ideally type this
  const [loading, setLoading] = useState(false)
  const [loadingSyn, setLoadingsync] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [totalUser, setTotalUser] = useState<{ active_count: number; inactive_count: number }>({
    active_count: 0,
    inactive_count: 0
  })

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage) // pageIndex will trigger useEffect to fetch
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0) // Reset to first page
  }

  const [open, setOpen] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([])
  const [statusUser, setStatusUser] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [roleConfirmOpen, setRoleConfirmOpen] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null)
  const [selectedDeleteIdStatus, setSelectedDeleteStatus] = useState<string | null>(null)
  const [rolesList, setRolesList] = useState<{ id: string | number; name: string }[]>([])

  const fetchedRef = useRef(false)
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchRoles = async () => {
      try {
        setLoading(true)
        const response = await api.get(`${endPointApi.getRolesDropdown}`)
        const roles = response.data.data.filter((item: any) => item.name !== 'Super Admin')
        setRolesList(roles)
      } catch (err) {
        return null
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [])

  useEffect(() => {
    // if (fetchedRef.current) return
    // fetchedRef.current = true

    const fetchContactType = async () => {
      try {
        setLoading(true)
        const response = await api.get(`${endPointApi.getUserContactType}`)
        const transformedData = response.data.filters[0].contact_type.map(({ contact_type, contact_desc }) => ({
          value: Number(contact_type), // Convert contact_type to number
          name: contact_desc
        }))
        setContactSelection(transformedData)
      } catch (err) {
        return null
      } finally {
        setLoading(false)
      }
    }
    fetchContactType()
  }, [])

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedNames = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value

    const selectedObjects = rolesList.filter(role => selectedNames.includes(role.name))

    setRoleName(selectedObjects)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A to toggle select all visible
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()

        const allVisibleIds = table.getFilteredRowModel().rows.map(row => row.original.id)
        const allSelected = allVisibleIds.every(id => selectedUserIds.includes(id))

        setSelectedUserIds(prev => {
          return allSelected
            ? prev.filter(id => !allVisibleIds.includes(id)) // unselect visible
            : Array.from(new Set([...prev, ...allVisibleIds])) // select visible
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedUserIds])

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => {
          const allVisibleIds = table.getFilteredRowModel().rows.map(row => row.original.id)
          const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedUserIds.includes(id))
          const someSelected = allVisibleIds.some(id => selectedUserIds.includes(id))

          return (
            <Checkbox
              checked={allSelected}
              indeterminate={!allSelected && someSelected}
              onChange={e => {
                const checked = e.target.checked
                setSelectedUserIds(prev =>
                  checked
                    ? Array.from(new Set([...prev, ...allVisibleIds]))
                    : prev.filter((id: any) => !allVisibleIds.includes(id))
                )
              }}
            />
          )
        },
        cell: ({ row }) => {
          const id = row.original.id
          const isChecked = selectedUserIds.includes(id)

          return (
            <Checkbox
              checked={isChecked}
              onChange={e => {
                const checked = e.target.checked
                setSelectedUserIds(prev => {
                  if (checked) {
                    return Array.from(new Set([...prev, id])) // prevent duplicates
                  } else {
                    return prev.filter(_id => _id !== id)
                  }
                })
              }}
            />
          )
        }
      },
      columnHelper.accessor('fullName', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ avatar: row.original.image, fullName: row.original.fullName })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.fullName}
              </Typography>
              <Typography variant='body2'>{row.original.name}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email ?? '-'}</Typography>
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => <Typography>{row.original.phone ?? '-'}</Typography>
      }),
      columnHelper.accessor('contact_type_name', {
        header: 'Contact Type',
        cell: ({ row }) => <Typography>{row.original.contact_type_name ?? '-'}</Typography>
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => {
          const roleData = row.original.role

          const roles = Array.isArray(roleData) ? roleData : []
          const roleColorMap: Record<string, string> = {
            default: 'border-gray-300 bg-gray-50 text-gray-800',
            teacher: 'border-blue-500 bg-blue-50 text-blue-800',
            student: 'border-green-500 bg-green-50 text-green-800',
            management: 'border-yellow-500 bg-yellow-50 text-yellow-800',
            principle: 'border-purple-500 bg-purple-50 text-purple-800',
            'non teaching staff': 'border-red-500 bg-red-50 text-red-800',
            staff: 'border-indigo-500 bg-indigo-50 text-indigo-800'
          }
          return (
            <div className='flex items-start gap-2 flex-wrap'>
              {/* <i className='ri-user-3-line mui-qsdg36 mt-[2px]' /> */}

              <div className='flex flex-wrap gap-2 max-w-[220px] sm:max-w-[320px] md:max-w-[460px]'>
                {roles.length === 0 ? (
                  <Typography className='capitalize text-sm' color='text.primary'>
                    {typeof roleData === 'string' ? roleData : '-'}
                  </Typography>
                ) : (
                  roles.map((user_role: { name: string }, index: number) => {
                    const roleName = user_role.name.toLowerCase().trim()
                    const colorClass = roleColorMap[roleName] || 'border-gray-300 bg-gray-50 text-gray-800'

                    return (
                      <Typography
                        key={index}
                        className={`capitalize border rounded-full text-sm leading-none px-2 py-[2px] whitespace-nowrap ${colorClass}`}
                      >
                        {user_role.name}
                      </Typography>
                    )
                  })
                )}
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              sx={{ fontWeight: 'bold' }}
              label={row.original.status}
              size='small'
              color={row.original.status === 'inactive' ? 'error' : userStatusObj[row.original.status]}
              className='capitalize'
              onClick={() => {
                if (row.original.status === 'active') {
                  setDeleteOpen(true) // open confirmation popup
                  handleOpenDeleteDialog(row.original.id, '0') // or '0' depending on your backend
                } else if (row.original.status === 'inactive') {
                  setDeleteOpen(true)
                  handleOpenDeleteDialog(row.original.id, '1')
                }
              }}
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            {row.original.status === 'inactive' ? (
              // Show Restore button
              <IconButton
                size='small'
                onClick={() => {
                  setDeleteOpen(true)
                  handleOpenDeleteDialog(row.original.id, '1')
                }}
              >
                <i className='ri-loop-left-line text-textSecondary' />
              </IconButton>
            ) : (
              // Normal Active user actions
              <>
                {hasPermission('user-management', 'user-management-edit') && (
                  <IconButton
                    size='small'
                    onClick={() => {
                      setAddUserOpen(true)
                      editUser(row.original.id)
                    }}
                  >
                    <Tooltip title='Edit'>
                      <i className='ri-edit-box-line text-textSecondary' />
                    </Tooltip>
                  </IconButton>
                )}

                {hasPermission('user-management', 'user-management-delete') && (
                  <IconButton
                    size='small'
                    onClick={() => {
                      setDeleteOpen(true)
                      handleOpenDeleteDialog(row.original.id, '0')
                    }}
                  >
                    <Tooltip title='Delete'>
                      <i className='ri-delete-bin-7-line text-textSecondary' />
                    </Tooltip>
                  </IconButton>
                )}
              </>
            )}
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, permissions, selectedUserIds]
  )

  const table = useReactTable({
    data: data as UsersType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter: searchData,
      pagination: {
        pageIndex: page,
        pageSize: rowsPerPage
      }
    },
    manualPagination: true,
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setSearchData,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getRowId: row => row.id
  })

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
    try {
      setLoading(true)
      console.log('23232')
      const type = contactType.join(',')

      const response = await api.get(`${endPointApi.getUser}`, {
        params: {
          role_id: role,
          search: searchData,
          per_page: rowsPerPage.toString(),
          page: page + 1,
          status: status || '',
          id: '',
          contact_type: type || ''
        }
      })
      if (response.data.message === 'Data not found for this User') {
        toast.error('Data not found for this User')
        setData([])
      }
      const users = response.data.users.data.map(
        (user: {
          id: number
          full_name: string
          name: string
          email: string
          username: string
          roles: { name: string }[]
          status: number
          image: string
          phone: string
          contact_type_name: string
        }) => ({
          id: user.id,
          fullName: user.full_name ?? '',
          name: user.name ?? '',
          email: user.email ?? '',
          username: user.username ?? '',
          role: user.roles ?? [],
          status: user.status === 1 ? 'active' : 'inactive',
          phone: user.phone,
          contact_type_name: user.contact_type_name,
          currentPlan: 'enterprise'
        })
      )

      setTotalRows(response.data.users.total)
      setData(users || [])
      // getUserCount()
      if (response.data.message === 'Data not found for this User') {
        toast.error('Data not found for this User')
        setData([])
      }
    } catch (err: any) {
      // toast.error("error")
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    getUserCount()
  }, [role, status, searchData, page, rowsPerPage, contactType])

  const getUserCount = () => {
    api.get(`${endPointApi.getUserCount}`).then(res => setTotalUser(res.data.data))
  }
  const editUser = async (id: number) => {
    setSelectedUser(id)
    const response = await api.get(`${endPointApi.getUser}`, {
      params: {
        id: id || ''
      }
    })
    if (response.data.message === 'User fetched successfully') {
      setEditUserData(response.data)
    }
  }

  const handleOpenDeleteDialog = (id: number, status: string) => {
    setSelectedDeleteId(id)
    setSelectedDeleteStatus(status)
  }

  const deleteUser = async () => {
    try {
      const formdata = new FormData()
      formdata.append('user_id', selectedDeleteId?.toString() ?? '')
      formdata.append('school_id', adminStore?.school_id?.toString() ?? '')
      formdata.append('tenant_id', adminStore?.tenant_id?.toString() ?? '')
      formdata.append('status', selectedDeleteIdStatus ?? '')

      const response = await api.post('user-status-update', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data?.status === 200) {
        fetchUsers() // refresh the list after update
        setSelectedUserIds([])
        getUserCount()
      }
    } catch (error: any) {
      return null
    } finally {
      setSelectedUserIds([])
      setStatusUser('')
    }
  }

  const SyncMicrosoftUser = async () => {
    try {
      setLoading(true)
      const response = await api.get(
        `${endPointApi.microsoftFetchUsers}/${adminStore?.school_id?.toString()}/${adminStore?.tenant_id?.toString()}`
      )
      if (response.data.status === 200) {
        toast.success('Users synced successfully')
        fetchUsers()
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while syncing users')
    } finally {
      setLoading(false)
    }
  }
  const connectDataLack = async () => {
    try {
      setLoading(true)

      const response = await api.get(`${endPointApi.dataLackFetchUsers}`, {
        params: {
          sync: true,
          tenant_id: adminStore?.tenant_id?.toString(),
          school_id: adminStore?.school_id?.toString(),
          return_records: 1,
          full_records : 'disabled'
        }
      })

      if (response.status == 200) {
        toast.success(response.data.message || 'Users synced successfully')
        fetchUsers()
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while syncing users')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (value: 'active' | 'inactive') => {
    setStatusUser(value) // Update UI dropdown
    if (selectedUserIds.length === 0) {
      toast.warning('Please select at least one user.')
      setStatusUser('')
    } else {
      setOpen(true)
    }
  }

  const handleConfirmation = () => {
    const statusCode = statusUser === 'active' ? 1 : 0
    const body = {
      user_ids: selectedUserIds,
      school_id: adminStore?.school_id?.toString() ?? '',
      tenant_id: adminStore?.tenant_id?.toString() ?? '',
      status: statusCode ?? ''
    }
    api
      .post(`${endPointApi.postMultipleStatusChange}`, body)
      .then(response => {
        if (response.data.status === 200) {
          setOpen(false)
          toast.success(statusUser === 'active' ? 'Users activated successfully' : 'Users deactivated successfully')
          fetchUsers()
          setSelectedUserIds([])
          setStatusUser('')
        }
      })
      .catch(error => {
        setOpen(false)
        toast.error(error.response?.data?.message || 'An error occurred while updating users')
        setStatusUser('')
      })
  }

  const handleOpenMultipleRoleDialog = () => {
    if (selectedUserIds.length === 0) {
      toast.warning('Please select at least one user.')
      setRoleName([])
      return
    }

    setRoleConfirmOpen(true)
  }

  const multipleRoleChange = async () => {
    const selectedRole = roleName.map((role: { id: string | number; name: string }) => role.id)
    try {
      const body = {
        user_ids: selectedUserIds,
        roles_ids: selectedRole,
        school_id: adminStore?.school_id?.toString() ?? '',
        tenant_id: adminStore?.tenant_id?.toString() ?? ''
      }

      const response = await api.post(`${endPointApi.postMultipleRoleChange}`, body)

      if (response.data?.status === 200) {
        fetchUsers() // refresh the list after update
        setSelectedUserIds([])
        setRoleName([])
        // setRoleConfirmOpen(false)

        toast.success('Roles updated successfully!')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message)
      return null
    }
  }

  const [progress, setProgress] = useState(10)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (loading) {
      setProgress(0)
      timer = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 1 : prev + 1))
      }, 80)
    } else {
      clearInterval(timer)
      setProgress(0) // reset
    }
    return () => clearInterval(timer)
  }, [loading])

  return (
    <>
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant='determinate'
              value={progress}
              size={64} // same size as w-16 h-16
              thickness={4} // same as border-4
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography
                variant='caption'
                component='div'
                sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}
              >
                {/* {`${Math.round(progress)}%`} */}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Grid container spacing={6} sx={{ mt: 0, mb: 5 }}>
        {/* Active Users */}
        <Grid item xs={12} sm={12} md={6} lg={6} className='pt-0'>
          <Card>
            <CardContent className='flex justify-between gap-1 items-center'>
              <div className='flex flex-col gap-1 flex-grow'>
                <div className='flex items-center gap-2 flex-wrap'>
                  {loading ? (
                    <Skeleton variant='text' width={60} height={40} />
                  ) : (
                    <Typography variant='h4'>{totalUser?.active_count - 1}</Typography>
                  )}
                </div>
                {loading ? (
                  <Skeleton variant='text' width={100} height={15} />
                ) : (
                  <Typography variant='body2'>Active Users</Typography>
                )}
              </div>
              {loading ? (
                <Skeleton variant='rectangular' sx={{ borderRadius: '12px' }} width={62} height={62} />
              ) : (
                <CustomAvatar color='success' skin='light' variant='rounded' size={62}>
                  <i className={classnames('ri-user-follow-line', 'text-[26px]')} />
                </CustomAvatar>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Inactive Users */}
        <Grid item xs={12} sm={12} md={6} lg={6} className='pt-0'>
          <Card>
            <CardContent className='flex justify-between gap-1 items-center'>
              <div className='flex flex-col gap-1 flex-grow'>
                <div className='flex items-center gap-2 flex-wrap'>
                  {loading ? (
                    <Skeleton variant='text' width={60} height={40} />
                  ) : (
                    <Typography variant='h4'>{totalUser?.inactive_count}</Typography>
                  )}
                </div>
                {loading ? (
                  <Skeleton variant='text' width={100} height={20} />
                ) : (
                  <Typography variant='body2'>Inactive Users</Typography>
                )}
              </div>
              {loading ? (
                <Skeleton variant='rectangular' sx={{ borderRadius: '12px' }} width={62} height={62} />
              ) : (
                <CustomAvatar color='error' skin='light' variant='rounded' size={62}>
                  <i className={classnames('ri-user-line', 'text-[26px]')} />
                </CustomAvatar>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardHeader title='Filters' className='pbe-4' />
        <TableFilters
          role={role}
          setRole={setRole}
          status={status}
          setStatus={setStatus}
          contactSelection={contactSelection}
          contactType={contactType}
          setContactType={setContactType}
          rolesList={rolesList}
        />
        <Divider />
        <>
          <div className='p-5'>
            <div className='flex flex-wrap justify-between items-center gap-4'>
              {/* Right side: Search, Add User, Menu */}
              {loading ? (
                <div className='flex flex-wrap items-center justify-between gap-4 w-full'>
                  {/* 🔍 Left Side: Search Input Skeleton */}
                  <div className='min-w-[150px] max-w-[200px] w-full sm:w-auto'>
                    <Skeleton variant='rectangular' height={40} width='100%' className='rounded' />
                  </div>

                  {/* 👉 Right Side Controls */}
                  <div className='flex justify-end flex-wrap gap-4 ml-auto'>
                    {/* Bulk Role Change Skeleton */}
                    <Skeleton variant='rectangular' height={40} width={250} className='rounded' />

                    {/* Add User Button Skeleton (Conditional) */}
                    {hasPermission('user-management', 'user-management-add') && (
                      <Skeleton variant='rectangular' height={40} width={160} className='rounded' />
                    )}

                    {/* Status Dots Skeleton */}
                    <Stack spacing={0.5} alignItems='center' justifyContent='center' height={40}>
                      <Skeleton variant='circular' width={6} height={6} />
                      <Skeleton variant='circular' width={6} height={6} />
                      <Skeleton variant='circular' width={6} height={6} />
                    </Stack>
                  </div>
                </div>
              ) : (
                <div className='w-full flex flex-wrap items-center justify-between gap-4'>
                  {/* Left Side: Search */}
                  <div className='flex-1 min-w-[150px] max-w-[200px]'>
                    {/* <DebouncedInput
                      value={searchData ?? ''}
                      onChange={value => setSearchData(String(value))}
                      placeholder='Search User'
                      className='w-full'
                    /> */}
                    {/* <DebouncedInput
                      value={searchData ?? ''}
                      onEnter={val => {
                        setSearchData(String(val))
                      }}
                      placeholder='Search User'
                      className='w-full'
                    /> */}
                    <DebouncedInput
                      value={searchData ?? ''}
                      onEnter={val => {
                        setSearchData(String(val))
                        // fetchUsers() // Enter press pe API call
                      }}
                      onChange={val => {
                        setSearchData(String(val))
                        if (String(val).trim() === '') {
                          fetchUsers() // Agar input empty ho gaya to API call
                        }
                      }}
                      placeholder='Search User'
                      className='w-full'
                    />
                  </div>
                  {/* Left side: Selected count */}
                  {selectedUserIds.length > 0 && (
                    <Typography variant='body2' className='font-bold'>
                      {selectedUserIds.length} users selected
                    </Typography>
                  )}
                  {/* Right Side Controls */}
                  <div className='flex flex-wrap items-center justify-end gap-4 ml-auto'>
                    {/* Add User Button */}
                    {hasPermission('user-management', 'user-management-add') && (
                      <Button
                        variant='contained'
                        onClick={() => {
                          setSelectedUser(null)
                          setAddUserOpen(true)
                        }}
                        className='w-full sm:w-auto'
                        startIcon={<i className='ri-add-line' />}
                      >
                        Add User
                      </Button>
                    )}
                    {/* Bulk Role Dropdown */}
                    <div className='w-full sm:w-[250px]'>
                      <FormControl fullWidth size='small'>
                        <InputLabel id='bulk-role-label'>Bulk Role Change</InputLabel>
                        <Select
                          labelId='bulk-role-label'
                          multiple
                          value={roleName.map(r => r.name)}
                          onChange={handleChange}
                          input={<OutlinedInput label='Bulk Role Change' />}
                          renderValue={selected => selected.join(', ')}
                          MenuProps={{
                            ...MenuProps,
                            PaperProps: {
                              style: {
                                width: 200,
                                maxHeight: 300,
                                paddingBottom: 8,
                                overflow: 'visible',
                                position: 'relative'
                              }
                            }
                          }}
                        >
                          {/* ✅ Role List */}
                          {rolesList
                            .filter(role => role.name !== 'Default')
                            .map(item => (
                              <MenuItem key={item.id} value={item.name}>
                                <Checkbox checked={roleName.some(role => role.id === item.id)} />
                                <ListItemText primary={item.name} />
                              </MenuItem>
                            ))}

                          {/* ✅ Save Button (absolute position) */}
                          <Box
                            sx={{
                              position: 'sticky',
                              bottom: 0,
                              width: '100%',
                              zIndex: 1,
                              backgroundColor: 'white',
                              padding: '8px 16px',
                              borderTop: '1px solid #eee'
                            }}
                          >
                            {/* Use ClickAwayListener to protect the dropdown */}
                            <ClickAwayListener onClickAway={e => e.stopPropagation()}>
                              <Button
                                variant='contained'
                                color='primary'
                                fullWidth
                                size='small'
                                onClick={e => {
                                  e.stopPropagation()
                                  handleOpenMultipleRoleDialog()
                                }}
                              >
                                Save
                              </Button>
                            </ClickAwayListener>
                          </Box>
                        </Select>
                      </FormControl>
                    </div>

                    {/* Status Option Menu */}
                    <div>
                      <CardHeader
                        sx={{ p: 0 }}
                        action={
                          <StatusOptionMenu
                            onChange={handleStatusChange}
                            onSync={SyncMicrosoftUser}
                            onSyncDataLack={connectDataLack}
                            statuConnected={statuConnected}
                            dataBaseConnect={dataBaseConnect}
                          />
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
        {loading ? (
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  {[...Array(5)].map((_, index) => (
                    <th key={index}>
                      <Skeleton variant='text' height={50} width={100} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {[...Array(5)].map((_, colIndex) => (
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
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              className={classnames({
                                'flex items-center': header.column.getIsSorted(),
                                'cursor-pointer select-none': header.column.getCanSort()
                              })}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <i className='ri-arrow-up-s-line text-xl' />,
                                desc: <i className='ri-arrow-down-s-line text-xl' />
                              }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                            </div>
                          </>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table
                    .getRowModel()
                    .rows.slice(0, table.getState().pagination.pageSize)
                    .map(row => {
                      return (
                        <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      )
                    })}
                </tbody>
              )}
            </table>
          </div>
        )}
        <TablePagination
          component='div'
          count={totalRows} // total: 14
          page={page} // 0-based index
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <AddUserDrawer
        open={addUserOpen}
        handleClose={() => setAddUserOpen(false)}
        editUserData={editUserData}
        fetchUsers={fetchUsers}
        selectedUser={selectedUser}
      />

      {open && (
        <>
          <Dialog fullWidth maxWidth='xs' open={open} onClose={() => setOpen(false)} closeAfterTransition={false}>
            <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
              <i className='ri-error-warning-line text-[88px] mbe-6 text-warning' />
              <Typography variant='h4'>
                Are you sure {statusUser === 'active' ? 'Activate' : 'Inactivate'} user?
              </Typography>
            </DialogContent>
            <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
              <Button variant='contained' onClick={handleConfirmation}>
                Yes, {statusUser === 'active' ? 'Activate' : 'Inactivate'} User!
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => {
                  setOpen(false)
                  setSelectedUserIds([])
                  setStatusUser('')
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      {deleteOpen && (
        <DeleteGialog
          open={deleteOpen}
          setOpen={setDeleteOpen}
          type={'delete-user'}
          onConfirm={deleteUser}
          selectedDeleteStatus={selectedDeleteIdStatus}
        />
      )}
      {roleConfirmOpen && (
        <ConfirmDialog
          open={roleConfirmOpen}
          setOpen={setRoleConfirmOpen}
          type={'role-change'}
          onConfirm={multipleRoleChange}
          setRoleName={setRoleName}
          setSelectedUserIds={setSelectedUserIds}
        />
      )}
    </>
  )
}

export default UserListTable

interface StatusOptionMenuProps {
  onChange?: (status: 'active' | 'inactive') => void
  onSync?: () => void
  onSyncDataLack?: () => void
  statuConnected: Number
  dataBaseConnect: Number
}

const StatusOptionMenu: React.FC<StatusOptionMenuProps> = ({
  onChange,
  onSync,
  onSyncDataLack,
  statuConnected,
  dataBaseConnect
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleStatusChange = (status: 'active' | 'inactive') => {
    if (onChange) onChange(status)
    handleClose()
  }

  const handleSync = () => {
    if (onSync) onSync()
    handleClose()
  }

  const handleConnectDataLack = () => {
    if (onSyncDataLack) onSyncDataLack()
    handleClose()
  }

  return (
    <>
      <Tooltip title='Action'>
        <IconButton
          aria-label='more'
          aria-controls={open ? 'status-options-menu' : undefined}
          aria-haspopup='true'
          onClick={handleClick}
        >
          <i className='ri-more-2-fill text-xl' />
        </IconButton>
      </Tooltip>
      <Menu
        id='status-options-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleStatusChange('active')}>
          <CustomAvatar color='success' skin='light' variant='rounded' size={25}>
            <i className={classnames('ri-user-follow-line', 'text-[16px]')} />
          </CustomAvatar>
          Active
        </MenuItem>

        <MenuItem onClick={() => handleStatusChange('inactive')}>
          <CustomAvatar color='error' skin='light' variant='rounded' size={25}>
            <i className={classnames('ri-user-line', 'text-[16px]')} />
          </CustomAvatar>
          Inactive
        </MenuItem>

        {statuConnected === 1 && (
          <MenuItem onClick={handleSync}>
            <CustomAvatar skin='light' variant='rounded' size={25}>
              <img src='/images/logos/Microsoft-Icon.png' alt='Microsoft' className='w-[17px] h-[17px]' />
            </CustomAvatar>
            Sync With Microsoft
          </MenuItem>
        )}
        {dataBaseConnect === 1 && (
          <MenuItem onClick={handleConnectDataLack}>
            <CustomAvatar color='info' skin='light' variant='rounded' size={25}>
              {/* <img src='/images/logos/Microsoft-Icon.png' alt='Microsoft' className='w-[17px] h-[17px]' /> */}
              <i className={classnames('ri-database-line', 'text-[16px]')} />
            </CustomAvatar>
            Sync with Datalake
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
