// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

type DataType = {
  name: string
  profession: string
  experience: number
  avatar: string
}

// Vars
const data: DataType[] = [
  { name: 'Dr. Hiren B. Patel', profession: 'Ph.D. (Computer Engineering)', experience: 22, avatar: '/images/avatars/1.png' },
  { name: 'Dr. J. P. Patel', profession: 'Ph.D. (Mechanical Engineering)', experience: 21, avatar: '/images/avatars/2.png' },
  { name: 'Prof. Jaykumar Patel', profession: 'ME(EE), BE(EE)', experience: 10, avatar: '/images/avatars/3.png' },
  { name: 'Prof. Nehal Shah', profession: 'M.E(CE), B.E.(IT)', experience: 9.5, avatar: '/images/avatars/4.png' },
  { name: 'Dr. Parita Shah', profession: 'PhD Pursuing, ME(CE), BE(CE)', experience: 8, avatar: '/images/avatars/4.png' },
  { name: 'Prof. Ankit Vaghela', profession: 'M.E.(CE), B.E.(IT)', experience: 4.5, avatar: '/images/avatars/1.png' },

]

const PopularInstructors = () => {
  return (
    <Card>
      <CardHeader title='Popular Faculty' action={<OptionMenu options={['Refresh', 'Update', 'Share']} />} />
      <Divider />
      <div className='flex justify-between plb-4 pli-5'>
        <Typography variant='overline'>Name</Typography>
        <Typography variant='overline'>Experience</Typography>
      </div>
      <Divider />
      <CardContent className='flex flex-col gap-4'>
        {data.map((item, i) => (
          <div key={i} className='flex items-center gap-4'>
            <CustomAvatar size={34} src={item.avatar} />
            <div className='flex justify-between items-center is-full gap-4'>
              <div className='flex flex-col gap-0.5'>
                <Typography className='font-medium' color='text.primary'>
                  {item.name}
                </Typography>
                <Typography>{item.profession}</Typography>
              </div>
              <Typography color='text.primary'>{item.experience} Years</Typography>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default PopularInstructors
