// Component Imports

// Data Imports
import { getUserData } from '@/app/server/actions'
import Announcement from '@/views/apps/announcement'

const AnnouncementApp = async () => {
  // Vars
  const data = await getUserData()

  return <Announcement  />
}

export default AnnouncementApp
