'use client'

import { useState, useEffect } from 'react'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid2'
import { api } from '@/utils/axiosInstance'
import { optionCommon } from '@/utils/optionComman'
import { Autocomplete, Skeleton, TextField } from '@mui/material'
export interface TableFiltersProps {
  role: string
  setRole: (role: string) => void
  status: string
  setStatus: (status: string) => void
  rolesList: { id: string | number; name: string }[]
}

const TableFilters = ({ role, setRole, status, setStatus, rolesList }: TableFiltersProps) => {
  const [loading, setLoading] = useState(false)

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          {loading ? (
            <Skeleton variant="rounded" height={55} />
          ) : (
            <FormControl fullWidth>
              <Autocomplete
                fullWidth
                options={rolesList}
                getOptionLabel={(option: any) => option.name}
                value={rolesList.find((item: any) => item.id === role) || null}
                onChange={(event, newValue: any) => {
                  setRole(newValue ? newValue.id : '')
                }}
                isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Select Role" />
                )}
                clearOnEscape
              />
            </FormControl>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {loading ? (
            <Skeleton variant="rounded" height={55} />
          ) : (
            <FormControl fullWidth>
              <Autocomplete
                fullWidth
                options={optionCommon}
                getOptionLabel={(option) => option.name}
                value={optionCommon.find((item) => item.value === status) || null}
                onChange={(event, newValue) => {
                  setStatus(newValue ? newValue.value : '')
                }}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderInput={(params) => (
                  <TextField {...params} label="Select Status" />
                )}
                clearOnEscape
              />
            </FormControl>
          )}
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
