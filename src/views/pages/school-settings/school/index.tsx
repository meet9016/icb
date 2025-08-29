// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import SchoolDetails from './SchoolDetails'

const School = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SchoolDetails />
      </Grid>
      {/* <Grid size={{ xs: 12 }}>
        <AccountDelete />
      </Grid> */}
    </Grid>
  )
}

export default School
