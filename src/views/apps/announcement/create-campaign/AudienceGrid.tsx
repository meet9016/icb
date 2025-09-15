'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { Typography } from '@mui/material'
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
  setSelectRowId: any
  selectRowId: any
  filterWishSelectedLabelsDataLack: any
  selectedLabelsDataLack: any
}

type RoleKey = 'student' | 'parent' | 'teacher'

type SelectRowBuckets = {
  student: string[]
  parent: string[]
  teacher: string[]
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

const AudienceGrid = ({
  setSelectedIds,
  selectedData,
  setSelectRowId,
  selectRowId,
  filterWishSelectedLabelsDataLack,
  selectedLabelsDataLack
}: Props) => {
  const { settings } = useSettings()
  const [column, setColumn] = useState<ColDef[]>([])
  const [selectedRole, setSelectedRole] = useState('student') // default one checked

  const handleChange = role => {
    setSelectedRole(role) // always replace, so only one is true
  }

  const gridRef = useRef(null)
  // const gridRef = useRef<AgGridReact<any>>(null)

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

  // keep APIs per role
  const apiByRoleRef = useRef<Record<string, any>>({})

  // keep selected IDs per role
  const selectedIdsByRoleRef = useRef<Record<string, string[]>>({})

  // helper to Title Case
  const toTitle = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  // exclude some fields
  const EXCLUDED = new Set([
    'guardian_id',
    'student_id',
    'check',
    'user_id',
    'table_id',
    'source_table',
    'contact_type'
  ])

  // mapping for specific field headers
  const HEADER_MAP: Record<string, string> = {
    par_name: 'Parent Name',
    m_phone1: 'Mobile Phone 1',
    m_phone2: 'Mobile Phone 2',
    home_phone: 'Home Phone',
    contact_type: 'Contact Type',
    contact_type_value: 'Contact Type Value',
    par_code: 'Parent Code',
    dob: 'Date of Birth',
    addr1: 'Address 1',
    add2: 'Address 2',
    tch_code: 'Teacher Code',
    emp_code: 'Employee Code',
    emp_status: 'Employee Status',
    p_email: 'Personal Email',
    p_mobile: 'Personal Mobile'
  }

  // const buildCols = (rows: any[]) => {
  //   if (!rows?.length) return []
  //   const keys = Object.keys(rows[0]).filter(k => !EXCLUDED.has(k))
  //   return keys.map(field => ({
  //     field,
  //     headerName: HEADER_MAP[field] || toTitle(field), // use map first, fallback to toTitle
  //     flex: 1,
  //     minWidth: 140,
  //     sortable: true,
  //     filter: true,
  //     resizable: true,
  //     valueGetter: (p: any) => {
  //       if (!p.data || !(field in p.data)) {
  //         return '-'
  //       }

  //       const v = p.data[field]

  //       if (Array.isArray(v)) {
  //         return v.length ? v.join(', ') : '-'
  //       }

  //       return v === '' || v === null || v === undefined ? '-' : v
  //     }
  //   }))
  // }

  const buildCols = (rows: any[], role: string) => {
    if (!rows?.length) return []

    const allowedFields = filterWishSelectedLabelsDataLack.filter((f: any) => f.role === role).map((f: any) => f.id)

    return allowedFields.map(field => ({
      field,
      headerName: HEADER_MAP[field] || toTitle(field),
      flex: 1,
      minWidth: 140,
      sortable: true,
      filter: true,
      resizable: true,
      valueGetter: (p: any) => {
        if (!p.data || !(field in p.data)) {
          return '-'
        }

        const v = p.data[field]
        if (Array.isArray(v)) return v.length ? v.join(', ') : '-'
        return v === '' || v === null || v === undefined ? '-' : v
      }
    }))
  }

  // ✅ per-grid first render auto-select for rows with check === true
  const onFirstDataRenderedFactory = (role: string) => (params: any) => {
    params.api.forEachNode((node: any) => {
      if (!node.group && node.data?.check === true) {
        node.setSelected(true)
      }
    })
    // after seeding selection, update merged state once
    const nodes = params.api.getSelectedNodes()
    selectedIdsByRoleRef.current[role] = nodes.map((n: any) => n.data.id ?? n.data.user_id)
    const merged = Object.values(selectedIdsByRoleRef.current).flat()
    setSelectedIds(merged)
    setSelectRowId(merged)
  }

  const [roleCount, setRoleCount] = useState<number>(0)

  // user_id get
  const onSelectionChangedFactory = (role: string) => (params: any) => {
    const nodes = params.api.getSelectedNodes()
    const ids = nodes.map((n: any) => n.data.id ?? n.data.user_id)
    // console.log('nodes', ids)
    const roleCount = ids.length

    // console.log(`${role} selected count:`, roleCount)
    // setRoleCount()
    selectedIdsByRoleRef.current[role] = ids

    const merged = Object.values(selectedIdsByRoleRef.current).flat()
    setSelectedIds(merged)
    setSelectRowId(merged)
  }

  // 1) Stamp each row with a stable, per-grid unique key based on index
  const withStableKeys = (role: string, rows: any[]) =>
    (rows || []).map((r, idx) => ({
      ...r,
      __rid: `${role}__${idx}` // unique inside this grid regardless of user_id collisions
    }))

  const allowedRoles = selectedLabelsDataLack && selectedLabelsDataLack.map(item => item.id)
  return (
    <>
      {Object.entries(selectedData)
        .filter(([role]) => allowedRoles.includes(role))
        .map(
          ([role, rows]) =>
            Array.isArray(rows) &&
            rows.length > 0 && (
              <div key={role} style={{ color: settings.primaryColor }} className='rounded-lg border shadow-sm'>
                {/* <div className='px-4 py-3 border-b flex items-center justify-between'>
                <h3 className='text-base font-semibold'>
                  {toTitle(role === 'guardian' ? 'Parent' : (role as string))}
                </h3>
              </div> */}

                <Typography
                  className='px-5 py-3'
                  variant='subtitle1'
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    display: 'inline-block',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  {toTitle(role === 'guardian' ? 'Parent' : (role as string))}
                </Typography>
                <div className=''>
                  <div className='ag-theme-quartz' style={{ width: '100%', height: 420 }}>
                    <AgGridReact
                      theme={theme}
                      rowData={withStableKeys(role as string, rows as any[])}
                      getRowId={p => p.data.__rid}
                      columnDefs={[
                        {
                          headerName: '',
                          checkboxSelection: true,
                          headerCheckboxSelection: true,
                          width: 50,
                          pinned: 'left',
                          sortable: false,
                          filter: false
                        },
                        ...buildCols(rows as any[], role as string)
                      ]}
                      onFirstDataRendered={onFirstDataRenderedFactory(role as string)}
                      onSelectionChanged={onSelectionChangedFactory(role as string)}
                      defaultColDef={{ flex: 1, resizable: true, filter: true }}
                      rowSelection='multiple'
                      suppressRowClickSelection={true}
                      suppressCellFocus
                      overlayNoRowsTemplate={'<span style="padding:10px;">No data</span>'}
                      pagination={true}
                      paginationPageSize={25}
                      paginationPageSizeSelector={[25, 50, 100, 200, 500]}
                    />
                  </div>
                </div>
              </div>
            )
        )}
    </>
  )
}
export default AudienceGrid
