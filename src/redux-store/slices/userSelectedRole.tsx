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

const userSelectedRoleSlice = createSlice({
    name: 'userSelectedRole',
    initialState,
    reducers: {
        setUserSelectedRoleInfo(state, action: PayloadAction<sidebarDataPermission>) {
            return action.payload;
        },
        setUserSelectedRoleClearInfo(state, action: PayloadAction<sidebarDataPermission>) {
            return initialState
        },
    }
})

export const { setUserSelectedRoleInfo, setUserSelectedRoleClearInfo } = userSelectedRoleSlice.actions;
export default userSelectedRoleSlice.reducer;
