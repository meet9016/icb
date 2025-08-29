import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

import type { RoleType } from '@/types/apps/roleType'

// ✅ Define Thunks (without inline export)
const addRoleToDB = createAsyncThunk(
  'role/addRoleToDB',
  async (role: RoleType, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/roles', role)

      return response.data.role
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'API Error')
    }
  }
)

const updateRoleToDB = createAsyncThunk(
  'role/updateRoleToDB',
  async (role: RoleType, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/roles`, role)
      return response.data.role
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Update Error')
    }
  }
)

const deleteRoleToDB = createAsyncThunk(
  'role/deleteRoleToDB',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/roles/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Delete Error')
    }
  }
)

const fetchRolesFromDB = createAsyncThunk(
  'role/fetchRolesFromDB',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/roles')
      return response.data.data // expecting: { data: RoleType[] }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Fetch Error')
    }
  }
)

// 🟡 Initial State
const initialState: RoleType[] = []

// 🧠 Role Slice
export const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    addRole: (state, action: PayloadAction<RoleType>) => {
      state.unshift(action.payload)
    },

    updateRole: (state, action: PayloadAction<{ id: number; data: Partial<Omit<RoleType, 'id'>> }>) => {
      const { id, data } = action.payload
      const index = state.findIndex((role: any) => role.id === id)
      if (index !== -1) {
        state[index] = { ...state[index], ...data }
      }
    },

    deleteRole: (state, action: PayloadAction<number>) => {
      const index = state.findIndex((role: any) => role.id === action.payload)
      if (index !== -1) {
        state.splice(index, 1)
      }
    }
  },

  extraReducers: builder => {
    builder.addCase(addRoleToDB.fulfilled, (state, action: PayloadAction<RoleType>) => {
      state.unshift(action.payload)
    })
    builder.addCase(updateRoleToDB.fulfilled, (state, action: PayloadAction<RoleType>) => {
      const { id } = action.payload
      const index = state.findIndex(role => role.id === id)
      if (index !== -1) {
        state[index] = action.payload
      }
    })
    builder.addCase(deleteRoleToDB.fulfilled, (state, action: PayloadAction<number>) => {
      const index = state.findIndex((role: any) => role.id === action.payload)
      if (index !== -1) {
        state.splice(index, 1)
      }
    })
    builder.addCase(fetchRolesFromDB.fulfilled, (state, action: PayloadAction<RoleType[]>) => {
      return action.payload
    })
  }
})

// 🚀 Export Actions
export const { addRole, updateRole, deleteRole } = roleSlice.actions

// ✅ Export Thunks (separately and cleanly)
export { addRoleToDB, fetchRolesFromDB, updateRoleToDB, deleteRoleToDB }

// 🚀 Export Reducer
export default roleSlice.reducer  
