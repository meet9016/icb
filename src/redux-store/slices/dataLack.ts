// @/redux-store/slices/dataLackSlice.ts
import { DataLackPermission } from '@/views/interface/school.interface'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'


const initialState: DataLackPermission = {
  connectDataLack: '',
}

const dataLackSlice = createSlice({
  name: 'dataLack',
  initialState,
  reducers: {
    setConnectDataLack(state, action: PayloadAction<string>) {
      state.connectDataLack = action.payload
    },
    // optional: update multiple keys at once
    patchDataLack(state, action: PayloadAction<Partial<DataLackPermission>>) {
      Object.assign(state, action.payload)
    },
    resetDataLack() {
      return initialState
    },
  },
})

export const { setConnectDataLack, patchDataLack, resetDataLack } = dataLackSlice.actions


export default dataLackSlice.reducer
