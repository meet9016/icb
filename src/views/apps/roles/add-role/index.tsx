'use client'

import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux-store'
import {
  Typography,
  IconButton,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  Container,
  Skeleton
} from '@mui/material'
import { addRoleToDB, updateRoleToDB } from '@/redux-store/slices/role'
import type { RoleType } from '@/types/apps/roleType'
import tableStyles from '@core/styles/table.module.css'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import Loader from '@/components/Loader'
import { hyphenRemove, lastWord } from '@/utils/string'
import { toast } from 'react-toastify'
import { api } from '@/utils/axiosInstance'
import { saveToken } from '@/utils/tokenManager'
import { setSidebarPermissionInfo } from '@/redux-store/slices/sidebarPermission'
import { setUserPermissionInfo } from '@/redux-store/slices/userPermission'
import SaveButton from '@/comman/button/SaveButton'
import CancelButtons from '@/comman/button/CancelButtons'
import { useSettings } from '@/@core/hooks/useSettings'
import endPointApi from '@/utils/endPointApi'

type ErrorType = { message: string[] }

const RoleFormPage = () => {
  const searchParams = useSearchParams()
  const dispatch = useDispatch();
  const router = useRouter()
  const { lang: locale } = useParams()
  const role_id = searchParams.get('role_id') || ''
  const userSelectedRoleStore = useSelector((state: RootState) => state.userSelectedRole);
  const { settings } = useSettings()
  
  const [selectedCheckbox, setSelectedCheckbox] = useState<string[]>([])
  const [roleName, setRoleName] = useState<string>('')
  const [roleId, setRoleId] = useState(0)
  const [validationErrors, setValidationErrors] = useState<{
    roleName?: string;
    permissions?: string;
  }>({})
  const hasRefreshedToken = useRef(false);

  const [loading, setLoading] = useState(false)
  const adminStore = useSelector((state: RootState) => state.admin)
  const loginStore = useSelector((state: RootState) => state.login)

  const [permissionsData, setPermissionsData] = useState<any>(null)

  useEffect(() => {
    const editRoleData = localStorage.getItem('editRoleData')
    if (editRoleData) {
      const roleData = JSON.parse(editRoleData)
      setRoleName(roleData.title || '')
      setRoleId(roleData.id || 0)

      // Transform permissions data for checkboxes
      const selectedPerms = roleData.permissions?.reduce((acc: string[], permission: any) => {
        const menuId = permission.menu_id
        const subMenuIds = permission.sub_menus.map((subMenu: any) => `${menuId}-${subMenu.id}`)
        return [...acc, ...subMenuIds]
      }, []) || []

      setSelectedCheckbox(selectedPerms)
      setPermissionsData(roleData.permissions || [])
    }
  }, [])

  useEffect(() => {
    fetchPermissions()
  }, [])
  const fetchPermissions = async () => {
    try {
      setLoading(true)

      const payload = {
        tenant_id: adminStore.school_id.toString() || '',
        school_id: adminStore.tenant_id.toString() || ''
      }

      const response = await api.post(`${endPointApi.postPermissionsGet}`, payload)

      if (response.status === 200) {
        setPermissionsData(response.data.data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      // alert(error)
    }
    finally {
      setLoading(false)

    }
  }

  const togglePermission = (id: string) => {
    setSelectedCheckbox(prev =>
      prev.includes(id) ? prev.filter(perm => perm !== id) : [...prev, id]
    )
    setValidationErrors(prev => ({ ...prev, permissions: undefined }))
  }

  const validateForm = () => {
    const errors: { roleName?: string; permissions?: string } = {}

    if (!roleName.trim()) {
      errors.roleName = 'Role name is required'
    }

    if (roleId === 0 && selectedCheckbox.length === 0) {
      errors.permissions = 'At least one permission must be selected'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Transform selected checkboxes into API format
    const permissionsMap: { [key: string]: number[] } = {}

    selectedCheckbox.forEach(perm => {
      const [menuId, subMenuId] = perm.split('-').map(Number)
      if (!permissionsMap[menuId]) {
        permissionsMap[menuId] = []
      }
      permissionsMap[menuId].push(subMenuId)
    })

    const permissions = Object.keys(permissionsMap).map(menuId => ({
      menu_id: Number(menuId),
      sub_menu_ids: permissionsMap[menuId]
    }))

    const payload = {
      id: roleId,
      name: roleName,
      tenant_id: adminStore.tenant_id.toString() || '',
      school_id: adminStore?.school_id.toString() || '',
      permissions
    }

    try {
      setLoading(true);
      const response = await api.post(`${endPointApi.postRolesAddUpdate}`, payload);

      if (response.data.success) {
        setPermissionsData(response.data.data);

        toast.success(response.data.message);
        localStorage.removeItem('editRoleData');
        router.replace(getLocalizedUrl('/apps/roles', locale as Locale));

        // Fetch updated sidebar permissions
        const formData = new FormData();
        // formData.append('role_id', role_id);
        formData.append('role_id', userSelectedRoleStore.id);
        formData.append('tenant_id', loginStore.tenant_id);
        formData.append('school_id', loginStore.school_id);
        formData.append('user_id', loginStore.id);

        if ((loginStore?.super_admin as unknown as boolean) !== true) {
          try {
            const res = await api.post(`${endPointApi.postRolePermissionsGet}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            dispatch(setSidebarPermissionInfo(res.data));
            // dispatch(setUserPermissionInfo(res.data));
          } catch (err: any) {
            console.error('Permission error:', err?.response || err);
            toast.error('Failed to fetch permissions.');
          }
        }
      } else {
        toast.error(response.data.message || 'Something went wrong.');
      }
    } catch (error: any) {
      console.error('Role creation error:', error);
      toast.error(error?.response?.data?.message || 'Failed to save role.');
    } finally {
      setLoading(false);
    }
  }

  const handleCancelRole = () => {

    localStorage.removeItem('editRoleData')
    router.replace(getLocalizedUrl('/apps/roles', locale as Locale))
  }

  const ACTION_ORDER = ["view", "add", "edit", "delete"];
  
  return (
    <div>
      <p style={{ color: settings.primaryColor }} className="font-bold">Role / {roleId !== 0 ? 'Edit Role' : 'Add Role'}</p>
      <Card className=''>
        <CardContent>
          <Typography variant='h4' className='text-center mb-2'>
            {roleId !== 0 ? 'Edit Role' : 'Add Role'}
          </Typography>

          {loading ? (
            <>
              <Skeleton variant='text' height={50} width='60%' className='mx-auto mb-4' />
              <Skeleton variant='rectangular' height={60} className='mb-4' />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant='rectangular' height={50} className='mb-3' />
              ))}
              <div className='flex justify-center gap-4 mt-6'>
                <Skeleton variant='rectangular' height={40} width={100} className='rounded' />
                <Skeleton variant='rectangular' height={40} width={100} className='rounded' />
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                label='Role Name'
                variant='outlined'
                fullWidth
                value={roleName}
                placeholder='Enter Role Name'
                onChange={e => {
                  setRoleName(e.target.value);
                  setValidationErrors(prev => ({ ...prev, roleName: undefined }));
                }}
                error={!!validationErrors.roleName}
                helperText={validationErrors.roleName}
                required
              />

              {/* <Typography variant='h5' className='my-6'>
                Role Permissions
              </Typography> */}

              {validationErrors.permissions && (
                <Typography color='error' className='mb-2'>
                  <p style={{ color: 'red' }}>{validationErrors.permissions}</p>
                </Typography>
              )}

              {/* <hr className='border-t border-gray-300 mb-4' /> */}

              <div className='flex flex-col overflow-x-auto mt-10'>
                <table className={tableStyles.table}>
                  <tbody>
                    {permissionsData?.menus
                      ?.filter((menu: any) => {
                        const lowerName = menu.name.toLowerCase();
                        return !lowerName.includes('dashboard') && !lowerName.includes('profile');
                      })
                      .map((menu: any) => (
                        <tr key={menu.menu_id}>
                          <td>
                            <Typography className='font-medium'>
                              {hyphenRemove(menu.name)}
                            </Typography>
                          </td>
                          <td className='text-end'>
                            <FormGroup row className='justify-end gap-6'>
                              {menu.sub_menus.length === 0 ? (
                                <Typography variant='body2' className='text-textSecondary'>
                                  No submenu
                                </Typography>
                              ) : (
                                menu.sub_menus.sort((a:any, b:any) => {
                                const aKey = lastWord(hyphenRemove(a.action_name)).toLowerCase();
                                const bKey = lastWord(hyphenRemove(b.action_name)).toLowerCase();
                                return ACTION_ORDER.indexOf(aKey) - ACTION_ORDER.indexOf(bKey);
                              }).map((action: any) => (
                                  <FormControlLabel
                                    key={action.id}
                                    control={
                                      <Checkbox
                                        checked={selectedCheckbox.includes(`${menu.menu_id}-${action.id}`)}
                                        onChange={() => togglePermission(`${menu.menu_id}-${action.id}`)}
                                      />
                                    }
                                    label={lastWord(hyphenRemove(action.action_name))}
                                  />
                                ))
                              )}
                            </FormGroup>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <hr className='border-t mb-4' />

              <div className='flex justify-center gap-4 mt-6'>
                <SaveButton name={roleId !== 0 ? 'Update' : 'Save'}  type='submit' disabled={false} />
                <CancelButtons name='Cancel' onClick={handleCancelRole}/>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

export default RoleFormPage
