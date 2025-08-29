// @/redux-store/slices.ts
import { School } from '@/views/interface/school.interface'
import { SchoolInfo } from '@/views/interface/schoolInfo.interface'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'



const initialState: SchoolInfo = {

    d_logo: '',
    f_logo: '',
    l_logo: '',
    background_image: '',
    primary_color: '',
    secondary_color: '',
    accent_color: '',
    tenant_id: '',
    name: '',
    username: '',
    domain: '',
    abn_number: '',
    contact_person_email: '',
    contact_person_name: '',
    email: '',
    phone: '',
    id: -1,
    street_number: '',
    street_name: '',
    suburb: '',
    state_id: -1,
    country_id: -1,
    user_id: -1,
    is_active: 0,
    database_name: '',
    username_slug: '',
    key: null

}

const schoolInfoSlice = createSlice({
    name: 'schoolInfo',
    initialState,
    reducers: {
        setSchoolInfoSlice(state, action: PayloadAction<SchoolInfo>) {
            state.name = action.payload.name
            state.username = action.payload.username
            state.d_logo = action.payload.d_logo
            state.l_logo = action.payload.l_logo
            state.f_logo = action.payload.f_logo
            state.background_image = action.payload.background_image
            state.primary_color = action.payload.primary_color
            state.secondary_color = action.payload.secondary_color
            state.accent_color = action.payload.accent_color
            state.tenant_id = action.payload.tenant_id
            state.id = action.payload.id,
                state.street_number = action.payload.street_number,
                state.street_name = action.payload.street_name,
                state.suburb = action.payload.suburb,
                state.state_id = action.payload.state_id,
                state.country_id = action.payload.country_id,
                state.user_id = action.payload.user_id,
                state.email = action.payload.email,
                state.phone = action.payload.phone,
                state.contact_person_name = action.payload.contact_person_name,
                state.contact_person_email = action.payload.contact_person_email,
                state.is_active = action.payload.is_active,
                state.database_name = action.payload.database_name,
                state.username_slug = action.payload.username_slug,
                state.key = action.payload.key,
                state.domain = action.payload.domain
        },
        resetSchoolInfoSlice(state) {
            state = initialState;
        }
    }
})

export const { setSchoolInfoSlice, resetSchoolInfoSlice } = schoolInfoSlice.actions
export default schoolInfoSlice.reducer
