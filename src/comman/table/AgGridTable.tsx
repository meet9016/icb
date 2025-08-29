'use client'

import React, { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const AgGridTable = () => {
  const rowData = [
    { id: 1, email: 'john@example.com', age: 25 },
    { id: 2, email: 'jane@example.com', age: 30 },
    { id: 3, email: 'alice@example.com', age: 28 }
  ]

  const columnDefs = useMemo(() => [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'age', headerName: 'Age', width: 100 },
    {
      headerName: 'Action',
      field: 'action',
      width: 130,
      sortable: false,
      filter: false,
      cellRendererFramework: (params: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => alert(`Edit: ${params.data.email}`)}
            >
              dgfgd
              {/* <EditIcon fontSize="small" /> */}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => alert(`Delete: ${params.data.email}`)}
            >
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        </div>
      )
    }
  ], [])

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          resizable: true,
          sortable: true,
          filter: true
        }}
      />
    </div>
  )
}

export default AgGridTable
