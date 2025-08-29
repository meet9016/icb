/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import '@tanstack/table-core';
// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import LinearProgress from '@mui/material/LinearProgress'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
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

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Types
import type { Locale } from '@configs/i18n'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Teacher Type
type Teacher = {
  id: string
  name: string
  subject: string
  avgClassScore: number
  classesHandled: number
  attendancePercentage: number
  image?: string
  color?: string
}

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
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Sample teacher data
const teacherData: Teacher[] = [
  {
    id: '1',
    name: 'Mr. Shah',
    subject: 'Math',
    avgClassScore: 82.5,
    classesHandled: 5,
    attendancePercentage: 90,
    color: 'primary',
    image: '/images/avatars/1.png'
  },
  {
    id: '2',
    name: 'Mrs. Mehta',
    subject: 'Science',
    avgClassScore: 76.3,
    classesHandled: 4,
    attendancePercentage: 88,
    color: 'success',
    image: '/images/avatars/2.png'
  },
  {
    id: '3',
    name: 'Ms. Trivedi',
    subject: 'English',
    avgClassScore: 85.1,
    classesHandled: 6,
    attendancePercentage: 92,
    color: 'warning',
    image: '/images/avatars/3.png'
  },
  {
    id: '4',
    name: 'Mr. Patel',
    subject: 'Computer Science',
    avgClassScore: 79.4,
    classesHandled: 3,
    attendancePercentage: 89,
    color: 'info',
    image: '/images/avatars/4.png'
  },
  {
    id: '5',
    name: 'Ms. Fernandes',
    subject: 'History',
    avgClassScore: 74.8,
    classesHandled: 5,
    attendancePercentage: 86,
    color: 'error',
    image: '/images/avatars/5.png'
  },
  {
    id: '6',
    name: 'Mr. Bhatt',
    subject: 'Geography',
    avgClassScore: 81.0,
    classesHandled: 4,
    attendancePercentage: 91,
    color: 'secondary',
    image: '/images/avatars/6.png'
  },
  {
    id: '7',
    name: 'Mrs. Kapoor',
    subject: 'Hindi',
    avgClassScore: 88.2,
    classesHandled: 6,
    attendancePercentage: 93,
    color: 'success',
    image: '/images/avatars/7.png'
  },
  {
    id: '8',
    name: 'Mr. Desai',
    subject: 'Art & Drawing',
    avgClassScore: 91.5,
    classesHandled: 2,
    attendancePercentage: 95,
    color: 'info',
    image: '/images/avatars/8.png'
  }
]


// Column Definitions
const columnHelper = createColumnHelper<Teacher>()

const CourseTable = ({courseData} : {courseData: any}) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data] = useState<Teacher[]>([...teacherData])
  const [globalFilter, setGlobalFilter] = useState('')

  // Hooks
  const { lang: locale } = useParams()

  const columns = useMemo<ColumnDef<Teacher, any>[]>(
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
      columnHelper.accessor('name', {
        header: 'Teacher Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {/* Fix: Ensure valid color types for MUI components */}
            <CustomAvatar 
              src={row.original.image} 
              variant='rounded' 
              skin='light' 
              color={row.original.color as "primary" | "secondary" | "success" | "error" | "warning" | "info"}
            >
              {row.original.name.charAt(0)}
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography
                component={Link}
                href={getLocalizedUrl('/apps/teacher/teacher-details', locale as Locale)}
                className='font-medium hover:text-primary'
                color='text.primary'
              >
                {row.original.name}
              </Typography>
              <Typography variant='body2' color='text.primary'>
                {row.original.subject}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('avgClassScore', {
        header: 'Avg Class Score',
        cell: ({ row }) => (
          <div className='flex items-center gap-4 min-is-48 '>
            <Typography className='font-medium' color='text.primary'>
              {`${row.original.avgClassScore}%`}
            </Typography>
            <LinearProgress
              color={
                row.original.avgClassScore >= 85
                  ? 'success'
                  : row.original.avgClassScore >= 75
                  ? 'primary'
                  : 'warning'
              }
              value={row.original.avgClassScore}
              variant='determinate'
              className='is-full bs-2'
            />
          </div>
        ),
        sortingFn: (rowA, rowB) => rowA.original.avgClassScore - rowB.original.avgClassScore
      }),
      columnHelper.accessor('classesHandled', {
        header: 'Classes Handled',
        cell: ({ row }) => (
          <Typography className='font-medium text-center mr-20' color='text.primary'>
            {row.original.classesHandled}
          </Typography>
        )
      }),
      columnHelper.accessor('attendancePercentage', {
        header: 'Attendance',
        cell: ({ row }) => (
          <div className='flex items-center gap-4 min-is-48'>
            <Typography className='font-medium' color='text.primary'>
              {`${row.original.attendancePercentage}%`}
            </Typography>
            <LinearProgress
              color={
                row.original.attendancePercentage >= 90
                  ? 'success'
                  : row.original.attendancePercentage >= 80
                  ? 'primary'
                  : 'warning'
              }
              value={row.original.attendancePercentage}
              variant='determinate'
              className='is-full bs-2'
            />
          </div>
        ),
        sortingFn: (rowA, rowB) => rowA.original.attendancePercentage - rowB.original.attendancePercentage
      })
    ],
    [locale]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 5
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      <CardHeader
        title='Teacher Performance Snapshot'
        action={
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Teachers'
          />
        }
        className='flex-wrap gap-4'
      />
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
        rowsPerPageOptions={[5, 10, 25]}
        component='div'
        className='border-bs'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
  )
}

export default CourseTable