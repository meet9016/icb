'use client'
import '@tanstack/table-core';
// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'

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

import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import TableFilters from './TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { api } from '@/utils/axiosInstance';
import Loader from '@/components/Loader'
import { toast } from 'react-toastify';

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
  fullName: string;
  name: string
}

type UserCount = {
  active_count: number;
  inactive_count: number;
  [key: string]: any; // add more properties if needed
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({
    itemRank
  })
  return itemRank.passed
}

// Column Definitions
const columnHelper = createColumnHelper<UsersTypeWithAction>()

const UserListTable = ({ tableData }: { tableData?: UsersType[] }) => {

  const permissions = useSelector((state: RootState) => state.sidebarPermission)

  const [rowSelection, setRowSelection] = useState({})
  const [role, setRole] = useState<string[]>([])
  const [data, setData] = useState<UsersType[]>([])
  const [searchData, setSearchData] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState<UserCount>({ active_count: 0, inactive_count: 0 });
  const [paginationInfo, setPaginationInfo] = useState({
    page: 0,
    perPage: 10
  })

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
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
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => {
          const roleData = row.original.role;

          const roles = Array.isArray(roleData) ? roleData : [];

          return (
            <div className='flex items-center gap-2'>
              {/* <Icon
              className={classnames('text-[22px]', userRoleObj[row.original.role].icon)}
              sx={{ color: `var(--mui-palette-${userRoleObj[row.original.role].color}-main)` }}
            /> */}
              {roles.length === 0 ? (
                <Typography className='capitalize' color='text.primary'>
                  {typeof roleData === 'string' ? roleData : '-'}
                </Typography>
              ) : (
                roles.map((user_role: { name: string }, index: number) => (
                  <Typography key={index} className='capitalize' color='text.primary'>
                    {user_role.name.toLowerCase()}
                    {index < roles.length - 1 && ','}
                  </Typography>
                ))
              )}
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, permissions]
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
        pageIndex: paginationInfo.page,
        pageSize: paginationInfo.perPage
      }
    },
    manualPagination: true,
    // enableRowSelection: true, //enable row selection for all rows
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
    getFacetedMinMaxValues: getFacetedMinMaxValues()
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

  useEffect(() => {
    fetchUsers()
  }, [role, searchData, paginationInfo])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const response = await api.get('user-get', {
        params: {
          role_id: role,
          search: searchData,
          per_page: paginationInfo.perPage,
          page: paginationInfo.page + 1,
          status: '',
          id: '',
        }
      })
      if (response.data.message === "Data not found for this User") {
        toast.error("Data not found for this User")
        setData([])
      }

      const users = response.data.users.data.map((user: {
        id: number;
        full_name: string;
        name: string;
        email: string;
        username: string;
        roles: { name: string }[];
        image: string;
        phone: string
      }) => ({
        id: user.id,
        fullName: user.full_name ?? '',
        name: user.name ?? '',
        email: user.email ?? '',
        username: user.username ?? '',
        role: user.roles ?? [],
        avatar: '',
        avatarColor: 'primary',
        image: user.image,
        phone: user.phone,
        // ✅ Add all required fields from UsersType
        company: 'N/A',
        country: 'N/A',
        currentPlan: 'enterprise'
      }))
      // setTotalRows(response.data) // get total from API if exists
      // setData(users)

    } catch (err: any) {
      return null
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* {loading && <Loader />} */}
      <Card>
        <TableFilters role={role} setRole={setRole} />
        <Divider />

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
        <TablePagination
          component='div'
          rowsPerPageOptions={[10, 25, 50]}
          className='border-bs'
          count={totalRows?.active_count + totalRows?.inactive_count}
          page={paginationInfo.page}
          rowsPerPage={paginationInfo.perPage}
          SelectProps={{ inputProps: { 'aria-label': 'rows per page' } }}
          onPageChange={(_, page) => {
            setPaginationInfo(prev => ({
              ...prev,
              page
            }))
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => {
            const newSize = Number(e.target.value)
            setPaginationInfo({
              page: 0,
              perPage: newSize
            })
            table.setPageSize(newSize)
            table.setPageIndex(0)
          }}
        />
      </Card>
    </>
  )
}

export default UserListTable
