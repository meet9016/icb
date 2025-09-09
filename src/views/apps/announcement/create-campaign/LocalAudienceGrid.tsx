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
  themeQuartz
} from 'ag-grid-community'
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, RowGroupingModule } from 'ag-grid-enterprise'
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
  ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : [])
])

export interface Props {
  setSelectedIds: any
  selectedData: any
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

const LocalAudienceGrid = ({ setSelectedIds, selectedData }: Props) => {
  const gridRef = useRef<AgGridReact<any>>(null)
  const { settings } = useSettings()

  const containerStyle = useMemo(() => ({ width: '100%', height: '50vh' }), [])
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), [])

  const [columnDefs] = useState([
    { field: 'role_name', rowGroup: true, hide: true },
    { field: 'full_name', headerName: 'Full Name' },
    { field: 'email' },
    { field: 'username', headerName: 'User Name' }
  ])
  const defaultColDef = useMemo(() => ({
    flex: 1, minWidth: 120, resizable: true, sortable: true, filter: true
  }), [])

  const autoGroupColumnDef = useMemo(() => ({
    headerName: 'Role',
    field: 'role_name',
    minWidth: 250,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    cellRendererParams: { suppressCount: true }
  }), [])

  const pagination = true
  const paginationPageSize = 10
  const paginationPageSizeSelector = [10, 20, 50, 100]

  const selectCheckedRows = useCallback(() => {
    if (!gridRef.current?.api) return
    gridRef.current.api.forEachNode(node => {
      if (!node.group && node.data?.check) {
        node.setSelected(true)
      }
    })
  }, [])

  /* ---------- events ---------- */
  const onGridReady = useCallback((params) => {
    // cache api if you need it elsewhere
  }, [])

  // fires AFTER the grid has processed the new data
  const onModelUpdated = useCallback(() => {
    selectCheckedRows()
  }, [selectCheckedRows])

  const onSelectionChanged = useCallback(() => {
    if (!gridRef.current?.api) return
    const ids = gridRef.current.api.getSelectedNodes()
                .map(n => n.data?.id)
                .filter(Boolean)
    setSelectedIds(ids)
  }, [setSelectedIds])

  /* ---------- theme ---------- */
  useEffect(() => {
    document.body.dataset.agThemeMode =
      settings.mode === 'light' ? 'light-red' : 'dark-red'
  }, [settings])

  /* ---------- render ---------- */
  return (
    <div style={containerStyle}>
      <div className="example-wrapper">
        <div style={gridStyle}>
          <AgGridReact
            ref={gridRef}
            theme={theme}
            rowData={selectedData}          // <= will trigger onModelUpdated
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={autoGroupColumnDef}
            rowSelection="multiple"
            groupSelectsChildren
            groupSelects="descendants"
            suppressRowClickSelection
            animateRows
            suppressAggFuncInHeader
            pagination={pagination}
            paginationPageSize={paginationPageSize}
            paginationPageSizeSelector={paginationPageSizeSelector}
            onGridReady={onGridReady}
            onModelUpdated={onModelUpdated}
            onSelectionChanged={onSelectionChanged}
            groupIncludeFooter
            overlayNoRowsTemplate='<span>Choose filters to display data</span>'
          />
        </div>
      </div>
    </div>
  )
}
export default LocalAudienceGrid
