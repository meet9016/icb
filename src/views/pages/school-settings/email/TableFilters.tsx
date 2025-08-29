'use client'

import { useState, useEffect } from 'react'
import {
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  Checkbox,
  Chip,
  ListItemText,
  SelectChangeEvent,
  Button,
  Grid
} from '@mui/material'

import { api } from '@/utils/axiosInstance'
import Loader from '@/components/Loader'

type Role = {
  id: string
  name: string
}

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

const TableFilters = ({ role, setRole }: { role: string[], setRole: (role: string[]) => void }) => {
  const [rolesList, setRolesList] = useState<Role[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        const response = await api.get<{ data: Role[] }>('roles')
        setRolesList(response.data.data)
      } catch (err) {
        console.error('Failed to fetch roles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value }
    } = event
    setRole(typeof value === 'string' ? value.split(',') : value)
  }

  return (
    <CardContent>
      {/* {loading && <Loader />} */}
      <Grid container spacing={5}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Select Roles</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-multiple-select"
              multiple
              value={role}
              onChange={handleRoleChange}
              input={<OutlinedInput label="Select Roles" />}
              renderValue={(selected) => (
                <div className="flex flex-wrap gap-2">
                  {(selected as string[]).map((id) => {
                    const roleName = rolesList.find((r) => r.id === id)?.name || `Role ${id}`
                    return (
                      <Chip
                        key={id}
                        label={roleName}
                        size="small"
                        onDelete={() => setRole(role.filter((rId) => rId !== id))}
                        deleteIcon={
                          <i
                            className="ri-close-circle-fill"
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        }
                      />
                    )
                  })}
                </div>
              )}
              MenuProps={MenuProps}
            >
              {rolesList.map(({ id, name }) => (
                <MenuItem key={id} value={id}>
                  <Checkbox checked={role.includes(id)} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          <Button variant="contained" className="max-sm:is-full">
            Save
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
