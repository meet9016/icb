// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'
import TableFilters from '@/views/apps/user/list/TableFilters'
import { Autocomplete, Divider, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { SetStateAction } from 'react'
import UserListTable from './UserListTable'
import { UsersType } from '@/types/apps/userTypes'
import EmailCredentialsForm from './EmailCredentialsForm'

const top100Films = [
    { label: 'The Shawshank Redemption', year: 1994 },
    { label: 'The Godfather', year: 1972 },
    { label: 'The Godfather: Part II', year: 1974 },
    { label: 'The Dark Knight', year: 2008 },
    { label: '12 Angry Men', year: 1957 },
    { label: "Schindler's List", year: 1993 },
    { label: 'Pulp Fiction', year: 1994 },
]
const Email = ({ userData }: { userData?: UsersType[] }) => {
    return (
        <Grid container spacing={6}>

            <Grid size={{ xs: 12 }}>
                <UserListTable tableData={userData} />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <EmailCredentialsForm />
            </Grid>
        </Grid>
    )
}

export default Email
