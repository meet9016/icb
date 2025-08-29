'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const SchoolSettings = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
 
const [activeTab, setActiveTab] = useState(() => {
  return localStorage.getItem('activeSchoolTab') || 'account'; // default to 'Edit School'
});

 const handleChange = (event: React.SyntheticEvent, newValue: string) => {
  setActiveTab(newValue);
  localStorage.setItem('activeSchoolTab', newValue);
};
  return (

    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab label='Edit School' icon={<i className='ri-group-line' />} iconPosition='start' value='account' />
            <Tab label='Security' icon={<i className='ri-lock-2-line' />} iconPosition='start' value='security' />
            <Tab
              label='Email'
              icon={<i className="ri-mail-line" />}
              iconPosition='start'
              value='email'
            />
            <Tab
              label='Notifications'
              icon={<i className='ri-notification-4-line' />}
              iconPosition='start'
              value='notifications'
            />
            <Tab label='Sms' icon={<i className='ri-message-line' />} iconPosition='start' value='sms' />
            <Tab label='Connections' icon={<i className='ri-link-m' />} iconPosition='start' value='connections' />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default SchoolSettings
