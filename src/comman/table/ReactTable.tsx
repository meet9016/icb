'use client'

import '@tanstack/table-core'
import { useEffect, useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  type ColumnDef,
  type FilterFn,
  type ColumnFiltersState,
  type Table,
  type Column
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'
import Card from '@mui/material/Card'
import classnames from 'classnames'
import styles from '@core/styles/table.module.css'

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const Filter = ({ column, table }: { column: Column<any, unknown>; table: Table<any> }) => {
  const columnFilterValue = column.getFilterValue()

  return (
    <div className='flex gap-x-2'>
    <TextField
      fullWidth
      size='small'
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder='Search...'
      />
    </div>
  )
}

const ReactTable = ({
  data,
  columns,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
  className = ''
}: {
  data: any[],
  columns: ColumnDef<any, any>[],
  count: number,
  page: number,
  rowsPerPage: number,
  onPageChange: (event: unknown, newPage: number) => void, // ✅ Fixed typing
  onRowsPerPageChange: (newRowsPerPage: number) => void,   // ✅ Adjusted typing
  rowsPerPageOptions?: (number | { label: string, value: number })[],
  className?: string
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      columnFilters,
      globalFilter
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      <div className='overflow-x-auto'>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="h-[42px] text-xs"
                  >
                    {!header.isPlaceholder && (
                      <div
                        className="justify-center items-center"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getAllColumns().length} className='text-center'>No data available</td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        component='div'
        className={className}
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        SelectProps={{ inputProps: { 'aria-label': 'rows per page' } }}
        onPageChange={onPageChange}
        onRowsPerPageChange={e => onRowsPerPageChange(Number((e.target as HTMLInputElement).value))}
      />
    </Card>
  )
}

export default ReactTable
