'use client'

// React Imports
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import type { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useParams, useRouter } from 'next/navigation'

import Loader from '@/components/Loader'
import { RootState } from '@/redux-store'
// import { setCountries } from '@/redux-store/slices/countryAndState'
import { resetSchoolInfoSlice, setSchoolInfoSlice } from '@/redux-store/slices/schoolInfo'
import { api } from '@/utils/axiosInstance'
import { SchoolInfo } from '@/views/interface/schoolInfo.interface'
import { Autocomplete, AutocompleteChangeReason, Box } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { setAdminInfo } from '@/redux-store/slices/admin'

interface Country {
  code: string
  country_name: string
  id: string | number | null
  status: number
}

type StateOption = {
  id: string | number | null
  name?: string
  code: string
  state_name?: string
  full_name?: string
}

const languageData = ['English', 'Arabic', 'French', 'German', 'Portuguese']

const SchoolAccountDetails = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const dispatch = useDispatch();

  const countryAndState = useSelector((state: RootState) => state.countryAndState)
  const selectedUser = useSelector((state: RootState) => state.schoolInfo)
  const adminStore = useSelector((state: RootState) => state.admin)

  // States
  const [formData, setFormData] = useState<SchoolInfo>(selectedUser)
  const [fileInput, setFileInput] = useState<string>('')
  const [lLogoSrc, setlLogoSrc] = useState<string>('')
  const [dLogoSrc, setdLogoSrc] = useState<string>('')
  const [fLogoSrc, setfLogoSrc] = useState<string>('')
  const [backgroundSrc, setBackgroundSrc] = useState<string>('')
  const [language, setLanguage] = useState<string[]>(['English'])
  const [lLogoFile, setlLogoFile] = useState<File | null>(null)
  const [dLogoFile, setdLogoFile] = useState<File | null>(null)
  const [fLogoFile, setfLogoFile] = useState<File | null>(null)
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedState, setSelectedState] = useState<StateOption | null>(null)
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [state, setState] = useState<StateOption[]>([])

  const fetchCountryData = async () => {
    try {
      const response = await api.get('country')
      setCountries(response.data.countries)
    } catch (err) {
      console.error('Error fetching Roles:', err)
    }
    finally {
      setLoading(false)
    }
  }

  const fetchStateData = async () => {
    try {
      const response = await api.get('state')
      setState(response.data.states)
    } catch (err) {
      console.error('Error fetching Roles:', err)
    }
    finally {
      setLoading(false)
    }
  }

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('id', adminStore.school_id?.toString() || '');

      const response = await api.post('get-school', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        const data = response.data.data;
        setSchoolInfoSlice(data);
        setFormData(data);
        setSelectedCountry(data.country_id);
        setSelectedState(data.state_id);
      } else {
        console.warn('API responded with success: false');
        resetSchoolInfoSlice();
      }

    } catch (error) {
      setLoading(false);
      resetSchoolInfoSlice();
      return null

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCountryData()
    fetchStateData()
    fetchProfileData()
  }, [adminStore.school_id])

  const getImageSrc = (src: string) => {
    if (!src) return ''
    return src.startsWith('data:image') || src.startsWith('http')
      ? src
      : ''
  }

  useEffect(() => {
    if (formData) {
      setlLogoSrc(formData.l_logo || '')
      setdLogoSrc(formData.d_logo || '')
      setfLogoSrc(formData.f_logo || '')
      setBackgroundSrc(formData.background_image || '')
    }
  }, [formData])

  const handleFormChange = (field: keyof SchoolInfo, value: SchoolInfo[keyof SchoolInfo]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFileInputChange = (file: ChangeEvent, type: string) => {

    const { files } = file.target as HTMLInputElement

    if (files && files.length !== 0) {
      const selectedFile = files[0]

      // preview image
      const reader = new FileReader()
      reader.onload = () => {
        type === 'd_logo' ? setdLogoSrc(reader.result as string) : type === 'l_logo' ? setlLogoSrc(reader.result as string) : type === 'f_logo' ? setfLogoSrc(reader.result as string) : setBackgroundSrc(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
      // store the actual file instead of base64 string
      type === 'd_logo' ? setdLogoFile(selectedFile as any) : type === 'l_logo' ? setlLogoFile(selectedFile as any) : type === 'f_logo' ? setfLogoFile(selectedFile as any) : setBackgroundFile(selectedFile as any) // ❗ Type assertion since `fileInput` is string
    }
  }

  const onSubmit = async (data: SchoolInfo) => {
    try {
      setLoading(true)
      const formdata = new FormData()
      formdata.append('id', adminStore.school_id.toString() || '')
      formdata.append('phone', String(data.phone))
      formdata.append('name', data.name)
      // formdata.append('username', data.username)
      formdata.append('contact_person_name', data.contact_person_name || '')
      formdata.append('contact_person_email', data.contact_person_email || '')
      formdata.append('abn_number', String(data.abn_number) || '')
      formdata.append('street_number', data.street_number || '')
      formdata.append('street_name', data.street_name || '')
      formdata.append('suburb', data.suburb || '')
      formdata.append('d_logo', dLogoFile || '')
      formdata.append('l_logo', lLogoFile || '')
      formdata.append('f_logo', fLogoFile || '')
      formdata.append('background_image', backgroundFile || '')
      formdata.append('country_id', selectedCountry?.id ? String(selectedCountry.id) : '')
      formdata.append('state_id', selectedState?.id ? String(selectedState.id) : '')
      formdata.append('primary_color', data.primary_color || '')
      formdata.append('secondary_color', data.secondary_color || '')
      formdata.append('accent_color', data.accent_color || '')


      formdata.append('school_id', adminStore.school_id.toString() || '')
      formdata.append('tenant_id', adminStore.tenant_id.toString() || '')


      const response = await api.post('edit-school', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (response.data.success) {
        // router.push(getLocalizedUrl('/dashboards', locale as Locale));
        dispatch(setAdminInfo(response.data.data))
        toast.success(response?.data?.message)
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.username?.[0] ||
        'Something went wrong'
      toast.error(message)
    }
    finally {
      setLoading(false)

    }
  }

  const matchedCountryOption = countries.find(
    (country) => country?.id == selectedCountry
  )

  const matchedStateOption = state.find(
    (s) => s.id == selectedState
  )

  return (
    <Card >

      {/* {loading && <Loader />} */}
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit(formData)
        }}
      >
        <CardContent>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label='User Name'
                value={formData.username || ''}
                placeholder='User Name'
                onChange={e => handleFormChange('name', e.target.value)}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label='Phone'
                value={formData.phone || ''}
                placeholder='Phone'
                onChange={e => handleFormChange('phone', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label='School Name'
                value={formData.name || ''}
                placeholder='School Name'
                onChange={e => handleFormChange('name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                // disabled
                fullWidth
                label='Contact Person name'
                value={formData.contact_person_name || ''}
                placeholder='Contact Person name'
                onChange={e => handleFormChange('contact_person_name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label='Email'
                value={formData.email || formData.contact_person_email || ''}
                placeholder='john.doe@gmail.com'
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label='ABN Number'
                value={formData.abn_number}
                placeholder='00 000 000 000'
                onChange={e => handleFormChange('abn_number', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label='Street Number'
                value={formData.street_number}
                placeholder='Street Number'
                onChange={e => handleFormChange('street_number', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label='Street Name'
                value={formData.street_name || ''}
                placeholder='Street Name'
                onChange={e => handleFormChange('street_name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete
                fullWidth
                options={countries}
                getOptionLabel={(option) => option?.country_name || ''}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                value={matchedCountryOption || selectedCountry}
                onChange={(_, value) => setSelectedCountry(value)}
                renderOption={(props, option) => (
                  <li {...props} key={option.code}>
                    {option.country_name}
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label="Country" />}
                id="select-country"
                disablePortal
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete
                fullWidth
                options={state}
                getOptionLabel={(option) => option?.full_name || ''}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                value={(matchedStateOption || selectedState) as StateOption | null}
                onChange={(event, value) => setSelectedState(value)}
                renderOption={(props, option) => (
                  <li {...props} key={option.code}>
                    {option.full_name}
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label="State" />}
                id="select-state"
                disablePortal
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label='Suburb/Region/town'
                value={formData.suburb || ''}
                placeholder='Suburb/Region/town'
                onChange={e => handleFormChange('suburb', e.target.value)}
              />
            </Grid>
          </Grid>
          {/* </form> */}
        </CardContent>
        <CardContent>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Dark Logo:
                </Typography>
                <div className="flex flex-col gap-2">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #ccc',
                      borderRadius: 1,
                      overflow: 'hidden',
                      width: '100%',
                      height: '50px',
                    }}
                  >
                    <Button
                      component="label"
                      variant="outlined"
                      sx={{
                        borderRadius: 1,
                        borderWidth: "0.13rem",
                        height: '100%',
                        textTransform: 'none',
                      }}
                    >

                      Choose File
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          handleFileInputChange(e, 'd_logo')
                        }}

                      />

                    </Button>
                    <Box
                      sx={{
                        px: 2,
                        fontSize: '0.875rem',
                        color: '#555',
                        minWidth: 120,
                      }}
                    >
                      {dLogoSrc
                        ? (() => {
                          const name = dLogoSrc.split("/").pop() || ''
                          const [base, ext] = name.split(/\.(?=[^\.]+$)/) // Split at last dot
                          return base.length > 5 ? `${base.slice(0, 10)}...${ext ? '.' + ext : ''}` : name
                        })()
                        : 'No file chosen'}
                    </Box>
                  </Box>
                  <img
                    width={200}
                    className='rounded'
                    src={getImageSrc(dLogoSrc)}
                    alt='Dark Logo'
                  />                </div>
              </Box>

            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                light Logo:
              </Typography>
              <div className="flex flex-col gap-2">


                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    overflow: 'hidden',
                    width: '100%',
                    height: '50px',
                  }}
                >
                  <Button
                    component="label"
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      borderWidth: "0.13rem",
                      height: '100%',
                      textTransform: 'none',
                    }}
                  >
                    Choose File
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        handleFileInputChange(e, 'l_logo')
                      }}

                    />

                  </Button>
                  <Box
                    sx={{
                      px: 2,
                      fontSize: '0.875rem',
                      color: '#555',
                      minWidth: 120,
                    }}
                  >
                    {lLogoSrc
                      ? (() => {
                        const name = lLogoSrc.split("/").pop() || ''
                        const [base, ext] = name.split(/\.(?=[^\.]+$)/) // Split at last dot
                        return base.length > 5 ? `${base.slice(0, 10)}...${ext ? '.' + ext : ''}` : name
                      })()
                      : 'No file chosen'}
                  </Box>
                </Box>
                <img
                  width={200}
                  className='rounded'
                  src={getImageSrc(lLogoSrc)}
                  alt='Light Logo'
                />
              </div>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Favicon Image:
              </Typography>
              <div className="flex flex-col gap-2">

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    overflow: 'hidden',
                    width: '100%',
                    height: '50px',
                  }}
                >
                  <Button
                    component="label"
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      borderWidth: "0.13rem",
                      height: '100%',
                      textTransform: 'none',
                    }}
                  >
                    Choose File
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        handleFileInputChange(e, 'f_logo')
                      }}

                    />

                  </Button>
                  <Box
                    sx={{
                      px: 2,
                      fontSize: '0.875rem',
                      color: '#555',
                      minWidth: 120,
                    }}
                  >
                    {fLogoSrc
                      ? (() => {
                        const name = fLogoSrc.split("/").pop() || ''
                        const [base, ext] = name.split(/\.(?=[^\.]+$)/) // Split at last dot
                        return base.length > 5 ? `${base.slice(0, 10)}...${ext ? '.' + ext : ''}` : name
                      })()
                      : 'No file chosen'}
                  </Box>
                </Box>
                <img
                  // height={100}
                  width={70}
                  className='rounded'
                  src={getImageSrc(fLogoSrc)}
                  alt='Favicon Logo'
                />
              </div>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>

              <Typography variant="body2" sx={{ mb: 1 }}>
                Background Image:
              </Typography>
              <div className="flex flex-col gap-2">

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    overflow: 'hidden',
                    width: '100%',
                    height: '50px',
                  }}
                >
                  <Button
                    component="label"
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      borderWidth: "0.13rem",
                      height: '100%',
                      textTransform: 'none',
                    }}
                  >
                    Choose File
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        handleFileInputChange(e, 'background_image')
                      }}

                    />

                  </Button>
                  <Box
                    sx={{
                      px: 2,
                      fontSize: '0.875rem',
                      color: '#555',
                      minWidth: 120,
                    }}
                  >
                    {backgroundSrc
                      ? (() => {
                        const name = backgroundSrc.split("/").pop() || ''
                        const [base, ext] = name.split(/\.(?=[^\.]+$)/) // Split at last dot
                        return base.length > 5 ? `${base.slice(0, 10)}...${ext ? '.' + ext : ''}` : name
                      })()
                      : 'No file chosen'}
                  </Box>
                </Box>
                <img
                  width={100}
                  className='rounded'
                  src={getImageSrc(backgroundSrc)}
                  alt='Background Image'
                />
              </div>
            </Grid>



          </Grid>
        </CardContent>

        <CardContent>
          <Grid container spacing={5}>
            <Grid size={{ xs: 1, sm: 4 }}>
              Primary:
              <TextField
                fullWidth
                type="color"
                value={formData.primary_color || '#000000'}
                onChange={e => handleFormChange('primary_color', e.target.value)}
                variant="outlined"
                className='p-0'
              />
            </Grid>
            <Grid size={{ xs: 4, sm: 4 }}>
              Secondary:

              <TextField
                fullWidth
                type="color"
                value={formData.secondary_color || '#fdfdfd'}
                onChange={e => handleFormChange('secondary_color', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 4, sm: 4 }}>
              Accent:

              <TextField
                className='p-0'
                fullWidth
                type="color"
                value={formData.accent_color || '#e4e4e4'}
                placeholder="Accent Color"
                onChange={e => handleFormChange('accent_color', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
          {/* </form> */}
        </CardContent>
        <CardContent>
          <Button variant='contained' type='submit'>Save</Button>
        </CardContent>
      </form>
    </Card>
  )
}

export default SchoolAccountDetails
