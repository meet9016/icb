import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { clear } from 'console';

export interface Role {
    id: string;
    name: string;
}

export type UserLoginPermission = Role[];

const initialState: UserLoginPermission = [];

const userPermissionSlice = createSlice({
    name: 'userPermission',
    initialState,
    reducers: {
        setUserPermissionInfo(state, action: PayloadAction<UserLoginPermission>) {
            return action.payload; // or use state.push(...action.payload) if mutable style preferred
        },
        clearUserPermissionInfo(state) {
            return initialState; // or use state.push(...action.payload) if mutable style preferred
        },
    }
})

export const { setUserPermissionInfo, clearUserPermissionInfo } = userPermissionSlice.actions;
export default userPermissionSlice.reducer;
