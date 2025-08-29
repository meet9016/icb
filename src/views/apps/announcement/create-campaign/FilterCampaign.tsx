import React from 'react'
import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Autocomplete,
  Card,
  MenuItem,
  InputAdornment,
  Tooltip,
  Stack,
  Skeleton,
  Chip,
  Paper
} from '@mui/material'
import {
  awardCodeDropDown,
  awardDescriptionDropDown,
  classCodeDropDown,
  contactTypeDropDown,
  employeeStatusDropDown,
  genderDropDown,
  houseDropDown,
  positionTitleDropDown,
  roleCodeDropDown,
  salutationtitleDropDown,
  staffPositionDropDown,
  studentStatusDropDown,
  yearGroupDropDown
} from '@/comman/dropdownOptions/DropdownOptions'

export interface Props {
  roleLoading: boolean
  connectDataLack: string | null
  rolesListDataLack: any
  selectedLabelsDataLack: any
  commanColumnFilter: any
  rolesList: any
  selectedLabels: any
  setCommanColumnFilter: any
  studentForm?: any
  teacherForm?: any
  parentForm?: any
  setStudentForm?: any
  setTeacherForm?: any
  setParentForm?: any
  filterWishDataLack?: any
  filterWishSelectedLabelsDataLack?: any
  setFilterWishSelectedLabelsDataLack?: any
  setSelectedLabelsDataLack?: any
  selectedData?: any
  goFilterData?: any
  setSelectedData?: any
  setSelectedLabels?: any
  setFilterWishCommonColumn?: any
  filterWishCommonColumn?: any
}
const FilterCampaign = ({
  roleLoading,
  connectDataLack,
  rolesListDataLack,
  selectedLabelsDataLack,
  commanColumnFilter,
  rolesList,
  selectedLabels,
  setCommanColumnFilter,
  studentForm,
  teacherForm,
  parentForm,
  setStudentForm,
  setTeacherForm,
  setParentForm,
  filterWishDataLack,
  filterWishSelectedLabelsDataLack,
  setFilterWishSelectedLabelsDataLack,
  setSelectedLabelsDataLack,
  selectedData,
  goFilterData,
  setSelectedData,
  setSelectedLabels,
  filterWishCommonColumn,
  setFilterWishCommonColumn
}: Props) => {
  //Comman Column Filter
  // const handleSelectCommonColumn = (id: number) => {
  //   setFilterWishCommonColumn((prev: any) =>
  //     prev.includes(id) ? prev.filter((item: any) => item !== id) : [...prev, id]
  //   )
  // }

  const handleSelectCommonColumn = (id: string) => {
    setFilterWishCommonColumn((prev: any) =>
      prev.includes(id) ? prev.filter((item: any) => item !== id) : [...prev, id]
    )
  }

  // type of selection state
  type SelectedItem = { id: number; role: string }

  // toggle selection scoped by BOTH id and role
  const handleSelect = (id: number, roleName: string) => {
    setFilterWishSelectedLabelsDataLack(prev => {
      const idx = prev.findIndex(x => x.id === id && x.role === roleName)
      if (idx !== -1) {
        return prev.filter((_, i) => i !== idx) // remove only that role's chip
      }
      return [...prev, { id, role: roleName }]
    })
  }

  const handleChangeColumnFilter = (field: string, value: string) => {
    setCommanColumnFilter((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFilterChange = (newValues: any) => {
    setSelectedLabels(newValues)
  }

  const handleChangeParentColumnFilter = (field: string, value: string) => {
    setParentForm((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChangeTeacherForm = (field: string, value: any) => {
    setTeacherForm((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChangeStudentForm = (field: string, value: any) => {
    setStudentForm((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFilterChangeDataLack = (newValues: any) => {
    setSelectedLabelsDataLack(newValues)

    if (newValues && newValues.length > 0) {
    } else {
      setSelectedData([]) // or show all
    }
  }

  const array = [
    { id: 'f_name', name: 'First Name' },
    { id: 'l_name', name: 'Last Name' },
    // { id: 'email', name: 'Email' },
    // { id: 'phone', name: 'Phone' },
    { id: 'gender', name: 'Gender' }
  ]

  const commonColumnData = array.reduce((acc: any, item: any) => {
    if (!acc[item.rol_name]) acc[item.rol_name] = []
    acc[item.rol_name].push(item)
    return acc
  }, {})

  const excludedIds = ['last_name', 'first_name', 'gender']

  const filteredData = filterWishDataLack.filter(item => !excludedIds.includes(item.id))
  const groupedDataRoleWise = filteredData?.reduce((acc: any, item: any) => {
    if (!acc[item.rol_name]) acc[item.rol_name] = []
    acc[item.rol_name].push(item)
    return acc
  }, {})
  const groupedData = filterWishDataLack?.reduce((acc: any, item: any) => {
    if (!acc[item.rol_name]) acc[item.rol_name] = []
    acc[item.rol_name].push(item)
    return acc
  }, {})

  const roleChipColors: Record<string, string> = {
    parent: 'rgb(102 108 255 / 0.32)', // green
    teacher: 'rgb(109 120 141 / 0.32)', // red
    student: 'rgb(255 77 73 / 0.32)' // blue
  }
  return (
    <>
      <Card sx={{ mt: 4 }}>
        <Box p={6}>
          {/* Audience Selection */}
          <Typography variant='h6' fontWeight={600} mb={3}>
            Select Roles
          </Typography>
          {roleLoading ? (
            <Grid container spacing={2}>
              <Grid item>
                <Skeleton variant='rectangular' width={600} height={56} className='rounded-md' />
              </Grid>
            </Grid>
          ) : connectDataLack ? (
            <>
              <Grid item xs={12} md={12}>
                <Stack spacing={3}>
                  {/* Top Row: Role Select + Go Button */}
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={rolesListDataLack}
                      getOptionLabel={option => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={selectedLabelsDataLack}
                      onChange={(event, newValue) => handleFilterChangeDataLack(newValue)}
                      sx={{ width: 600 }}
                      renderInput={params => <TextField {...params} />}
                    />
                  </Stack>

                  {/* <Typography variant='h6' fontWeight={600}>
                    Comman Columns
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={2}>
                      <TextField
                        label='First name'
                        fullWidth
                        value={commanColumnFilter.first_name}
                        onChange={e => handleChangeColumnFilter('first_name', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        label='Last name'
                        fullWidth
                        value={commanColumnFilter.last_name}
                        onChange={e => handleChangeColumnFilter('last_name', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        label='Email'
                        fullWidth
                        value={commanColumnFilter.email}
                        onChange={e => handleChangeColumnFilter('email', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        label='Phone'
                        fullWidth
                        value={commanColumnFilter.phone}
                        onChange={e => handleChangeColumnFilter('phone', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        label='Gender'
                        select
                        fullWidth
                        value={commanColumnFilter.gender}
                        onChange={e => handleChangeColumnFilter('gender', e.target.value)}
                      >
                        {genderDropDown.map((option, index) => (
                          <MenuItem key={index} value={option.value}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid> */}

                  {/* Role-wise Filters */}
                </Stack>
              </Grid>
            </>
          ) : (
            <Grid container spacing={2} mb={4}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={rolesList}
                getOptionLabel={option => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedLabels}
                onChange={(event, newValue) => handleFilterChange(newValue)}
                sx={{ width: 400, marginBottom: 2 }}
                renderInput={params => <TextField {...params} label='Select Roles' />}
              />
            </Grid>
          )}
        </Box>
      </Card>

      {selectedLabelsDataLack && selectedLabelsDataLack.length > 0 && (
        <>
          <Card sx={{ mt: 4 }}>
            <Box p={6}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Role-wise Filters
              </Typography>
              {selectedLabelsDataLack.some((val: any) => val.id === 'student') && (
                <>
                  <Typography variant='h6' fontWeight={600} sx={{ mt: 2 }}>
                    Students
                  </Typography>
                  <Grid container spacing={1}>
                    {(groupedData?.student || []).map((field: any, index: number) => (
                      <Grid item xs={12} md={2} key={index}>
                        {field.filter_values !== null ? (
                          <TextField
                            label={field.name}
                            select
                            fullWidth
                            value={studentForm?.[field.id] || []}
                            onChange={e => handleChangeStudentForm(field.id, e.target.value)}
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected: any) => selected.join(', ')
                            }}
                          >
                            {field.filter_values.split(',').map((option: string, i: number) => (
                              <MenuItem key={i} value={option.trim()}>
                                {option.trim()}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <TextField
                            label={field.name}
                            fullWidth
                            type={
                              field.id === 'dob' || field.id === 'entry_date' || field.id === 'exit_date'
                                ? 'date'
                                : 'text'
                            }
                            value={studentForm?.[field.id] || ''}
                            onChange={e => handleChangeStudentForm(field.id, e.target.value)}
                            InputLabelProps={
                              field.id === 'dob' || field.id === 'entry_date' || field.id === 'exit_date'
                                ? { shrink: true }
                                : {}
                            }
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
              {selectedLabelsDataLack.some((val: any) => val.id === 'parent') && (
                <>
                  <Typography variant='h6' fontWeight={600} sx={{ mt: 2 }}>
                    Parents
                  </Typography>
                  <Grid container spacing={1}>
                    {(groupedData?.parent || []).map((field: any, index: number) => (
                      <Grid item xs={12} md={2} key={index}>
                        {field.filter_values &&
                        field.filter_values !== null &&
                        typeof field.filter_values === 'string' ? (
                          <TextField
                            label={field.name}
                            select
                            fullWidth
                            value={parentForm?.[field.id] || []}
                            onChange={e => handleChangeParentColumnFilter(field.id, e.target.value)}
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected: any) => selected.join(', ')
                            }}
                          >
                            {field.filter_values.split(',').map((option: string, i: number) => (
                              <MenuItem key={i} value={option.trim()}>
                                {option.trim()}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <TextField
                            label={field.name}
                            fullWidth
                            value={parentForm?.[field.id] || ''}
                            onChange={e => handleChangeParentColumnFilter(field.id, e.target.value)}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
              {selectedLabelsDataLack.some((val: any) => val.id === 'teacher') && (
                <>
                  <Typography variant='h6' fontWeight={600} sx={{ mt: 2 }}>
                    Teachers
                  </Typography>
                  <Grid container spacing={1}>
                    {(groupedData?.teacher || []).map((field: any, index: number) => (
                      <Grid item xs={12} md={2} key={index}>
                        {field.filter_values !== null ? (
                          <TextField
                            label={field.name}
                            select
                            fullWidth
                            value={teacherForm?.[field.id] || []}
                            onChange={e => handleChangeTeacherForm(field.id, e.target.value)}
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected: any) => selected.join(', ')
                            }}
                          >
                            {field.filter_values.split(',').map((option: string, i: number) => (
                              <MenuItem key={i} value={option.trim()}>
                                {option.trim()}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <TextField
                            label={field.name}
                            fullWidth
                            type={
                              field.id === 'dob' || field.id === 'start_date' || field.id === 'end_date'
                                ? 'date'
                                : 'text'
                            }
                            value={teacherForm?.[field.id] || ''}
                            onChange={e => handleChangeTeacherForm(field.id, e.target.value)}
                            InputLabelProps={
                              field.id === 'dob' || field.id === 'start_date' || field.id === 'end_date'
                                ? { shrink: true }
                                : {}
                            }
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </Box>
          </Card>

          <Card sx={{ mt: 4 }}>
            <Box p={6}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3
                }}
              >
                {Object.keys(commonColumnData).map(role => {
                  if (!commonColumnData[role] || commonColumnData[role].length === 0) {
                    return null
                  }

                  return (
                    <Paper
                      key={role}
                      elevation={2}
                      sx={{
                        p: 3
                        // borderRadius: 1,
                        // border: '1px solid',
                        // borderColor: 'divider',
                        // backgroundColor: 'background.paper'
                      }}
                    >
                      {/* Section Title */}
                      <Typography
                        variant='subtitle1'
                        sx={{
                          mb: 2,
                          fontWeight: 700,
                          color: 'text.primary',
                          borderBottom: '2px solid #1f5634',
                          display: 'inline-block',
                          pb: 0.5,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}
                      >
                        Common Column
                      </Typography>

                      {/* Chips */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1.5
                        }}
                      >
                        {commonColumnData[role]?.map((item: any) => (
                          <Chip
                            key={item.id}
                            label={item.name}
                            onClick={() => handleSelectCommonColumn(item.id)}
                            clickable
                            variant={filterWishCommonColumn.includes(item.id) ? 'filled' : 'outlined'}
                            sx={{
                              borderRadius: '20px',
                              px: 1.5,
                              py: 0.5,
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              borderColor: filterWishCommonColumn.includes(item.id) ? '#1f5634' : 'grey.400',
                              backgroundColor: filterWishCommonColumn.includes(item.id) ? '#1f5634' : 'transparent',
                              color: filterWishCommonColumn.includes(item.id) ? 'white' : 'text.primary',
                              '&:hover': {
                                backgroundColor: filterWishCommonColumn.includes(item.id)
                                  ? '#144327'
                                  : 'rgba(31, 86, 52, 0.08)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  )
                })}

                {Object.keys(groupedDataRoleWise).map(role => {
                  if (!groupedDataRoleWise[role] || groupedDataRoleWise[role].length === 0) {
                    return null
                  }

                  return (
                    <Paper key={role} elevation={2} sx={{ p: 3 }}>
                      {/* Section Title */}
                      <Typography
                        variant='subtitle1'
                        sx={{
                          mb: 2,
                          fontWeight: 700,
                          color: 'text.primary',
                          borderBottom: '2px solid #bfc4c1ff',
                          display: 'inline-block',
                          pb: 0.5,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}
                      >
                        {role}
                      </Typography>

                      {/* Chips */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {groupedDataRoleWise[role].map((item: any) => {
                          const roleColor = roleChipColors[role.toLowerCase()] || '#1f5634'
                          // role-aware selection check
                          const isSelected = filterWishSelectedLabelsDataLack.some(
                            x => x.id === item.id && x.role === item.rol_name
                          )

                          return (
                            <Chip
                              key={`${item.rol_name}-${item.id}`} // unique per role + id
                              label={item.name}
                              onClick={() => handleSelect(item.id, item.rol_name)}
                              clickable
                              variant={isSelected ? 'filled' : 'outlined'}
                              sx={{
                                borderRadius: '20px',
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                borderColor: roleColor,
                                backgroundColor: isSelected ? roleColor : 'transparent',
                                color: isSelected ? '#5c5a5aff' : '#696767ff',
                                '&:hover': {
                                  backgroundColor: isSelected ? roleColor : `${roleColor}20`
                                }
                              }}
                            />
                          )
                        })}
                      </Box>
                    </Paper>
                  )
                })}
              </Box>
              <Button variant='contained' onClick={goFilterData} sx={{ height: 40, mt: 3 }}>
                Submit
              </Button>
            </Box>
          </Card>
        </>
      )}
    </>
  )
}

export default FilterCampaign
