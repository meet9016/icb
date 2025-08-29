// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports

import SchoolSettings from '@/views/pages/school-settings'

const SchoolAccount = dynamic(() => import('@/views/pages/school-settings/school-account'))
const SchoolAccountTab = dynamic(() => import('@/views/pages/school-settings/school-account'))
const SchoolSecurityTab = dynamic(() => import('@views/pages/school-settings/security'))
// const SchoolBillingPlansTab = dynamic(() => import('@views/pages/school-settings/billing-plans'))
const SchoolEmailTab = dynamic(() => import('@/views/pages/school-settings/email'))
const SchoolNotificationsTab = dynamic(() => import('@views/pages/school-settings/notifications'))
const SchoolConnectionsTab = dynamic(() => import('@views/pages/school-settings/connections'))
const SchoolSmsTab = dynamic(() => import('@views/pages/school-settings/sms'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  account: <SchoolAccount />,
  school: <SchoolAccountTab />,
  security: <SchoolSecurityTab />,
  // 'billing-plans': <SchoolBillingPlansTab />,
  email: <SchoolEmailTab />,
  notifications: <SchoolNotificationsTab />,
  sms: <SchoolSmsTab />,
  connections: <SchoolConnectionsTab />,
})

const AccountSettingsPage = () => {
  return <SchoolSettings tabContentList={tabContentList()} />
}

export default AccountSettingsPage
