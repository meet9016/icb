// Third-party Imports
// import { configureStore } from '@reduxjs/toolkit'

// // Slice Imports
// import chatReducer from '@/redux-store/slices/chat'
// import calendarReducer from '@/redux-store/slices/calendar'
// import kanbanReducer from '@/redux-store/slices/kanban'
// import emailReducer from '@/redux-store/slices/email'
// import roleReducer from '@/redux-store/slices/role'
// import permissionReducer from '@/redux-store/slices/permission'
// import adminReducer from '@/redux-store/slices/admin'
// import schoolInfoReducer from '@/redux-store/slices/schoolInfo'
// import countryAndStateReducer from '@/redux-store/slices/countryAndState'
// import loginReducer from '@/redux-store/slices/login'
// import userPermissionReducer from '@/redux-store/slices/userPermission'
// import sidebarPermissionReducer from '@/redux-store/slices/sidebarPermission'

// export const store = configureStore({
//   reducer: {
//     chatReducer,
//     calendarReducer,
//     kanbanReducer,
//     emailReducer,
//     roleReducer,
//     permissionReducer,
//     admin: adminReducer,
//     countryAndState: countryAndStateReducer,
//     schoolInfo: schoolInfoReducer,
//     login: loginReducer,
//     userPermission: userPermissionReducer,
//     sidebarPermission: sidebarPermissionReducer,
//   },
//   middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
// })

// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch

//persist start
// Third-party Imports
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage

// Slice Imports
import chatReducer from '@/redux-store/slices/chat'
import calendarReducer from '@/redux-store/slices/calendar'
import kanbanReducer from '@/redux-store/slices/kanban'
import emailReducer from '@/redux-store/slices/email'
import roleReducer from '@/redux-store/slices/role'
import permissionReducer from '@/redux-store/slices/permission'
import adminReducer from '@/redux-store/slices/admin'
import schoolInfoReducer from '@/redux-store/slices/schoolInfo'
import countryAndStateReducer from '@/redux-store/slices/countryAndState'
import loginReducer from '@/redux-store/slices/login'
import userPermissionReducer from '@/redux-store/slices/userPermission'
import sidebarPermissionReducer from '@/redux-store/slices/sidebarPermission'
import userSelectedRoleSlice from '@/redux-store/slices/userSelectedRole'
import dataLackSlice from '@/redux-store/slices/dataLack'

// Combine all reducers
const rootReducer = combineReducers({
  chatReducer,
  calendarReducer,
  kanbanReducer,
  emailReducer,
  roleReducer,
  permissionReducer,
  admin: adminReducer,
  countryAndState: countryAndStateReducer,
  schoolInfo: schoolInfoReducer,
  login: loginReducer,
  userPermission: userPermissionReducer,
  sidebarPermission: sidebarPermissionReducer,
  userSelectedRole: userSelectedRoleSlice,
  dataLack: dataLackSlice
})

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['admin', 'login', 'userPermission', 'sidebarPermission', 'userSelectedRole', 'dataLack'], // only persist the slice
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch




//old code
// import { configureStore, combineReducers } from '@reduxjs/toolkit'
// import storage from 'redux-persist/lib/storage' // defaults to localStorage
// import { persistReducer, persistStore } from 'redux-persist'
// import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'

// import chatReducer from '@/redux-store/slices/chat'
// import calendarReducer from '@/redux-store/slices/calendar'
// import kanbanReducer from '@/redux-store/slices/kanban'
// import emailReducer from '@/redux-store/slices/email'
// import roleReducer from '@/redux-store/slices/role'
// import permissionReducer from '@/redux-store/slices/permission'
// import adminReducer from '@/redux-store/slices/admin'
// import schoolInfoReducer from '@/redux-store/slices/schoolInfo'
// import countryAndStateReducer from '@/redux-store/slices/countryAndState'
// import loginReducer from '@/redux-store/slices/login'
// import userPermissionReducer from '@/redux-store/slices/userPermission'
// import sidebarPermissionReducer from '@/redux-store/slices/sidebarPermission'

// const rootReducer = combineReducers({
//   chatReducer,
//   calendarReducer,
//   kanbanReducer,
//   emailReducer,
//   roleReducer,
//   permissionReducer,
//   admin: adminReducer,
//   countryAndState: countryAndStateReducer,
//   schoolInfo: schoolInfoReducer,
//   login: loginReducer,
//   userPermission: userPermissionReducer,
//   sidebarPermission: sidebarPermissionReducer,
// })

// // 🔐 Setup persistence config
// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['login', 'userPermission', 'sidebarPermission'] // only persist specific reducers
// }

// // 🎯 Wrap the root reducer
// const persistedReducer = persistReducer(persistConfig, rootReducer)

// // 🏗️ Create store with persistence
// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: getDefaultMiddleware =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         // required for redux-persist compatibility
//         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//         ignoredPaths: [
//           'calendarReducer.filteredEvents',
//           'calendarReducer.filteredEvents.0.start',
//         ],
//       },
//     }),
// })

// // ⏱️ Persistor
// export const persistor = persistStore(store)

// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch
