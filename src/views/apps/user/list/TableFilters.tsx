'use client'

import { useState, useEffect } from 'react'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid2'
import { api } from '@/utils/axiosInstance'
import { optionCommon } from '@/utils/optionComman'
import { Autocomplete, Skeleton, TextField } from '@mui/material'
import { Controller } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
export interface TableFiltersProps {
  role: string
  setRole: (role: string) => void
  status: string
  setStatus: (status: string) => void
  rolesList: { id: string | number; name: string }[]
  setContactType: (status: string) => void
  contactType: string
  contactSelection: string
}

const TableFilters = ({
  role,
  setRole,
  status,
  setStatus,
  contactType,
  setContactType,
  rolesList,
  contactSelection
}: TableFiltersProps) => {
  const [loading, setLoading] = useState(false)
  const connection = useSelector((state: RootState) => state.dataLack)

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          {loading ? (
            <Skeleton variant='rounded' height={55} />
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
                renderInput={params => <TextField {...params} label='Select Role' />}
                clearOnEscape
              />
            </FormControl>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          {loading ? (
            <Skeleton variant='rounded' height={55} />
          ) : (
            <FormControl fullWidth>
              <Autocomplete
                fullWidth
                options={optionCommon}
                getOptionLabel={option => option.name}
                value={optionCommon.find(item => item.value === status) || null}
                onChange={(event, newValue) => {
                  setStatus(newValue ? newValue.value : '')
                }}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderInput={params => <TextField {...params} label='Select Status' />}
                clearOnEscape
              />
            </FormControl>
          )}
        </Grid>
        {Number(connection?.connectDataLack) === 1 && (
          <Grid size={{ xs: 12, sm: 4 }}>
            {loading ? (
              <Skeleton variant='rounded' height={55} />
            ) : (
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  fullWidth
                  options={contactSelection}
                  getOptionLabel={option => option.name}
                  value={contactSelection.filter(item => contactType.includes(item.value))} // Filter the selected options
                  onChange={(event, newValue) => {
                    setContactType(newValue.map(item => item.value)) // Update with selected values
                  }}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  renderInput={params => <TextField {...params} label='Contact Type' />}
                  clearOnEscape
                />
              </FormControl>
              // <FormControl>
              //   <Controller
              //     name='role'
              //     control={control}
              //     rules={{ required: 'Role is required' }}
              //     render={({ field }) => (
              //       <FormControl fullWidth error={!!errors.role}>
              //         <InputLabel id='demo-multiple-checkbox-label'>Select Roles</InputLabel>
              //         <Select
              //           labelId='role-select-label'
              //           id='role-multiple-select'
              //           multiple
              //           value={field.value || []}
              //           onChange={event => {
              //             const value = event.target.value
              //             field.onChange(typeof value === 'string' ? value.split(',').map(Number) : value)
              //           }}
              //           input={<OutlinedInput label='Select Roles' />}
              //           renderValue={selected => (
              //             <div className='flex flex-wrap gap-2'>
              //               {(selected as number[]).map(roleId => {
              //                 const roleName = rolesList.find(r => r.id === roleId)?.name
              //                 return (
              //                   <Chip
              //                     key={roleId}
              //                     label={roleName}
              //                     size='small'
              //                     onDelete={() => {
              //                       if (roleName !== 'default') {
              //                         field.onChange(field.value.filter((id: number) => id !== roleId))
              //                       }
              //                     }}
              //                     // onDelete={() =>
              //                     //   field.onChange(field.value.filter((id: number) => id !== roleId))
              //                     // }
              //                     deleteIcon={
              //                       <i className='ri-close-circle-fill' onMouseDown={event => event.stopPropagation()} />
              //                     }
              //                   />
              //                 )
              //               })}
              //             </div>
              //           )}
              //           MenuProps={{
              //             PaperProps: {
              //               style: {
              //                 maxHeight: 300,
              //                 width: 250
              //               }
              //             }
              //           }}
              //         >
              //           {rolesList
              //             .filter(item => {
              //               // Hide 'default' role when selectedUser exists
              //               if (item.name === 'default' && selectedUser) return false
              //               return true
              //             })
              //             .map(item => (
              //               <MenuItem key={item.id} value={item.id}>
              //                 <Checkbox checked={field.value?.includes(item.id)} />
              //                 <ListItemText primary={item.name} />
              //               </MenuItem>
              //             ))}
              //         </Select>
              //         {/* <FormHelperText>{errors.role?.message}</FormHelperText> */}
              //       </FormControl>
              //     )}
              //   />
              //   {/* <FormHelperText>Select one or more roles</FormHelperText> */}
              // </FormControl>
            )}
          </Grid>
        )}
      </Grid>
    </CardContent>
  )
}

export default TableFilters
