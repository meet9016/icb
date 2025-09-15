'use client'
import { Locale } from '@/configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'
// src/views/announcements/CampaignDialog.tsx
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
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AudienceGrid from './AudienceGrid'
import { RoleOption } from '../../user/list/AddUserDrawer'
import { api } from '@/utils/axiosInstance'
import endPointApi from '@/utils/endPointApi'
import { useSettings } from '@/@core/hooks/useSettings'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import dayjs, { Dayjs } from 'dayjs'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { toast } from 'react-toastify'
import CampaignViewLogDialog from '@/components/dialogs/campaign-view-log'
import {
  frequencyTypeDropDown,
  publishingModeType,
  scheduleTypeDropDown
} from '@/comman/dropdownOptions/DropdownOptions'
import { ShowErrorToast, ShowSuccessToast } from '@/comman/toastsCustom/Toast'
import Loader from '@/components/Loader'
import FilterCampaign from './FilterCampaign'
import { email } from 'valibot'
import LocalAudienceGrid from './LocalAudienceGrid'

type Role = {
  id: any
  name: string
}
const CreateCampaign = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const connection = useSelector((state: RootState) => state.dataLack)

  const announcementId = localStorage.getItem('announcementId')
  const searchParams = useSearchParams()
  const ids = atob(decodeURIComponent(searchParams.get('id') || ''))
  const adminStore = useSelector((state: RootState) => state.admin)

  const [selectedChannel, setSelectedChannel] = useState<string[]>([])
  const [showEditTimeChannel, setShowEditTimeChannel] = useState('')
  const [rolesList, setRolesList] = useState<RoleOption[]>([])
  const [selectedData, setSelectedData] = useState([])
  // const [selectedData, setSelectedData] = useState<any[]>([])
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(dayjs())
  //dataLack
  const [rolesListDataLack, setRolesListDataLack] = useState<RoleOption[]>([])
  const [selectedLabelsDataLack, setSelectedLabelsDataLack] = useState<Role[]>([])

  const [filterWishDataLack, setFilterWishDataLack] = useState<RoleOption[]>([])
  const [filterWishSelectedLabelsDataLack, setFilterWishSelectedLabelsDataLack] = useState([])
  const [filterWishCommonColumn, setFilterWishCommonColumn] = useState(['f_name', 'email', 'l_name', 'phone'])

  const [selectedIds, setSelectedIds] = useState([])
  const [status, setStatus] = useState('One Time')
  const [mode, setMode] = useState('one_time')
  const [scheduleType, setScheduleType] = useState('now')
  const [recurringCount, setRecurringCount] = useState<string>('')
  const [recurringType, setRecurringType] = useState('month')
  const [note, setNote] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [selectedLabels, setSelectedLabels] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openChart, setOpenChart] = useState(false)

  const [viewEmailLog, setViewEmailLog] = useState([])

  const [viewNotificationLog, setViewNotificationLog] = useState([])

  const [viewWhatsappLog, setViewWhatsappLog] = useState([])

  const [viewSmsLog, setViewSmsLog] = useState([])

  const [error, setError] = useState('')
  const [selectRowId, setSelectRowId] = useState([])

  //filterEdittime
  const [filterWishSelectedRole, setFilterWishSelectedRole] = useState<RoleOption[]>([])

  // Email
  const [paginationEmail, setPaginationEmail] = useState({ page: 0, perPage: 20 })
  const [totalRowsEmail, setTotalRowsEmail] = useState(0)

  // Notification
  const [paginationNotification, setPaginationNotification] = useState({ page: 0, perPage: 20 })
  const [totalRowsNotification, setTotalRowsNotification] = useState(0)

  //Whatsapp
  const [paginationWhatsapp, setPaginationWhatsapp] = useState({ page: 0, perPage: 20 })
  const [totalRowsWhatsapp, setTotalRowsWhatsapp] = useState(0)

  const [connectDataLack, setConnectDataLack] = useState('')
  const [roleLoading, setroleLoading] = useState(false)
  const [isLoading, setisLoading] = useState(false)
  const [loaderMain, setloaderMain] = useState(false)
  const [columnSelectedEdit, setColumnSelectedEdit] = useState()

  // Comman column Filter
  const [commanColumnFilter, setCommanColumnFilter] = useState<any>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: ''
  })

  const [parentForm, setParentForm] = useState<any>({
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

  const [teacherForm, setTeacherForm] = useState<any>({
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

  const [studentForm, setStudentForm] = useState<any>({
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

  const isRecurring = mode === 'recurring'

  const channels = [
    {
      key: 'wp',
      label: 'WhatsApp',
      icon: '<i class="ri-whatsapp-line"></i>',
      sub: 'WhatsApp messages',
      color: '#25D366',
      bg: '#E8F5E9',
      text: 'text-green-600'
    },
    {
      key: 'sms',
      label: 'SMS',
      icon: '<i class="ri-message-2-line"></i>',
      sub: 'SMS messages',
      bg: '#FCE7F3',
      color: '#DB2777',
      text: 'text-pink-600'
    },
    {
      key: 'email',
      label: 'Email',
      icon: '<i class="ri-mail-line"></i>',
      sub: 'Email notifications',
      bg: '#E0E7FF',
      color: '#4338CA',
      text: 'text-indigo-600'
    },
    {
      key: 'push_notification',
      label: 'Push',
      icon: '<i class="ri-notification-3-line"></i>',
      sub: 'Mobile app notification',
      bg: '#FEF9C3',
      color: '#CA8A04',
      text: 'text-yellow-600'
    }
  ]

  const channelMap: Record<string, string> = {
    wp: 'WhatsApp',
    push_notification: 'Mobile App Notification',
    email: 'Email',
    sms: 'SMS'
  }

  const handleFilterRoleUserChangeDataLack = (newValues: any) => {
    // setFilterWishSelectedLabelsDataLack(newValues)

    if (newValues && newValues.length > 0) {
    } else {
      setSelectedData([]) // or show all
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await api.get(`${endPointApi.getRolesDropdown}`)
      const roles: RoleOption[] = response.data.data
        .filter((r: any) => r.name !== 'Super Admin')
        .map((r: any) => ({ id: r.id, name: r.name }))
      setRolesList(roles)
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchDataLack = async () => {
    try {
      setroleLoading(true)
      const response = await api.get(`${endPointApi.getAllRolesDataLack}`)
      if (response.data.status === 'success') {
        const roles: RoleOption[] = response.data.roles.map((r: any) => ({
          id: r.rol_name,
          name: r.rol_name.charAt(0).toUpperCase() + r.rol_name.slice(1)
        }))
        setRolesListDataLack(roles)
        setroleLoading(false)
      }
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    fetchDataLack()
  }, [])

  const fetchFilterDataLack = async () => {
    setisLoading(true)
    try {
      const select = selectedLabelsDataLack.map((val: any) => val.id)

      const body = {
        roles: select,
        showOnlyRole: true
      }

      const res = await api.post(`${endPointApi.postfilterDataLack}`, body)
      if (res.data.status === 'success') {
        const filters = res.data.filters
        const allFilters: RoleOption[] = []

        if (filters.parent && Array.isArray(filters.parent)) {
          const parentFilters = filters.parent.map((item: any) => ({
            id: item.column_name,
            name: item.filter_name,
            rol_name: 'parent',
            filter_values: item.filter_values
          }))
          allFilters.push(...parentFilters)
        }

        if (filters.student && Array.isArray(filters.student)) {
          const studentFilters = filters.student.map((item: any) => ({
            id: item.column_name,
            name: item.filter_name,
            rol_name: 'student',
            filter_values: item.filter_values
          }))
          allFilters.push(...studentFilters)
        }

        if (filters.teacher && Array.isArray(filters.teacher)) {
          const teacherFilters = filters.teacher.map((item: any) => ({
            id: item.column_name,
            name: item.filter_name,
            rol_name: 'teacher',
            filter_values: item.filter_values
          }))
          allFilters.push(...teacherFilters)
        }
        setColumnSelectedEdit(res.data.column_names)
        setFilterWishDataLack(allFilters)
      }
    } catch (err) {
      console.error('Error fetching filter data:', err)
    } finally {
      setisLoading(false)
    }
  }

  useEffect(() => {
    if (!ids) {
      if (selectedLabelsDataLack.length > 0) {
        fetchFilterDataLack()
      }
    }
  }, [selectedLabelsDataLack])

  useEffect(() => {
    if (!ids && selectedLabels.length > 0) {
      const fetchRoleWiseUsers = async () => {
        try {
          const select = selectedLabels.map((val: any) => val.id)
          const body = {
            tenant_id: adminStore.tenant_id,
            school_id: adminStore.school_id,
            role_ids: select
          }
          const response = await api.post(`${endPointApi.postRoleWiseUsersList}`, body)
          setSelectedData(response.data.users)
        } catch (error) {
          console.error('Error fetching role-wise users:', error)
        }
      }
      fetchRoleWiseUsers()
    }
  }, [selectedLabels, ids])

  const fetchEditCampign = async () => {
    setloaderMain(true)
    try {
      //Filter api Start
      const body = {
        announcement_id: localStorage.getItem('announcementId'),
        campaign_id: ids,
        showOnlyRole: true,
        channel: 'push_notification',
        tenant_id: adminStore.tenant_id,
        school_id: adminStore.school_id
      }

      const resFilter = await api.post(`${endPointApi.postfilterDataLackEdit}`, body)

      // roles → selected labels
      const rolesArr: any[] = Array.isArray(resFilter?.data?.roles) ? resFilter.data.roles : []
      const selectedRoles = rolesArr.map((item: any) => ({
        id: item,
        name: String(item).charAt(0).toUpperCase() + String(item).slice(1)
      }))

      const toArray = (val: any): any[] => {
        if (Array.isArray(val)) return val
        if (val && typeof val === 'object') return Object.values(val)
        return []
      }
      // const firstUsers = toArray(resFilter?.data?.data)
      
      setSelectedData(resFilter?.data?.data)

      if (resFilter?.data?.status === 'true') {
        setSelectedLabelsDataLack(selectedRoles)
console.log("resFilter",resFilter?.data);

        const allFilters: RoleOption[] = []
        const filtersCatalog = resFilter?.data?.filters

        const initialStudentForm: Record<string, any> = {}
        const initialParentForm: Record<string, any> = {}
        const initialTeacherForm: Record<string, any> = {}

        const processRoleFilters = (
          roleFilters: any[] | undefined,
          roleName: string,
          initialFormState: Record<string, any>
        ) => {
          if (!Array.isArray(roleFilters)) return
      console.log("roleFilters",roleFilters);

          const processed: RoleOption[] = roleFilters.map((item: any) => {
            if (item?.update_value === true && item?.selected_filter_values !== null && item?.column_name) {
              let value = item.selected_filter_values

              if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1)
              }

              // dropdowns expect array; text expects string
              initialFormState[item.column_name] = item.filter_values !== null ? [value] : value
            }

            return {
              id: item.column_name,
              name: item.filter_name,
              rol_name: roleName,
              filter_values: item.filter_values,
              update_value: !!item.update_value,
              newfilter_column: item.newfilter_column ?? null
            }
          })

          allFilters.push(...processed)
        }
console.log("filtersCatalog",filtersCatalog);

        // fill role filters
        processRoleFilters(filtersCatalog?.parent, 'parent', initialParentForm)
        processRoleFilters(filtersCatalog?.student, 'student', initialStudentForm)
        processRoleFilters(filtersCatalog?.teacher, 'teacher', initialTeacherForm)

        // apply prefilled states
        if (Object.keys(initialParentForm).length) {
          setParentForm((prev: any) => ({ ...prev, ...initialParentForm }))
        }
        if (Object.keys(initialStudentForm).length) {
          setStudentForm((prev: any) => ({ ...prev, ...initialStudentForm }))
        }
        if (Object.keys(initialTeacherForm).length) {
          setTeacherForm((prev: any) => ({ ...prev, ...initialTeacherForm }))
        }
console.log("*****",resFilter?.data?.column_names);

        setFilterWishDataLack(allFilters)
        setFilterWishSelectedRole(resFilter?.data?.column_names)

        const formatted = resFilter?.data?.column_names?.split(',')?.map((val: any) => ({
          id: val,
          name: val
        }))
        console.log("formatted",formatted);
        
        setFilterWishSelectedLabelsDataLack(formatted)
      }
      //Filter api End

      //Schedule Api
      const res = await api.get(`${endPointApi.getCampaignAnnounceWise}`, {
        params: {
          announcement_id: localStorage.getItem('announcementId'),
          campaign_id: ids
        }
      })

      if (res?.data?.status === 200) {
        if (Array.isArray(res?.data?.role_only)) {
          const roleOnly = res.data.role_only.map((item: any) => ({
            id: item.role_id,
            name: item.role_name
          }))
          setSelectedLabels(roleOnly)
        }

        // column_name in this response might be string or array; handle both
        const toIdNameArray2 = (input: any) => {
          if (Array.isArray(input)) {
            return input
              .map((v: any) => {
                const s = String(v ?? '').trim()
                return s ? { id: s, name: s } : null
              })
              .filter(Boolean)
          }
          if (typeof input === 'string') {
            return input
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
              .map((v: string) => ({ id: v, name: v }))
          }
          return []
        }

        // If you need it for anything else later:
        // const formatted2 = toIdNameArray2(res?.data?.column_name);
        if (Number(connection?.connectDataLack) === 0) {
          setSelectedData(res?.data?.users || [])
        }
        const combinedDateTime = `${res?.data?.campaign_date} ${res?.data?.campaign_time}`
        setNote(res?.data?.note)
        setStatus(res?.data?.campaign_status)
        setMode(res?.data?.publish_mode)
        setScheduleType(res?.data?.schedule)
        setRecurringCount(res?.data?.frequency_count)
        setRecurringType(res?.data?.frequency_type)
        setSelectedChannel(res?.data?.channels)
        setShowEditTimeChannel(res?.data?.channel_name)
        setStartDateTime(dayjs(combinedDateTime, 'YYYY-MM-DD HH:mm'))
        setAnnouncementTitle(res?.data?.announcement?.title)
      }
    } catch (err: any) {
      if (err?.response?.status === 500) {
        toast.error('Internal Server Error.')
      } else {
        console.error('fetchEditCampign error:', err)
      }
    } finally {
      // Always turn off loader so UI doesn't get stuck
      setloaderMain(false)
    }
  }

  useEffect(() => {
    if (ids) {
      fetchEditCampign()
    }
  }, [ids])

  const statuses = ['Draft', 'Ready', 'In Progress', 'Stopped', 'Done'] as const
  type StatusType = (typeof statuses)[number]

  const scheduleDates = []
  const maxDates = Math.min(Number(recurringCount), 5) // ✅ limit to 5

  for (let i = 0; i < maxDates; i++) {
    let nextDate = dayjs(startDateTime).isValid() ? dayjs(startDateTime) : dayjs()

    switch (recurringType) {
      case 'year':
        nextDate = nextDate.add(i, 'year')
        break
      case 'month':
        nextDate = nextDate.add(i, 'month')
        break
      case 'week':
        nextDate = nextDate.add(i, 'week')
        break
      case 'day':
        nextDate = nextDate.add(i, 'day')
        break
    }

    scheduleDates.push(nextDate.format('DD-MM-YYYY'))
  }

  const toggleChannel = (key: string) => {
    setSelectedChannel(prev => {
      const safe = Array.isArray(prev) ? prev : []

      if (ids) {
        // Edit mode = single select
        return [key]
      } else {
        return safe.includes(key) ? safe.filter(k => k !== key) : [...safe, key]
      }
    })
  }

  const getViewLog = async () => {
    if (selectedChannel.includes('email')) {
      const formdata = new FormData()

      formdata.append('announcement_id', announcementId || '')
      formdata.append('campaign_id', ids)
      formdata.append('search', '')
      formdata.append('per_page', paginationEmail.perPage.toString())
      formdata.append('page', (paginationEmail.page + 1).toString())
      try {
        const res = await api.post(`${endPointApi.postCampaignEmailLogGet}`, formdata)
        setViewEmailLog(res.data)
        setTotalRowsEmail(res.data.total)
      } catch (err: any) {
        if (err.response?.status === 500) {
          toast.error('Internal Server Error.')
        } else {
          toast.error(err?.response?.data?.message || 'Something went wrong')
        }
      }
    }
  }

  useEffect(() => {
    getViewLog()
  }, [openDialog, paginationEmail.page, paginationEmail.perPage])

  const getNotificationViewLog = async () => {
    if (selectedChannel.includes('push_notification')) {
      const formdata = new FormData()

      formdata.append('announcement_id', announcementId || '')
      formdata.append('campaign_id', ids)
      formdata.append('search', '')
      formdata.append('per_page', paginationNotification.perPage.toString())
      formdata.append('page', (paginationNotification.page + 1).toString())
      try {
        const res = await api.post(`${endPointApi.postCampaignPushNotificationslogGet}`, formdata)

        setViewNotificationLog(res.data)
        setTotalRowsNotification(res.data.total)
      } catch (err: any) {
        if (err.response?.status === 500) {
          toast.error('Internal Server Error.')
        } else {
          toast.error(err?.response?.data?.message || 'Something went wrong')
        }
      }
    }
  }

  useEffect(() => {
    getNotificationViewLog()
  }, [openDialog, paginationNotification.page, paginationNotification.perPage])

  const getWhatsappViewLog = async () => {
    if (selectedChannel.includes('wp')) {
      const formdata = new FormData()

      formdata.append('announcement_id', announcementId || '')
      formdata.append('campaign_id', ids)
      formdata.append('search', '')
      formdata.append('per_page', paginationWhatsapp.perPage.toString())
      formdata.append('page', (paginationWhatsapp.page + 1).toString())
      try {
        const res = await api.post(`${endPointApi.postcampaignWhatsappLogGet}`, formdata)

        setViewWhatsappLog(res.data)
        setTotalRowsWhatsapp(res.data.total)
      } catch (err: any) {
        if (err.response?.status === 500) {
          toast.error('Internal Server Error.')
        } else {
          toast.error(err?.response?.data?.message || 'Something went wrong')
        }
      }
    }
  }

  useEffect(() => {
    getWhatsappViewLog()
  }, [openDialog, paginationWhatsapp.page, paginationWhatsapp.perPage])

  useEffect(() => {
    setConnectDataLack(connection?.connectDataLack)
  }, [])

  //filter
  function transformRoleData(role: string, data: Record<string, any>) {
    const result: Record<string, any> = {}

    Object.entries(data).forEach(([key, value]) => {
      // skip empty values
      if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
        return
      }

      // store array values as is
      if (Array.isArray(value)) {
        result[key] = value
      } else {
        // wrap non-empty scalars into string or array based on your need
        result[key] = value
      }
    })

    return { [role]: result }
  }

  const student = transformRoleData('student', studentForm)
  const parent = transformRoleData('parent', parentForm)
  const teacher = transformRoleData('teacher', teacherForm)

  const filters = { ...student, ...parent, ...teacher }

  //column
  type Item = { id: string; role: string }

  // Group items by role
  const groupByRole = (items: Item[]) =>
    items.reduce<Record<string, string[]>>((acc, { id, role }) => {
      if (!acc[role]) acc[role] = []
      if (!acc[role].includes(id)) acc[role].push(id)
      return acc
    }, {})

  // ✅ No defaults injected
  const grouped = groupByRole(filterWishSelectedLabelsDataLack)

  const goFilterData = async () => {
    setisLoading(true)

    try {
      const select = selectedLabelsDataLack.map((val: any) => val.id)
      // const selectColumn = filterWishSelectedLabelsDataLack.map((val: any) => val.id)

      const body = {
        roles: select,
        filters: filters,
        column_name: grouped,
        campaign_id: 0,
        announcement_id: 0,
        tenant_id: adminStore.tenant_id,
        school_id: adminStore.school_id.toString(),
        // page: 1,
        // per_page: 100,
        showOnlyRole: false
      }

      const res = await api.post(`${endPointApi.postfilterDataLack}`, body)

      if (res.data.status === 'success') {
        setSelectedData(res.data.data)
      } else {
        console.warn('Unexpected response:', res.data)
        // setFilterWishSelectedLabelsDataLack([])
        setFilterWishDataLack([])

        // Optionally: ShowErrorToast(res.data.message)
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      toast.error(err.message)
    } finally {
      setisLoading(false)
    }
  }

  useEffect(() => {
    if (selectedLabelsDataLack.length > 0) {
      goFilterData()
    }
  }, [])

  const launchCampaign = async (status: string) => {
    try {
      const repeatNum = Number(recurringCount)

      if (mode === 'recurring') {
        if (!recurringCount || isNaN(repeatNum) || repeatNum < 2 || repeatNum > 99) {
          setError('Please enter a number between 2 and 99')
          return
        }
      }

      // if (connectDataLack == 0) {
      if (!selectedIds || selectedIds.length === 0) {
        ShowErrorToast('Please select at least one user to launch the campaign.')
        return
      }
      // }

      if (mode === '') {
        ShowErrorToast('Please select publishing mode.')
        return
      }
      if (selectedChannel.length == 0 || !selectedChannel || selectedChannel == undefined) {
        ShowErrorToast('The Communication Channels required.')
        return
      }
      let date = ''
      let time = ''
      let timeampm = ''

      if (scheduleType === 'schedule') {
        const formatted = dayjs(startDateTime).format('YYYY-MM-DD HH:mm')
        const [datePart, timePart] = formatted.split(' ')
        date = datePart || ''
        time = timePart || ''
      } else {
        const formatted = dayjs(startDateTime).format('YYYY-MM-DD HH:mm')
        const [datePart, timePart] = formatted.split(' ')
        date = datePart || ''
        time = timePart || ''
      }
      const selectedFilter = filterWishSelectedLabelsDataLack.map((val: any) => val.id)

      const body = {
        id: ids ? Number(ids) : 0,
        note: note || '',
        announcements_id: localStorage.getItem('announcementId'),
        tenant_id: adminStore.tenant_id,
        school_id: adminStore.school_id,
        user_ids: selectedIds,
        channels: ids ? [selectedChannel] : selectedChannel,
        frequency_type: recurringType || '',
        campaign_status: status,
        publish_mode: mode,
        schedule: scheduleType || '',
        frequency_count: mode == 'one_time' ? 1 : recurringCount,
        campaign_date: scheduleType === 'schedule' ? date : dayjs().format('YYYY-MM-DD'),
        campaign_time: time,
        // campaign_ampm: 'am',
        // role_ids: '1',
        column_name: selectedFilter,
        filters: filters,
        db_selected_column: grouped
      }
      setisLoading(true)
      const response = await api.post(`${endPointApi.postLaunchCampaign}`, body)
      if (response.data.status === 200) {
        ShowSuccessToast(response.data.message)
        if (announcementId) {
          router.replace(
            getLocalizedUrl(
              `/apps/announcement/campaign?campaignId=${encodeURIComponent(btoa(announcementId))}`,
              locale as Locale
            )
          )
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
        } else {
          ShowErrorToast('Invalid announcementId')
          setisLoading(false)
        }
      }
    } catch (error: any) {
      setisLoading(false)
      if (error.response?.status === 500) {
        ShowErrorToast('Internal Server Error.')
        setisLoading(false)
      }
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      {loaderMain && <Loader />}
      <p style={{ color: settings.primaryColor }} className='font-bold flex items-center justify-between gap-2 mb-1'>
        <span className='flex items-center gap-2'>
          <span
            className='inline-flex items-center justify-center border border-gray-400 rounded-md p-2 cursor-pointer'
            onClick={() =>
              router.replace(
                getLocalizedUrl(
                  `/apps/announcement/campaign?campaignId=${encodeURIComponent(btoa(announcementId ?? ''))}`,
                  locale as Locale
                )
              )
            }
          >
            <i className='ri-arrow-go-back-line text-lg'></i>
          </span>
          Announcement / {'Create'} Campaign
        </span>

        {/* {ids && (
          <Button variant='contained' onClick={() => setOpenDialog(true)}>
            View Log
          </Button>
        )} */}
      </p>

      <Card sx={{ mt: 4 }}>
        <Box p={6} position='relative'>
          {loaderMain ? (
            <Grid container spacing={2}>
              <Grid item>
                <Skeleton variant='rectangular' width={1340} height={60} className='rounded-md' />
              </Grid>
            </Grid>
          ) : (
            <TextField
              label='Campaign title'
              placeholder='Campaign title.....'
              value={note}
              onChange={e => {
                if (e.target.value?.length <= 100) {
                  setNote(e.target.value)
                }
              }}
              fullWidth
              multiline
              minRows={1}
              error={note?.length > 100}
              helperText={`${note?.length || 0}/100 characters`}
            />
          )}
          {/* Icon positioned at bottom right */}
          <Box
            position='absolute'
            bottom={8}
            right={20}
            display='flex'
            alignItems='center'
            color='text.secondary'
            sx={{ pointerEvents: 'none' }}
          >
            <Tooltip
              title='Private note for internal use only, it will not be used to show or send to users'
              placement='left'
            >
              <i
                className='ri-error-warning-line text-2xl cursor-pointer text-gray-400'
                style={{ pointerEvents: 'auto' }}
              ></i>
            </Tooltip>
          </Box>
        </Box>
      </Card>

      <FilterCampaign
        roleLoading={roleLoading}
        connectDataLack={connectDataLack}
        rolesListDataLack={rolesListDataLack}
        selectedLabelsDataLack={selectedLabelsDataLack}
        commanColumnFilter={commanColumnFilter}
        setCommanColumnFilter={setCommanColumnFilter}
        rolesList={rolesList}
        selectedLabels={selectedLabels}
        parentForm={parentForm}
        teacherForm={teacherForm}
        studentForm={studentForm}
        setParentForm={setParentForm}
        setTeacherForm={setTeacherForm}
        setStudentForm={setStudentForm}
        filterWishDataLack={filterWishDataLack}
        filterWishSelectedLabelsDataLack={filterWishSelectedLabelsDataLack}
        filterWishCommonColumn={filterWishCommonColumn}
        setFilterWishCommonColumn={setFilterWishCommonColumn}
        setFilterWishSelectedLabelsDataLack={setFilterWishSelectedLabelsDataLack}
        setSelectedLabelsDataLack={setSelectedLabelsDataLack}
        goFilterData={goFilterData}
        setSelectedData={setSelectedData}
        setSelectedLabels={setSelectedLabels}
        columnSelectedEdit={columnSelectedEdit}
        filterWishSelectedRole={filterWishSelectedRole}
        ids={ids}
      />
      {/* <Card sx={{ mt: 4 }}> */}
      <Box mt={4}>
        {Number(connectDataLack) == 0 ? (
          <LocalAudienceGrid selectedData={selectedData} setSelectedIds={setSelectedIds} />
        ) : (
          <AudienceGrid
            selectedData={selectedData}
            setSelectedIds={setSelectedIds}
            setSelectRowId={setSelectRowId}
            selectRowId={selectRowId}
            filterWishSelectedLabelsDataLack={filterWishSelectedLabelsDataLack}
            selectedLabelsDataLack={selectedLabelsDataLack}
          />
        )}
      </Box>
      {/* </Card> */}
      <Card sx={{ mt: 4, overflow: 'visible' }}>
        <Box p={6}>
          <Grid container spacing={4}>
            {/* Publishing Mode */}
            <Grid item xs={12} md={4}>
              <TextField
                label='Publishing Mode'
                select
                fullWidth
                value={mode}
                onChange={e => setMode(e.target.value)}
                disabled={status === 'in_progress'}
              >
                {publishingModeType.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Schedule Type */}
            <Grid item xs={12} md={4}>
              <TextField
                label='Schedule'
                select
                fullWidth
                value={scheduleType}
                onChange={e => setScheduleType(e.target.value)}
                disabled={status === 'in_progress'}
              >
                {scheduleTypeDropDown.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* DateTime */}
            {scheduleType === 'schedule' && (
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DateTimePicker']}>
                    <DateTimePicker
                      label='Start Date Time'
                      value={startDateTime}
                      onChange={newValue => setStartDateTime(newValue)}
                      format='DD-MM-YYYY HH:mm'
                      ampm={false}
                      minDateTime={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: false,
                          helperText: '',
                          FormHelperTextProps: { sx: { display: 'none' } },
                          InputLabelProps: {
                            sx: { color: 'inherit !important' }
                          }
                        }
                      }}
                      disabled={status === 'in_progress'}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>
            )}

            {/* Recurring Settings */}
            {isRecurring && (
              <>
                <Grid item xs={6} md={4}>
                  <TextField
                    label='Repeat'
                    type='number'
                    fullWidth
                    inputProps={{ min: 1, max: 10 }}
                    value={recurringCount}
                    onChange={e => {
                      const value = e.target.value
                      if (value === '' || /^[0-9\b]+$/.test(value)) {
                        setRecurringCount(value)
                        setError('')
                      }
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>times</InputAdornment>
                    }}
                    disabled={status === 'in_progress'}
                    error={!!error}
                    helperText={error}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField
                    label='Duration'
                    select
                    fullWidth
                    value={recurringType}
                    onChange={e => setRecurringType(e.target.value)}
                    disabled={status === 'in_progress'}
                  >
                    {frequencyTypeDropDown.map((option, index) => (
                      <MenuItem key={index} value={option.value}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>
          {/* Communication Channels */}
          <Box>
            <Typography fontWeight={600} mb={1} mt={3}>
              Communication Channels
            </Typography>
            <Grid container spacing={3} mb={3}>
              {channels.map(channel => {
                // const isSelected = selectedChannel === channel.key
                const isSelected = selectedChannel?.includes(channel.key) ?? false

                return (
                  <Grid item xs={6} sm={3} key={channel.key}>
                    <Box
                      onClick={() => {
                        toggleChannel(channel.key)
                        // if (ids) toggleChannel(channel.key)
                      }}
                      sx={{
                        cursor: ids ? 'not-allowed' : 'pointer',
                        pointerEvents: ids ? 'none' : 'auto',
                        opacity: ids ? 0.5 : 1,
                        border: isSelected ? `2px solid ${channel.color}` : '1px solid #e0e0e0',
                        borderRadius: 3,
                        height: 200,
                        p: 3,
                        backgroundColor: ids
                          ? '#f5f5f5' // grey-out
                          : isSelected
                            ? `${channel.color}20`
                            : 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': ids
                          ? {}
                          : {
                              transform: 'scale(1.03)',
                              boxShadow: 4,
                              backgroundColor: isSelected ? `${channel.color}25` : ''
                            }
                      }}
                    >
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          backgroundColor: channel.bg,
                          color: channel.color,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 32,
                          boxShadow: 2,
                          mb: 1
                        }}
                        dangerouslySetInnerHTML={{ __html: channel.icon }}
                      />
                      {/* <img src={channel.img} className={classNames('max-bs-[100px] bs-[102px] rounded-lg')} /> */}
                      <Typography fontWeight={600} variant='subtitle1' sx={{ textTransform: 'capitalize', mb: 0.5 }}>
                        {channel.label}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' textAlign='center'>
                        {channel.sub}
                      </Typography>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </Box>

          {/* Preview */}
          {/* {scheduleType === 'schedule' && ( */}
          <Grid item xs={12} mb={2}>
            {/* <Box sx={{ background: '#f4f6f8', p: 2, borderRadius: 2 }}> */}
            <Card sx={{ p: 2 }}>
              <Typography variant='subtitle1' fontWeight='600'>
                Preview:
              </Typography>
              <Typography>
                {mode === 'one_time' && scheduleType === 'now' && (
                  <>
                    This campaign will be sent immediately to the selected audience via{' '}
                    <b>
                      {ids
                        ? showEditTimeChannel
                        : selectedChannel && selectedChannel.map(item => channelMap[item] || item).join(', ')}
                    </b>
                    .
                  </>
                )}
                {mode === 'one_time' && scheduleType === 'schedule' && (
                  <>
                    This campaign will be sent to the selected audience via{' '}
                    <b>
                      {ids
                        ? showEditTimeChannel
                        : selectedChannel && selectedChannel.map(item => channelMap[item] || item).join(', ')}
                    </b>
                    {' '}on{' '}
                    <b>
                      {dayjs(startDateTime).isValid()
                        ? dayjs(startDateTime).format('DD-MM-YYYY hh:mm A')
                        : 'DD-MM-YYYY hh:mm A'}
                    </b>
                    .
                  </>
                )}
                {mode === 'recurring' && scheduleType === 'now' && (
                  <>
                    This campaign will be sent to the selected audience via{' '}
                    <b>
                      {ids
                        ? showEditTimeChannel
                        : selectedChannel && selectedChannel.map(item => channelMap[item] || item).join(', ')}
                    </b>{' '}
                    starting from{' '}
                    <b>{dayjs().isValid() ? dayjs().format('DD-MM-YYYY hh:mm A') : 'DD-MM-YYYY hh:mm A'}</b>. and will
                    repeat once a day for{' '}
                    <b>
                      {recurringCount} {recurringType}
                      {Number(recurringCount) > 1 ? `'s` : ''}
                    </b>
                    .
                  </>
                )}
                {mode === 'recurring' && scheduleType === 'schedule' && (
                  <>
                    This campaign will be sent to the selected audience via{' '}
                    <b>
                      {ids
                        ? showEditTimeChannel
                        : selectedChannel && selectedChannel.map(item => channelMap[item] || item).join(', ')}
                    </b>
                    , starting from{' '}
                    <b>
                      {dayjs(startDateTime).isValid()
                        ? dayjs(startDateTime).format('DD-MM-YYYY hh:mm A')
                        : 'DD-MM-YYYY hh:mm A'}
                    </b>
                    . and will repeat once a day for{' '}
                    <b>
                      {recurringCount} {recurringType}
                      {Number(recurringCount) > 1 ? `'s` : ''}
                    </b>
                    .
                  </>
                )}
              </Typography>

              {mode === 'recurring' && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <h4 className='text-sm font-semibold text-blue-700 mb-3 flex items-center'>
                    <i className='ri-calendar-event-line mr-2 text-base' />
                    Display Preview: {recurringType}
                  </h4>
                  <ul className='space-y-2'>
                    {scheduleDates.map((date, idx) => (
                      <li
                        key={idx}
                        className='flex items-center gap-3 text-sm text-gray-800 border border-gray-200 rounded px-3 py-2 bg-white shadow-sm'
                      >
                        <span className='font-bold text-blue-600'>{idx + 1}</span>:
                        <span className='text-gray-700'>{date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
            {/* </Box> */}
          </Grid>
          {/* )} */}

          {/* Action Buttons */}
          <Box display='flex' alignItems='center' gap={2} width='100%'>
            {/* Left-side buttons */}
            {status !== 'done' ? (
              <>
                {!ids && (
                  <>
                    <Button
                      onClick={() => launchCampaign('draft')}
                      disabled={status === 'stop' || status === 'in_progress'}
                      style={{ backgroundColor: '#8d8d8dff', color: 'white' }}
                    >
                      Save as Draft
                    </Button>

                    <Button
                      variant='contained'
                      onClick={() => launchCampaign('in_progress')}
                      disabled={status === 'stop' || status === 'in_progress'}
                    >
                      Launch Campaign
                    </Button>
                  </>
                )}
                {ids && (
                  <Button
                    variant='contained'
                    onClick={() => launchCampaign(status === 'stop' ? 'in_progress' : 'stop')}
                    sx={{
                      backgroundColor: status !== 'stop' ? '#c40c0c' : '#1f5634',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: status !== 'stop' ? '#a80808' : '#144d28'
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#e0e0e0',
                        color: '#a0a0a0'
                      }
                    }}
                  >
                    {status === 'stop' ? 'Continue' : 'Stop'}
                  </Button>
                )}
              </>
            ) : null}

            <Button
              variant='outlined'
              onClick={() =>
                router.replace(
                  getLocalizedUrl(
                    `/apps/announcement/campaign?campaignId=${encodeURIComponent(btoa(announcementId ?? ''))}`,
                    locale as Locale
                  )
                )
              }
            >
              Cancel
            </Button>

            {/* Push icon to far right */}
            {/* <div
              className='relative inline-block group ml-auto'
              onMouseEnter={() => setOpenChart(true)}
              onMouseLeave={() => setOpenChart(false)}
            >
              <i className='ri-error-warning-line text-2xl cursor-pointer text-gray-400'></i>
              {openChart && (
                <div className='absolute z-50 -bottom-10 right-[100%] -translate-x-1/4'>
                  <StatusFlow />
                </div>
              )}
            </div> */}
          </Box>
        </Box>
      </Card>

      {openDialog && (
        <CampaignViewLogDialog
          open={openDialog}
          setOpen={setOpenDialog}
          selectedChannel={selectedChannel}
          viewLogData={viewEmailLog}
          viewNotificationLog={viewNotificationLog}
          setPaginationEmail={setPaginationEmail}
          setPaginationNotification={setPaginationNotification}
          totalRowsNotification={totalRowsNotification}
          totalRowsEmail={totalRowsEmail}
          paginationNotification={paginationNotification}
          paginationEmail={paginationEmail}
          paginationWhatsapp={paginationWhatsapp}
          setPaginationWhatsapp={setPaginationWhatsapp}
          totalRowsWhatsapp={totalRowsWhatsapp}
          viewWhatsappLog={viewWhatsappLog}
        />
      )}
    </>
  )
}
export default CreateCampaign

const StatusFlow = () => {
  return (
    <div className='flex flex-col items-center text-center font-sans text-base relative space-y-16 '>
      <div className='relative z-10'>
        <div className='p-5 border border-gray-300 rounded-2xl w-60 bg-white shadow-xl'>
          <div className='flex justify-center items-center gap-3 text-blue-600 text-lg font-semibold'>
            <i className='ri-edit-box-line text-[22px]'></i>
            Create Campaign
          </div>
        </div>
        <div className='absolute top-full left-1/2 transform -translate-x-1/2 h-16 border-dashed border-l-2 border-gray-400' />
      </div>
      <div className='relative w-full flex justify-center items-start h-40'>
        <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-[17rem] h-0.5 border-dashed border-t-2 border-gray-400 z-0 ' />
        <div className='absolute left-[calc(50%-15rem)] top-0 flex flex-col items-center z-10'>
          <div className='h-8 border-dashed border-l-2 border-gray-400' />
          <i className='ri-arrow-down-s-fill text-gray-600'></i>
          <div className='p-5 border mt-[-8px] border-gray-300 rounded-2xl w-48 bg-white shadow-md'>
            <div className='flex justify-center items-center gap-2 text-yellow-600 text-lg font-semibold'>
              <i className='ri-sticky-note-add-line text-[20px]'></i>
              Draft
            </div>
            <div className='text-sm text-gray-500 mt-1'>(not sent)</div>
          </div>
        </div>
        <div className='absolute right-[calc(50%-15rem)] top-0 flex flex-col items-center z-10'>
          <div className='h-8 border-dashed border-l-2 border-gray-400' />
          <i className='ri-arrow-down-s-fill text-gray-600'></i>
          <div className='relative'>
            <div className='absolute right-[-80px] top-1/2 transform -translate-y-1/2 flex flex-col items-center w-[80px] z-10'>
              <div className='flex items-center w-full mb-1'>
                <i className='ri-arrow-left-s-fill text-gray-600  '></i>
                <div className='flex-1 border-t-2 border-dashed border-gray-400'></div>
              </div>
              <div className='flex items-center w-full mt-1'>
                <div className='flex-1 border-t-2 border-dashed border-gray-400'></div>
                <i className='ri-arrow-right-s-fill text-gray-600  mr-[16px] '></i>
              </div>
            </div>
            <div className='absolute right-[-270px] top-1/2 transform -translate-y-1/2 p-5 border border-gray-300 rounded-2xl w-52 bg-white shadow-md z-10'>
              <div className='flex justify-center items-center gap-2 text-red-600 text-lg font-semibold'>
                <i className='ri-stop-fill text-[25px]'></i>
                Stopped
              </div>
              <div className='text-sm text-gray-500 mt-1'>(paused, no edit)</div>
              <div className='mt-3 border border-gray-400 rounded-lg w-28 mx-auto p-2 text-sm bg-gray-100 shadow-inner text-green-600 font-bold flex items-center justify-center gap-1'>
                <i className='ri-refresh-line text-[14px]'></i>
                CONTINUE
              </div>
              <div className='absolute left-1/2 top-full transform -translate-x-1/2 h-24 border-dashed border-l-2 border-gray-400 '></div>
            </div>
            <div className='p-5 mt-[-8px] border border-gray-300 rounded-2xl w-52 bg-white shadow-md'>
              <div className='flex justify-center items-center gap-2 text-purple-700 text-lg font-semibold'>
                <i className='ri-megaphone-line text-[20px]'></i>
                In Progress
              </div>
              <div className='text-sm text-gray-500 mt-1'>(cannot change)</div>
              <div className='mt-3 border border-gray-400 rounded-lg w-28 mx-auto p-2 text-sm bg-gray-100 shadow-inner text-red-600 font-bold flex items-center justify-center gap-1'>
                <i className='ri-stop-fill text-[20px]'></i>
                STOP
              </div>
            </div>
            <div className='absolute left-1/2 top-full transform -translate-x-1/2 h-24 border-dashed border-l-2 border-gray-400 '></div>
            <div className='absolute top-[calc(100%+3rem)] left-1/2 transform -translate-x-1/2 translate-y-[8px] ml-[140px] p-5 border border-gray-300 rounded-2xl w-40 bg-white shadow-md z-10'>
              <div className='absolute right-full top-1/2 transform -translate-y-1/2 flex items-center'>
                <div className='w-[56px] border-t-2 border-dashed border-gray-400'></div>
                <i className='ri-arrow-right-s-fill text-gray-600 -ml-[10px]'></i>
              </div>
              <div className='absolute left-full top-1/2 transform -translate-y-1/2 flex items-center'>
                <i className='ri-arrow-left-s-fill text-gray-600  -mr-[10px]'></i>
                <div className='w-[40px] border-t-2 border-dashed border-gray-400'></div>
              </div>
              <div className='flex justify-center items-center gap-2 text-green-600 text-lg font-semibold'>
                <i className='ri-check-line text-[20px]'></i>
                Done
              </div>
              <div className='text-sm text-gray-500 mt-1'>(final stage)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
