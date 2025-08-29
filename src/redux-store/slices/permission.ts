import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit'

import { db } from '@/fake-db/apps/permissions'
import type { PermissionRowType } from '@/types/apps/permissionTypes'

const initialState: PermissionRowType[] = db

export const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    addPermission: (state, action: PayloadAction<PermissionRowType>) => {
      state.unshift(action.payload)
    },

    updatePermission: (state, action: PayloadAction<{ id: number; data: Partial<Omit<PermissionRowType, 'id'>> }>) => {
      const { id, data } = action.payload
      const index = state.findIndex(permission => permission.id === id)

      if (index !== -1) {
        state[index] = { ...state[index], ...data }
      }
    },

    deletePermission: (state, action: PayloadAction<number>) => {
      const index = state.findIndex(permission => permission.id === action.payload)

      if (index !== -1) {
        state.splice(index, 1)
      }
    }
  }
})

export const { addPermission, updatePermission, deletePermission } = permissionSlice.actions

export default permissionSlice.reducer
