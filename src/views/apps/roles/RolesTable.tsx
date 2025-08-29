'use client'

import '@tanstack/table-core'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, Button, TextField, Typography, IconButton, TablePagination, Skeleton } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { TextFieldProps } from '@mui/material/TextField'
import classnames from 'classnames'
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
import type { UsersType } from '@/types/apps/userTypes'
import type { Locale } from '@configs/i18n'
import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'
import { api } from '@/utils/axiosInstance'
import tableStyles from '@core/styles/table.module.css'
import { useSettings } from '@core/hooks/useSettings'
import { RoleType } from '@/types/apps/roleType'
import { toast } from 'react-toastify'
import { RootState } from '@/redux-store'
import { saveToken } from '@/utils/tokenManager'
import { useSelector } from 'react-redux'
import DeleteGialog from '@/comman/dialog/DeleteDialog'
import endPointApi from '@/utils/endPointApi'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface SubMenus {
  id: number
  name: string
}

interface Permissions {
  menu_id: number
  menu_name: string
  sub_menus: SubMenus[]
}

type UsersTypeWithAction = RoleType & { action?: string; user_count: number }

const Icon = styled('i')({})
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }: {
//   value: string | number
//   onChange: (value: string | number) => void
//   debounce?: number
// } & Omit<TextFieldProps, 'onChange'>) => {
//   const [value, setValue] = useState(initialValue)

//   useEffect(() => { setValue(initialValue) }, [initialValue])
//   useEffect(() => {
//     const timeout = setTimeout(() => onChange(value), debounce)
//     return () => clearTimeout(timeout)
//   }, [value])

//   return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
// }

const DebouncedInput = ({
  value: initialValue,
  onEnter,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onEnter: (value: string | number) => void;
  debounce?: number;
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounce for empty value case
  useEffect(() => {
    if (String(value).trim() === '') {
      const timeout = setTimeout(() => {
        onEnter(value); // Call API when input cleared
      }, debounce);
      return () => clearTimeout(timeout);
    }
  }, [value, debounce, onEnter]);

  return (
    <TextField
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onEnter(value); // Only run API call on Enter
        }
      }}
      size="small"
    />
  );
};

const columnHelper = createColumnHelper<UsersTypeWithAction>()

