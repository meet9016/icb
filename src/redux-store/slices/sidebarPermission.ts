import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Key } from 'node:readline';

export interface Role {
    menu_id: Key | null | undefined;
    checked: boolean;
    menu_name: string;
    id: string;
    name: string;
}

export interface Roles {
    id: string;
    name: string;
}

export type sidebarDataPermission = Role[];

const initialState: sidebarDataPermission = [];

const sidebarPermissionSlice = createSlice({
    name: 'sidebarPermission',
    initialState,
    reducers: {
        setSidebarPermissionInfo(state, action: PayloadAction<sidebarDataPermission>) {
            return { ...state, ...action.payload }; // or use state.push(...action.payload) if mutable style preferred
        },
        setSelectedRoleInfo(state, action: PayloadAction<Roles>) {
            return { ...state, selectedRole: action.payload }; // or use state.push(...action.payload) if mutable style preferred
        },
        clearSidebarPermission(state) {
            return initialState; // or use state.push(...action.payload) if mutable style preferred
        },
    }
})

export const { setSidebarPermissionInfo, setSelectedRoleInfo, clearSidebarPermission } = sidebarPermissionSlice.actions;
export default sidebarPermissionSlice.reducer;
