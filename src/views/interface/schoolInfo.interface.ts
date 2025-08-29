export interface SchoolInfoResponse {
    success: boolean
    status: number
    message: string
    data: SchoolInfo
}

export interface SchoolInfo {
    id: number
    username: string
    username_slug: any
    email: string
    phone: string
    name: string
    contact_person_name: string
    contact_person_email: any
    abn_number: any
    street_number: any
    street_name: any
    suburb: any
    d_logo: string
    background_image: string
    primary_color: string
    secondary_color: string
    accent_color: string
    state_id: number
    country_id: number
    user_id: number
    domain: string
    key: any
    is_active: number
    database_name: any
    tenant_id: string
    l_logo: string
    f_logo: string
}
