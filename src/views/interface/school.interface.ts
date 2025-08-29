export interface SchoolResponse {
    success: boolean
    status: number
    message: string
    domain: string
    tenant_id: string
    data: School
}

export interface School {
    id: string
    d_logo: string
    l_logo: string
    f_logo: string
    background_image: string
    primary_color: string
    secondary_color: string
    accent_color: string
    tenant_id: string
    school_id: number
    domain: string
    name: string
    username: string
}

export interface Login {
    id: string
    tenant_id: string
    school_id: string
    username: string
    email: string
    super_admin: string
    microsoft_name: string
}
export interface UserLoginPermission {
    id: string
    name: string
}
export interface DataLackPermission {
   connectDataLack: string
}
