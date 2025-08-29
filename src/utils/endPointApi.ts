export interface EndPointApi {
    login: string;
    register: string;
    logout: string;
    forgotPassword: string;
    resetPassword: string;
    changePassword: string;
    verifyEmail: string;
    getRole: string;

    //Theme save
    themeSettingSave: string;
    getTheme: string;
       
    //User Management
    getUser: string
    getUserCount: string
    postMultipleStatusChange: string
    postMultipleRoleChange: string
    
    //Role & Permission
    getAllRoles: string
    getRolesDropdown: string
    postRolesAddUpdate: string
    postPermissionsGet: string
    postRolePermissionsGet: string

    //School-settings
    //Email
    postEmailSetting: string
    //Microsoft
    microsoftAuthTokenValide: string
    microsoftFetchUsers: string
    dataLackFetchUsers: string
    postConnectionView: string
    getConnectionView: string

    // Announcements
    getAnnouncements: string
    addAnnouncements: string
    deleteAnnouncements: string,
    deleteImageAnnouncements: string
    postRoleWiseUsersList: string

    // Campaign
    postLaunchCampaign: string
    getCampaignAnnounceWise: string

    getcampaignCount: string
    postCampaignSchedulesStop: string
    postCampaignEmailLogGet: string
    postCampaignPushNotificationslogGet: string
    postcampaignSmsLogGet: string

    //Datalack
    getAllRolesDataLack :string
    postfilterDataLack :string
}

// Define and export the API endpoint object
const endPointApi: EndPointApi = {
    login: 'auth/login',
    register: 'auth/register',
    logout: 'auth/logout',
    forgotPassword: 'auth/forgot-password-check',
    resetPassword: 'auth/reset-password',
    changePassword: 'auth/change-password',
    verifyEmail: 'auth/verify-email',
    getRole: 'role-get',

    //Theme save
    themeSettingSave: 'theme-colors-fonted-add',
    getTheme: 'theme-colors-fonted-get',

    //User Management
    getUser: 'user-get',
    getUserCount: 'users/count',
    postMultipleStatusChange: 'users/status-toggle-multiple',
    postMultipleRoleChange: 'users/roles-toggle-multiple',

    //Role & Permission
    getAllRoles:'roles-all-get',
    getRolesDropdown: 'roles-show',
    postRolesAddUpdate: 'roles-add-update',
    postPermissionsGet: 'permissions-get',
    postRolePermissionsGet: 'get-role-permissions',

    //School-settings
    //Email
    postEmailSetting: 'email-setting',
    //Microsoft
    microsoftAuthTokenValide: '/ms-auth-token/school-token-valide',
    microsoftFetchUsers: 'auth/microsoft/fetch-users',
    dataLackFetchUsers: 'fetched-role-user',
    postConnectionView: 'connection-view',  
    getConnectionView: 'connection-view-fetch',

    // Announcements
    getAnnouncements: 'announcements-get',
    addAnnouncements: 'announcements-add',
    deleteAnnouncements: 'announcements-delete',
    deleteImageAnnouncements: 'announcements-delete-image',
    postRoleWiseUsersList: 'school/roles-users',

    // Campaign
    postLaunchCampaign: 'campaign-schedules-add',
    getCampaignAnnounceWise: 'campaign-schedules-fetch',
    getcampaignCount: 'campaign-count',
    postCampaignSchedulesStop: 'campaign-schedules-stop',
    postCampaignEmailLogGet: 'campaign-email-log', //log
    postCampaignPushNotificationslogGet: 'campaign-push-notifications-log',
    postcampaignSmsLogGet: 'campaign-sms-log',

    //Datalack
    getAllRolesDataLack : 'db/roles',
    postfilterDataLack : 'db/filters'
};

export default endPointApi;