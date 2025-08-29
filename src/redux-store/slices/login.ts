// @/redux-store/slices.ts
import { Login } from '@/views/interface/school.interface'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: Login = {
    id: '',
    tenant_id: '',
    school_id: '',
    username: '',
    email: '',
    super_admin: '',
    microsoft_name: '',
}

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        /*************  ✨ Windsurf Command ⭐  *************/
        /**
         * Updates the login state with the provided login information.
         *
         * @param state - The current state of login.
         * @param action - A Redux action containing the payload of type Login.
        /*******  59d1f155-29e8-4cc7-a5bc-9f79494ce715  *******/
        setLoginInfo(state, action: PayloadAction<Login>) {
            state.id = action.payload.id
            state.tenant_id = action.payload.tenant_id
            state.school_id = action.payload.school_id
            state.username = action.payload.username
            state.email = action.payload.email
            state.super_admin = action.payload.super_admin
            state.microsoft_name = action.payload.microsoft_name
        },
        resetLoginInfo(state) {
            state = initialState;
        }
    }
})

export const { setLoginInfo, resetLoginInfo } = loginSlice.actions
export default loginSlice.reducer
