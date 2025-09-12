import React, { useEffect, useRef } from 'react'
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
  Paper,
  Checkbox,
  ListItemText,
  FormControl
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
import { useSettings } from '@/@core/hooks/useSettings'

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
  columnSelectedEdit?: any
  filterWishSelectedRole?: any
  ids?: any
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
  setFilterWishCommonColumn,
  columnSelectedEdit,
  filterWishSelectedRole,
  ids
}: Props) => {
  //Comman Column Filter
  // const handleSelectCommonColumn = (id: number) => {
  //   setFilterWishCommonColumn((prev: any) =>
  //     prev.includes(id) ? prev.filter((item: any) => item !== id) : [...prev, id]
  //   )
  // }
  const { settings } = useSettings()

  const handleSelectCommonColumn = (id: string) => {
    setFilterWishCommonColumn((prev: any) =>
      prev.includes(id) ? prev.filter((item: any) => item !== id) : [...prev, id]
    )
  }

  // type of selection state
  type SelectedItem = { id: number; role: string }

  // toggle selection scoped by BOTH id and role
  const handleSelect = (id: number, roleName: string) => {
    setFilterWishSelectedLabelsDataLack((prev: any) => {
      const idx = prev.findIndex((x: any) => x.id === id && x.role === roleName)
      if (idx !== -1) {
        return prev.filter((_: any, i: number) => i !== idx)
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
    // setParentForm
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

  // map any display field to internal role key
  const roleNameToKey = (opt: any) => {
    const v = (opt?.role ?? opt?.value ?? opt?.name ?? opt?.label ?? '').toString().toLowerCase()
    if (v === 'guardian' || v === 'parent') return 'parent'
    if (v === 'student') return 'student'
    if (v === 'teacher') return 'teacher'
    return null
  }

  // build defaults for a role
  const buildDefaultRowsForRole = (role: string) =>
    (defaultRoleSelections[role] || []).map((id: string) => ({ id, role }))

  // uniq by role:id
  const uniqByRoleId = (items: { id: string; role: string }[]) => {
    const seen = new Set<string>()
    return items.filter(it => {
      const key = `${it.role}:${it.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const handleFilterChangeDataLack = (newValues: any, reason: any, details: any) => {
    setSelectedLabelsDataLack(newValues)

    // optional: if nothing is selected → reset all
    if (!newValues || newValues.length === 0) {
      setSelectedData([]) // or reset all forms
    }
    if (reason === 'removeOption' && details?.option?.name === 'Parent') {
      setParentForm({
        par_code: '',
        par_name: '',
        contact_type: [],
        email: '',
        mobile_phone1: '',
        mobile_phone2: '',
        addr1: '',
        addr2: '',
        town_sub: '',
        state_code: '',
        post_code: '',
        home_phone: ''
      })
    } else if (reason === 'removeOption' && details?.option?.name === 'Teacher') {
      setTeacherForm({
        first_name: '',
        gender: '',
        teacher_code: '',
        emp_code: '',
        salutation: '',
        surname: '',
        other_name: '',
        preferred_name: '',
        dob: '',
        start_date: '',
        end_date: '',
        emp_status: '',
        award_code: '',
        award_description: '',
        rol_code: '',
        rol_description: '',
        position_title: '',
        p_mobile: '',
        p_email: '',
        school_email: ''
      })
    } else if (reason === 'removeOption' && details?.option?.name === 'Student') {
      setStudentForm({
        first_name: '',
        gender: '',
        last_name: '',
        mobile_phone1: '',
        email: '',
        par_code: '',
        student_code: '',
        preferred_name: '',
        year_group: '',
        class_code: '',
        dob: '',
        entry_date: '',
        exit_date: '',
        status: '',
        house: ''
      })
    }

    // 1) Chip delete → MUI gives reason='removeOption' and details.option = removed item (usually)
    if (reason === 'removeOption') {
      const removedRole = roleNameToKey(details?.option)
      if (removedRole) {
        // Clear ONLY that role’s fields
        setFilterWishSelectedLabelsDataLack?.((prev: { id: string; role: string }[]) =>
          (prev || []).filter(x => x.role !== removedRole)
        )
      }
    }

    // 2) Selecting a role in dropdown → reason='selectOption'
    //    Replace that role with defaults only
    if (reason === 'selectOption') {
      const addedRole = roleNameToKey(details?.option)
      if (addedRole) {
        setFilterWishSelectedLabelsDataLack?.((prev: { id: string; role: string }[]) => {
          const others = (prev || []).filter(x => x.role !== addedRole)
          const defaults = buildDefaultRowsForRole(addedRole)
          return uniqByRoleId([...others, ...defaults])
        })
      }
    }

    // 3) Clear all (X or Backspace) → reason='clear'
    if (reason === 'clear') {
      // Rebuild defaults for whatever roles still visible in newValues
      const rolesLeft: string[] = (newValues || []).map((o: any) => roleNameToKey(o)).filter(Boolean) as string[]

      setFilterWishSelectedLabelsDataLack?.(() => {
        const restored = rolesLeft.flatMap(r => buildDefaultRowsForRole(r!))
        return uniqByRoleId(restored)
      })
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

  //Default Parent, student, teacher selected
  const groupedDataRoleWise = filterWishDataLack?.reduce((acc: any, item: any) => {
    if (!acc[item.rol_name]) acc[item.rol_name] = []
    acc[item.rol_name].push(item)
    return acc
  }, {})

  /** Normalize helpers */
  const toKey = (s: any) =>
    String(s ?? '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

  const sameKey = (a: any, b: any) => toKey(a) === toKey(b)

  /** Role-wise default field keys (add synonyms you use) */
  const defaultRoleSelections: Record<string, string[]> = {
    parent: ['email', 'm_phone1', 'm_phone2', 'par_name'],
    student: ['first_name', 'last_name', 'email', 'gender', 'mobile_phone'],
    teacher: ['first_name', 'gender', 'p_mobile', 'other_name', 'p_email']
  }

  /** Track which roles have already been seeded (so each role seeds once) */
  const seededRolesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!groupedDataRoleWise || Object.keys(groupedDataRoleWise).length === 0) return

    Object.entries(groupedDataRoleWise).forEach(([roleKey, items]: [string, any[]]) => {
      if (!items || items.length === 0) return

      const roleNorm = toKey(roleKey)
      if (seededRolesRef.current.has(roleNorm)) return // already seeded this role

      const wanted = ids ? filterWishSelectedRole[roleNorm] : defaultRoleSelections[roleNorm]

      if (!wanted || wanted.length === 0) {
        // No defaults defined for this role: mark as seeded to avoid rechecking forever
        seededRolesRef.current.add(roleNorm)
        return
      }

      let didSeedForThisRole = false

      items.forEach(item => {
        const itemFieldKey = toKey(item?.name ?? item?.label ?? item?.key)
        if (!wanted.includes(itemFieldKey)) return

        const itemRole = item?.rol_name ?? roleKey // ensure same value you store in state
        const alreadySelected = filterWishSelectedLabelsDataLack?.some(
          (x: any) => x.id === item.id && sameKey(x.role, itemRole)
        )

        if (!alreadySelected) {
          handleSelect(item.id, itemRole) // your toggler should add when not selected
          didSeedForThisRole = true
        }
      })

      // Mark this role as seeded regardless (prevents repeated seeding loops)
      seededRolesRef.current.add(roleNorm)
    })
  }, [groupedDataRoleWise, filterWishSelectedLabelsDataLack, filterWishSelectedRole]) // runs when roles/items/state change

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

  //clear filter
  const clearStudentFilter = () => {
    setStudentForm({
      first_name: '',
      gender: '',
      last_name: '',
      mobile_phone1: '',
      email: '',
      par_code: '',
      student_code: '',
      preferred_name: '',
      year_group: '',
      class_code: '',
      dob: '',
      entry_date: '',
      exit_date: '',
      status: '',
      house: ''
    })
  }
  const clearParentFilter = () => {
    setParentForm({
      par_code: '',
      par_name: '',
      contact_type: [],
      email: '',
      mobile_phone1: '',
      mobile_phone2: '',
      addr1: '',
      addr2: '',
      town_sub: '',
      state_code: '',
      post_code: '',
      home_phone: ''
    })
  }
  const clearTeacherFilter = () => {
    setTeacherForm({
      first_name: '',
      gender: '',
      teacher_code: '',
      emp_code: '',
      salutation: '',
      surname: '',
      other_name: '',
      preferred_name: '',
      dob: '',
      start_date: '',
      end_date: '',
      emp_status: '',
      award_code: '',
      award_description: '',
      rol_code: '',
      rol_description: '',
      position_title: '',
      p_mobile: '',
      p_email: '',
      school_email: ''
    })
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
                  <FormControl>
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={rolesListDataLack}
                      getOptionLabel={option => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={selectedLabelsDataLack}
                      onChange={(event, newValue, reason, details) => {
                        handleFilterChangeDataLack(newValue, reason, details)
                      }}
                      sx={{ width: 600 }}
                      renderInput={params => <TextField {...params} />}
                    />
                  </FormControl>

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
                renderInput={params => <TextField {...params} />}
              />
            </Grid>
          )}
        </Box>
      </Card>

      {selectedLabelsDataLack && selectedLabelsDataLack.length > 0 && (
        <>
          <Card sx={{ mt: 4 }}>
            <Box p={6}>
              <Box display='flex' alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
                <Typography variant='h6' fontWeight={600}>
                  Role-wise Filters
                </Typography>
                {/* <Button variant='contained' onClick={clearAllFilter}>
                  Clear All Filters
                </Button> */}
              </Box>
              {selectedLabelsDataLack.some((val: any) => val.id === 'student') && (
                <>
                  <Box display='flex' alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
                    <Typography variant='h6' fontWeight={600} sx={{ mt: 4, mb: 4 }}>
                      Students
                    </Typography>
                    <Button variant='contained' onClick={clearStudentFilter}>
                      Clear Student Filters
                    </Button>
                  </Box>
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
                                {/* {option.trim()} */}
                                <Checkbox checked={(studentForm?.[field.id] || []).indexOf(option.trim()) > -1} />
                                <ListItemText primary={option.trim()} />
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
                  <Box display='flex' alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
                    <Typography variant='h6' fontWeight={600} sx={{ mt: 4, mb: 4 }}>
                      Parents
                    </Typography>
                    <Button variant='contained' onClick={clearParentFilter}>
                      Clear Parents Filters
                    </Button>
                  </Box>
                  <Grid container spacing={1}>
                    {(groupedData?.parent ?? []).map((field: any, index: number) => (
                      <Grid item xs={12} md={2} key={index}>
                        {/* {console.log('field.filter_values', field.filter_values)} */}

                        {field.filter_values !== null ? (
                          <TextField
                            label={field.name}
                            select
                            fullWidth
                            value={parentForm?.[field.id] || []}
                            onChange={e => handleChangeParentColumnFilter(field.id, e.target.value)}
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected: any) => {
                                // if JSON options → map ids back to labels
                                try {
                                  const parsed = JSON.parse(field.filter_values)
                                  if (Array.isArray(parsed)) {
                                    return selected
                                      .map((sel: any) => {
                                        const match = parsed.find((opt: any) => opt.contact_type === sel)
                                        return match ? match.contact_desc : sel
                                      })
                                      .join(', ')
                                  }
                                } catch {
                                  // fallback for comma-separated values
                                }
                                return selected.join(', ')
                              }
                            }}
                          >
                            {(() => {
                              let options: any[] = []
                              try {
                                const parsed = JSON.parse(field.filter_values)
                                if (
                                  Array.isArray(parsed) &&
                                  parsed.every(opt => opt.contact_type && opt.contact_desc)
                                ) {
                                  options = parsed.map((opt: any) => ({
                                    value: opt.contact_type,
                                    label: opt.contact_desc
                                  }))
                                } else {
                                  options = field.filter_values.split(',').map((opt: string) => ({
                                    value: opt.trim(),
                                    label: opt.trim()
                                  }))
                                }
                              } catch {
                                options = field.filter_values.split(',').map((opt: string) => ({
                                  value: opt.trim(),
                                  label: opt.trim()
                                }))
                              }

                              return options.map((opt, i) => (
                                <MenuItem key={i} value={opt.value}>
                                  {/* {opt.label} */}
                                  <Checkbox checked={(parentForm?.[field.id] || []).indexOf(opt.value) > -1} />
                                  <ListItemText primary={opt.label} />
                                </MenuItem>
                              ))
                            })()}
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
                  <Box display='flex' alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
                    <Typography variant='h6' fontWeight={600} sx={{ mt: 4, mb: 4 }}>
                      Teachers
                    </Typography>
                    <Button variant='contained' onClick={clearTeacherFilter}>
                      Clear Teachers Filters
                    </Button>
                  </Box>
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
                                {/* {option.trim()} */}
                                <Checkbox checked={(teacherForm?.[field.id] || []).indexOf(option.trim()) > -1} />
                                <ListItemText primary={option.trim()} />
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
                {/* Common Column Start */}
                {/* {Object.keys(commonColumnData).map(role => {
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
                })} */}
                {/* Common Column End  */}
                {/* {Object.keys(groupedDataRoleWise).map(role => {
                  if (!groupedDataRoleWise[role] || groupedDataRoleWise[role].length === 0) {
                    return null
                  }

                  return (
                    <Paper key={role} elevation={2} sx={{ p: 3 }}>
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
                })} */}

                {Object.keys(groupedDataRoleWise).map(roleKey => {
                  const items = groupedDataRoleWise[roleKey]
                  if (!items || items.length === 0) return null

                  const roleLower = toKey(roleKey)
                  const roleColor = roleChipColors[roleLower] || '#1f5634'

                  return (
                    <Paper key={roleKey} elevation={2} sx={{ p: 3 }}>
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
                        {roleKey}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {items.map((item: any) => {
                          const chipRole = item?.rol_name ?? roleKey

                          // ✅ selected purely from current state -> click toggles off too
                          const isSelected = filterWishSelectedLabelsDataLack?.some(
                            (x: any) => x.id === item.id && sameKey(x.role, chipRole)
                          )

                          return (
                            <Chip
                              key={`${chipRole}-${item.id}`}
                              label={item.name}
                              onClick={() => handleSelect(item.id, chipRole)}
                              clickable
                              variant={isSelected ? 'filled' : 'outlined'}
                              sx={{
                                borderRadius: '20px',
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.85rem',
                                fontWeight: 400,
                                borderColor: roleColor,
                                backgroundColor: isSelected ? roleColor : 'transparent',
                                color:
                                  settings.mode === 'light'
                                    ? isSelected
                                      ? '#676a7b'
                                      : '#676a7b'
                                    : isSelected
                                      ? '#eaeaff8c'
                                      : '#eaeaff8c',
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
