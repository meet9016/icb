'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './styles.css'
import { AgGridReact } from 'ag-grid-react'
import {
  ClientSideRowModelModule,
  QuickFilterModule,
  RowSelectionModule,
  ValidationModule,
  PaginationModule,
  themeQuartz,
  ColDef,
  GetRowIdParams
} from 'ag-grid-community'
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  RowGroupingModule,
  SetFilterModule
} from 'ag-grid-enterprise'
import { ModuleRegistry } from 'ag-grid-community'
import { RowApiModule } from 'ag-grid-community'
import { IconButton, Tooltip } from '@mui/material'
import { useSettings } from '@/@core/hooks/useSettings'
// Register required AG Grid modules
ModuleRegistry.registerModules([
  QuickFilterModule,
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  RowGroupingModule,
  RowSelectionModule,
  PaginationModule,
  RowApiModule,
  SetFilterModule,
  ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : [])
])

export interface Props {
  setSelectedIds: any
  selectedData: any
  connectDataLack: any
  selectedLabelsDataLack: any
}

const theme = themeQuartz
  .withParams(
    {
      backgroundColor: '#ffffffff',
      foregroundColor: '#3b2d37ff',
      browserColorScheme: 'light'
    },
    'light-red'
  )
  .withParams(
    {
      backgroundColor: '#30334e',
      foregroundColor: '#FFFFFFCC',
      browserColorScheme: 'dark'
    },
    'dark-red'
  )