const RolesTable = () => {
  const permissions = useSelector((state: RootState) => state.sidebarPermission)
  const loginStore = useSelector((state: RootState) => state.login)
  const userPermissionStore = useSelector((state: RootState) => state.userPermission)

  const searchParams = useSearchParams()

  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<RoleType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null)
  const [selectedDeleteIdStatus, setSelectedDeleteStatus] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const [searchData, setSearchData] = useState<string>('')

  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { lang: locale } = useParams()
  const hasRefreshedToken = useRef(false)
  const hasPermission = (menuName: string, subMenuName: string) => {
    const menus = (permissions as any).menus
    const menu = menus?.find((m: any) => m.menu_name === menuName && m.checked)
    return menu?.sub_menus?.some((sub: any) => sub.name === subMenuName && sub.checked)
  }

  const showAddRoleButton = (permissions as any)?.menus?.some(
    (menu: any) =>
      menu.menu_name === 'roles' &&
      menu.checked &&
      menu.sub_menus?.some((sub: any) => sub.name === 'roles-add' && sub.checked)
  )

  const showEditRoleButton = (permissions as any)?.menus?.some(
    (menu: any) =>
      menu.menu_name === 'roles' &&
      menu.checked &&
      menu.sub_menus?.some((sub: any) => sub.name === 'roles-edit' && sub.checked)
  )
  const showDeleteRoleButton = (permissions as any)?.menus?.some(
    (menu: any) =>
      menu.menu_name === 'roles' &&
      menu.checked &&
      menu.sub_menus?.some((sub: any) => sub.name === 'roles-delete' && sub.checked)
  )

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage) // pageIndex will trigger useEffect to fetch
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0) // Reset to first page
  }

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
    () => [
      // {
      //   id: 'select',
      //   header: ({ table }) => (
      //     <Checkbox {...{
      //       checked: table.getIsAllRowsSelected(),
      //       indeterminate: table.getIsSomeRowsSelected(),
      //       onChange: table.getToggleAllRowsSelectedHandler()
      //     }} />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox {...{
      //       checked: row.getIsSelected(),
      //       disabled: !row.getCanSelect(),
      //       indeterminate: row.getIsSomeSelected(),
      //       onChange: row.getToggleSelectedHandler()
      //     }} />
      //   )
      // },

      columnHelper.accessor('title', {
        header: 'Role Name',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            {row.original.title ? (
              <Typography variant='body2' color='text.primary' className='font-medium'>
                {row.original.title}
              </Typography>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No Name
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('user_count', {
        header: 'User Count',
        cell: ({ row }) => {
          const count = row.original.user_count

          if (count === 0) return null

          const maxVisible = 3 // Show max 3 avatars
          const visibleCount = Math.min(count, maxVisible)
          const extraCount = count - visibleCount

          return (
            <div className='flex items-center'>
              {Array.from({ length: visibleCount }).map((_, i) => (
                <img
                  key={i}
                  alt={`User ${i + 1}`}
                  src={`/images/avatars/${i + 1}.png`}
                  className={`w-8 h-8 rounded-full border-2 border-white ${i > 0 ? '-ml-2' : ''}`}
                />
              ))}
              {extraCount > 0 && (
                <div className='-ml-2 w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-sm font-medium flex items-center justify-center border-2 border-white'>
                  +{extraCount}
                </div>
              )}
            </div>
          )
        }
      }),

      columnHelper.accessor('action', {
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            {console.log('row.original', row)}
            {showEditRoleButton && (
              <IconButton
                size='small'
                disabled={['Super Admin', 'default', 'Default'].includes(row.original.title)}
                onClick={() => {
                  localStorage.setItem('editRoleData', JSON.stringify(row.original))
                  const redirectURL =
                    searchParams.get('redirectTo') ??
                    `/apps/roles/add-role?role_id=${encodeURIComponent(row.original.id)}`
                  router.replace(getLocalizedUrl(redirectURL, locale as Locale))
                }}
              >
                <i className='ri-edit-box-line text-textSecondary' />
              </IconButton>
            )}

            {showDeleteRoleButton && (
              <IconButton
                size='small'
                disabled={['super admin', 'default'].includes(row.original.title?.toLowerCase())}
                onClick={() => {
                  setDeleteOpen(true)
                  handleOpenDeleteDialog(row.original.id, 0)
                }}
              >
                <i className='ri-delete-bin-7-line text-textSecondary' />
              </IconButton>
            )}
          </div>
        )
      })
    ],
    [data, userPermissionStore]
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      rowSelection,
      globalFilter: searchData,
      pagination: {
        pageIndex: page,
        pageSize: rowsPerPage
      }
    },
    manualPagination: true,
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getRowId: row => row.id
  })

  const getAvatar = ({ avatar, fullName }: Pick<UsersType, 'avatar' | 'fullName'>) =>
    avatar ? <CustomAvatar src={avatar} size={34} /> : <CustomAvatar>{getInitials(fullName)}</CustomAvatar>

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const formData = new FormData()

      formData.append('tenant_id', loginStore.tenant_id)
      formData.append('search', searchData)
      formData.append('per_page', rowsPerPage.toString())
      formData.append('page', (page + 1).toString())

      // const response = await api.post('roles-all-get', formData, {
      const response = await api.post(`${endPointApi.getAllRoles}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('response', response)

      const users = response.data.data.data.map(
        (user: {
          menus: never[]
          id: number
          name: string
          permissions: Permissions[]
          roles: { name: string }[]
          user_count: number
        }) => ({
          id: user.id,
          title: user.name ?? 'No Title',
          permissions: user.menus ?? [],
          role: user.roles?.[0]?.name ?? '', // 🟢 ADD THIS LINE
          user_count: user.user_count ?? 0
        })
      )
      console.log('users', users)

      setTotalRows(response.data.data.total)
      setData(users)
      setLoading(false)

      //*******refresh token api call to response delay to other api 401 error get  */
      // if (response.data.status === 200 && !hasRefreshedToken.current) {
      //   hasRefreshedToken.current = true;
      //   try {
      //     const res = await api.post('auth/refresh');
      //     saveToken(res.data.access_token);
      //   } catch (err) {
      //     console.error('Token refresh error:', err);
      //   }
      // }
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, rowsPerPage])

  const handleOpenDeleteDialog = (id: number, status: string) => {
    setSelectedDeleteId(id)
    setSelectedDeleteStatus(status)
  }

  const deleteUser = async () => {
    try {
      const body = {
        role_id: selectedDeleteId,
        tenant_id: loginStore.tenant_id,
        school_id: loginStore.school_id,
        status: selectedDeleteIdStatus
      }
      const response = await api.post(`roles-status-update`, body)

      if (response.data.status == 200) {
        // toast.success(response.data.message);
        fetchUsers()
      }
    } catch (error: any) {
      return null
    } finally {
    }
  }

  return (
    <>
      <Card>
        {/* {loading && <Loader />} */}

        <CardContent className='flex justify-between flex-col items-start sm:flex-row sm:items-center max-sm:gap-4'>
          {/* <Button variant='outlined' color='secondary' startIcon={<i className='ri-upload-2-line' />} className='max-sm:is-full'>Export</Button> */}
          <div className='flex flex-col !items-start max-sm:is-full sm:flex-row sm:items-center gap-4'>
            {loading ? (
              <Skeleton variant='rectangular' height={40} width={200} className='rounded-md' />
            ) : (
              // <DebouncedInput
              //   value={globalFilter ?? ''}
              //   className='max-sm:is-full min-is-[220px]'
              //   onChange={value => setGlobalFilter(String(value))}
              //   placeholder='Search Role...'
              // />
              <DebouncedInput
                value={searchData ?? ''}
                onEnter={val => {
                  setSearchData(String(val))
                }}
                onChange={val => {
                  setSearchData(String(val))
                  if (String(val).trim() === '') {
                    fetchUsers()
                  }
                }}
                placeholder='Search User'
                className='w-full'
              />
            )}
          </div>
          {loading ? (
            <Skeleton variant='rectangular' height={40} width={120} className='rounded-md' />
          ) : (
            showAddRoleButton && (
              <Button
                variant='contained'
                size='medium'
                onClick={() => {
                  localStorage.removeItem('editRoleData')
                  router.replace(getLocalizedUrl('/apps/roles/add-role', locale as Locale))
                }}
                startIcon={<i className='ri-add-line' />}
              >
                Add Role
              </Button>
            )
          )}
        </CardContent>

        {loading ? (
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  {[...Array(3)].map((_, index) => (
                    <th key={index}>
                      <Skeleton variant='text' height={50} width={100} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {[...Array(3)].map((_, colIndex) => (
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
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {!header.isPlaceholder && (
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
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-4'>
                      No data available
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <TablePagination
          // className='border-bs'
          component='div'
          count={totalRows}
          page={page} // 0-based index
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      {deleteOpen && (
        <DeleteGialog
          open={deleteOpen}
          setOpen={setDeleteOpen}
          type={'delete-role'}
          onConfirm={deleteUser}
          selectedDeleteStatus=''
        />
      )}
    </>
  )
}

export default RolesTable
