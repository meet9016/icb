'use client'

import React, { useEffect, useState } from 'react'
import { Autocomplete, TextField } from '@mui/material';
import { RootState } from '@/redux-store';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '@/utils/axiosInstance';
import { setSelectedRoleInfo, setSidebarPermissionInfo } from '@/redux-store/slices/sidebarPermission';
import { getLocalizedUrl } from '@/utils/i18n';
import { useParams, useRouter } from 'next/navigation';
import { Locale } from '@/configs/i18n';
import { toast } from 'react-toastify';
import { saveToken } from '@/utils/tokenManager';
import { setUserSelectedRoleInfo } from '@/redux-store/slices/userSelectedRole';

interface Role {
    id: string;
    name: string;
}

function isRole(obj: any): obj is Role {
    return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj // adjust to your Role shape
}
const PermitionDropdown = () => {
    const dispatch = useDispatch();
    const { lang } = useParams();
    const locale = lang as Locale;
    const router = useRouter();

    const userPermissionStore = useSelector((state: RootState) => state.userPermission);
    const userSelectedRoleStore = useSelector((state: RootState) => state.userSelectedRole);
    const loginStore = useSelector((state: RootState) => state.login);


    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    // Set default role on mount
    useEffect(() => {
        // if (!selectedRole && userPermissionStore.length > 0) {
        //     if (userSelectedRoleStore.length === 0 && isRole(userPermissionStore[0])) {
        //         setSelectedRole(userPermissionStore[0])
        //     } else if (isRole(userSelectedRoleStore)) {
        //         setSelectedRole(userSelectedRoleStore)
        //     }
        //     dispatch(setUserSelectedRoleInfo(userSelectedRoleStore));
        // }
        if (!selectedRole && Array.isArray(userPermissionStore) && userPermissionStore.length > 0) {
            if (!userSelectedRoleStore || Object.keys(userSelectedRoleStore).length === 0) {
                // Case 1: No role selected, use first from permission list
                if (isRole(userPermissionStore[0])) {
                    setSelectedRole(userPermissionStore[0]);
                    dispatch(setUserSelectedRoleInfo(userPermissionStore[0]));
                }
            } else if (isRole(userSelectedRoleStore)) {
                // Case 2: Restore previously selected role
                setSelectedRole(userSelectedRoleStore);
            }
        }
    }, [userPermissionStore, selectedRole, dispatch]);

    // Fetch sidebar permissions when role changes
    useEffect(() => {
        if (!selectedRole) return;

        const fetchPermissions = async () => {
            const formData = new FormData();
            formData.append('role_id', selectedRole.id);
            formData.append('tenant_id', loginStore?.tenant_id || '');
            formData.append('school_id', loginStore?.school_id || '');
            formData.append('user_id', loginStore?.id || '');

            try {
                const res = await api.post('get-role-permissions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                dispatch(setSidebarPermissionInfo(res.data));
                try {
                    const res = await api.post('auth/refresh');
                    saveToken(res.data.access_token);
                } catch (err) {
                    console.error('Token refresh error:', err);
                }
            } catch (err: any) {
                toast.error('Failed to fetch permissions.');
            }
        };

        fetchPermissions();
    }, [selectedRole, loginStore, dispatch]);

    return (
        <>
            {!loginStore?.super_admin && (
                <Autocomplete<Role>
                    disablePortal
                    options={Array.isArray(userPermissionStore) ? userPermissionStore : []}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={selectedRole}
                    onChange={(event, newValue: any) => {
                        if (newValue) {
                            setSelectedRole(newValue);
                            dispatch(setUserSelectedRoleInfo(newValue));
                            router.replace(getLocalizedUrl('/dashboards', locale));
                        }
                    }}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Select Permission"
                            sx={{
                                '& .MuiInputBase-root': { height: 38 },
                            }}
                        />
                    )}
                />
            )}
        </>
    );
};

export default PermitionDropdown;
