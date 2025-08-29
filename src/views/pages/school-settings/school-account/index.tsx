// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import SchoolAccountDetails from './schoolAccountDetails'


const SchoolAccount = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SchoolAccountDetails />
      </Grid>
      {/* <Grid size={{ xs: 12 }}>
        <AccountDelete />
      </Grid> */}
    </Grid>
  )
}

export default SchoolAccount