const AudienceGrid = ({ setSelectedIds, selectedData, connectDataLack, selectedLabelsDataLack }: Props) => {
  const [column, setColumn] = useState<ColDef[]>([])

  const gridRef = useRef(null)
  // const gridRef = useRef<AgGridReact<any>>(null)
  const { settings } = useSettings()

  // const containerStyle = useMemo(() => ({ width: '100%', height: '50vh' }), [])
  // const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), [])
  // const [columnDefs] = useState([
  //   { field: 'role_name', rowGroup: true, hide: true },
  //   { field: 'full_name', headerName: 'Full Name' },
  //   { field: 'email' },
  //   { field: 'username', headerName: 'User Name' }
  // ])

  useEffect(() => {
    if (!selectedData) return

    // 👇 pick a sample object to infer columns from
    const sample = Array.isArray(selectedData)
      ? (selectedData[0]?.parent ?? selectedData[0] ?? null)
      : (selectedData.parent ?? selectedData)

    if (!sample || typeof sample !== 'object') return // nothing to build from

    const blacklist = new Set(['user_id', 'role_name', 'check', 'id', 'school_id', 'role_id', 'tenant_id'])

    const dynamicCols: ColDef[] = Object.keys(sample)
      .filter(key => !blacklist.has(key))
      .map(key => ({
        field: key,
        headerName: key.replace(/_/g, ' ').toUpperCase()
      }))

    // If role_name exists, add grouping column
    if ('role_name' in sample) {
      dynamicCols.unshift({
        field: 'role_name',
        rowGroup: true,
        hide: true,
        filter: true
      })
    }

    setColumn(dynamicCols)
  }, [selectedData])

  // const defaultColDef = useMemo(
  //   () => ({
  //     flex: 1,
  //     minWidth: 120,
  //     resizable: true,
  //     sortable: true,
  //     filter: true
  //   }),
  //   []
  // )

  const autoGroupColumnDef = useMemo(
    () => ({
      headerName: 'Role',
      field: 'role_name',
      minWidth: 250,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellRendererParams: {
        suppressCount: true
      }
    }),
    []
  )

  const pagination = true
  const paginationPageSize = 10
  const paginationPageSizeSelector = [10, 20, 50, 100]

  const handleSelectionChanged = () => {
    if (gridRef.current) {
      const selectedNodes = gridRef.current.api.getSelectedNodes()
      setSelectedIds(selectedNodes.map((node: any) => (node.data.id ? node.data.id : node.data.user_id)))
    }
  }

  useEffect(() => {
    document.body.dataset.agThemeMode = settings.mode === 'light' ? 'light-red' : 'dark-red'
  }, [settings])

  const onFirstDataRendered = useCallback((params: any) => {
    params.api.forEachNode((node: any) => {
      if (!node.group && node.data?.check === true) {
        node.setSelected(true)
      }
    })
  }, [])
  const onRowDataUpdated = useCallback((params: any) => {
    params.api.forEachNode((node: any) => {
      if (!node.group && node.data?.check === true) {
        node.setSelected(true)
      }
    })
  }, [])
  // const buckets = { parent: parentArray, student: studentArray /*, teacher: teacherArray */ }

  const EXCLUDED = new Set(['check', 'user_id', 'table_id', 'source_table'])

  const toTitle = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const buildCols = (rows: any[]) => {
    if (!rows?.length) return []
    const keys = Object.keys(rows[0]).filter(k => !EXCLUDED.has(k)) // 👈 filter here

    return keys.map(field => ({
      field,
      headerName: toTitle(field),
      flex: 1,
      minWidth: 140,
      sortable: true,
      filter: true,
      resizable: true,
      valueGetter: (p: any) => {
        const v = p.data?.[field]
        if (Array.isArray(v)) return v.length ? v.join(', ') : '-'
        return v === '' || v === null || v === undefined ? '-' : v
      }
    }))
  }

  const onSelectionChanged = () => {
    if (gridRef.current) {
      const selectedNodes = gridRef.current.api.getSelectedNodes()
      setSelectedIds(selectedNodes.map((node: any) => (node.data.id ? node.data.id : node.data.user_id)))
    }
  }
  return (
    <>
      {/* {selectedLabelsDataLack.map(val => (
        <div style={containerStyle} key={val.id}>
          <h5 style={{ marginBottom: '8px' }}>{val.id.charAt(0).toUpperCase() + val.id.slice(1)}</h5>
          <div className='example-wrapper'>
            <div style={gridStyle}>
              <AgGridReact
                theme={theme}
                ref={gridRef}
                rowData={selectedData || []}
                columnDefs={connectDataLack ? column : columnDefs}
                defaultColDef={defaultColDef}
                autoGroupColumnDef={autoGroupColumnDef}
                rowSelection='multiple'
                groupSelectsChildren={true}
                groupSelects='descendants'
                animateRows={true}
                suppressAggFuncInHeader={true}
                suppressRowClickSelection={true}
                pagination={pagination}
                paginationPageSize={paginationPageSize}
                paginationPageSizeSelector={paginationPageSizeSelector}
                onSelectionChanged={handleSelectionChanged}
                groupIncludeFooter={true}
                onFirstDataRendered={onFirstDataRendered}
                onRowDataUpdated={onRowDataUpdated}
                overlayNoRowsTemplate={'<span>Choose filters to display data</span>'}
              />
            </div>
          </div>
        </div>
      ))} */}
      {/* <div style={containerStyle}>
      <div className='example-wrapper'>
        <div style={gridStyle}>
          <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} />
        </div>
      </div>
      </div> */}

      {Object.entries(selectedData).map(([role, rows]) =>
        Array.isArray(rows) && rows.length > 0 ? (
          <div key={role} className='rounded-lg border bg-white shadow-sm'>
            <div className='px-4 py-3 border-b'>
              <h3 className='text-base font-semibold'>{toTitle(role)}</h3>
              <p className='text-xs text-gray-500'>{rows.length} records</p>
            </div>
            <div className='p-4'>
              <div className='ag-theme-quartz' style={{ width: '100%', height: 420 }}>
                <AgGridReact
                  ref={gridRef}
                  rowData={rows}
                  columnDefs={[
                    {
                      headerName: '',
                      checkboxSelection: true,
                      headerCheckboxSelection: true,
                      width: 50,
                      pinned: 'left',
                      sortable: false, // 👈 disable sorting
                      filter: false // 👈 disable filtering
                    },
                    ...buildCols(rows) // rest of your dynamic columns
                  ]}
                  onFirstDataRendered={onFirstDataRendered}
                  defaultColDef={{ flex: 1, resizable: true, filter: true }}
                  rowSelection='multiple'
                  suppressRowClickSelection={true}
                  suppressCellFocus
                  overlayNoRowsTemplate={'<span style="padding:10px;">No data</span>'}
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 25, 50, 100]}
                  onSelectionChanged={onSelectionChanged}
                />
              </div>
            </div>
          </div>
        ) : null
      )}
    </>
  )
}
export default AudienceGrid
