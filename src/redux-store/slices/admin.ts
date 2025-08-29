// @/redux-store/slices.ts
import { School } from '@/views/interface/school.interface'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'



const initialState: School = {
  d_logo: '',
  f_logo: '',
  l_logo: '',
  background_image: '',
  primary_color: '',
  secondary_color: '',
  accent_color: '',
  tenant_id: '',
  school_id: -1,
  name: '',
  username: '',
  domain: '',
  id: ''
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminInfo(state, action: PayloadAction<School>) {
      Object.assign(state, action.payload)
    },
    resetAdminInfo: () => initialState
  }
})

export const { setAdminInfo, resetAdminInfo } = adminSlice.actions
export default adminSlice.reducer
