// MUI Imports
import Grid from '@mui/material/Grid2'
import RolesTable from './RolesTable'

const Roles = () => {
  return (
    <Grid container spacing={6}>
      {/* <Grid size={{ xs: 12 }}>
        <Typography variant='h4' className='mbe-1'>
          Roles List
        </Typography>
        <Typography>
          A role provided access to predefined menus and features so that depending on assigned role an administrator
          can have access to what he need
        </Typography>
      </Grid> */}
      {/* <Grid size={{ xs: 12 }}>
        <RoleCards />
      </Grid> */}
      {/* <Grid size={{ xs: 12 }} className='!pbs-12'>
        <Typography variant='h4' className='mbe-1'>
          Total users with their roles
        </Typography>
        <Typography>Find all of your company&#39;s administrator accounts and their associate roles.</Typography>
      </Grid> */}
      <Grid size={{ xs: 12 }}>
        <RolesTable />
      </Grid>
    </Grid>
  )
}

export default Roles
