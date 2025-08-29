'use client'
import { useEffect, useState } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import type { ApexOptions } from 'apexcharts'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type DataType = {
  title: string
  value: number
  colorClass: string
}

// Class performance data (percentages)
const series = [
  {
    data: [84, 78, 86, 75, 81, 77, 83, 79, 72, 88, 76, 82]
  }
]

const data1: DataType[] = [
  { title: 'Class 1', value: 84, colorClass: 'text-primary' },
  { title: 'Class 2', value: 78, colorClass: 'text-info' },
  { title: 'Class 3', value: 86, colorClass: 'text-success' },
  { title: 'Class 4', value: 75, colorClass: 'text-warning' },
  { title: 'Class 5', value: 81, colorClass: 'text-error' },
  { title: 'Class 6', value: 77, colorClass: 'text-secondary' }
]

const data2: DataType[] = [
  { title: 'Class 7', value: 83, colorClass: 'text-primary' },
  { title: 'Class 8', value: 79, colorClass: 'text-info' },
  { title: 'Class 9', value: 72, colorClass: 'text-success' },
  { title: 'Class 10', value: 88, colorClass: 'text-warning' },
  { title: 'Class 11', value: 76, colorClass: 'text-error' },
  { title: 'Class 12', value: 82, colorClass: 'text-secondary' }
]

const labels = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']

const InterestedTopics = () => {
  // Hooks
  const theme = useTheme()
  const [mounted, setMounted] = useState(false)

  // Effect for theme change
  useEffect(() => {
    setMounted(true)

    return () => setMounted(false)
  }, [])

  // Vars
  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      foreColor: 'var(--mui-palette-text-primary)'
    },
    theme: {
      mode: theme.palette.mode
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: true,
        borderRadius: 7,
        borderRadiusApplication: 'end'
      }
    },

    colors: [
      'var(--mui-palette-primary-main)',
      'var(--mui-palette-info-main)',
      'var(--mui-palette-success-main)',
      'var(--mui-palette-warning-main)',
      'var(--mui-palette-error-main)',
      'var(--mui-palette-secondary-main)',
      'var(--mui-palette-primary-main)',
      'var(--mui-palette-info-main)',
      'var(--mui-palette-success-main)',
      'var(--mui-palette-warning-main)',
      'var(--mui-palette-error-main)',
      'var(--mui-palette-secondary-main)'
    ],
    grid: {
      strokeDashArray: 8,
      borderColor: 'var(--mui-palette-divider)',
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: -30,
        left: 21,
        right: 25,
        bottom: -5
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: 8,
      style: {
        colors: [theme.palette.mode === 'dark' ? '#fff' : '#000'],
        fontWeight: 500,
        fontSize: '0.8125rem'
      },
      formatter(val: string, opt: any) {
        return labels[opt.dataPointIndex]
      }
    },
    tooltip: {
      enabled: true,
      style: {
        fontSize: '0.75rem'
      },
      onDatasetHover: {
        highlightDataSeries: false
      },
      custom({ series, seriesIndex, dataPointIndex }: any) {
        return `<div class="px-2 py-1">
          <span>${labels[dataPointIndex]}: ${series[seriesIndex][dataPointIndex]}%</span>
        </div>`
      }
    },
    legend: { show: false },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: ['12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'],
      labels: {
        formatter: val => `${val}%`,
        style: {
          fontSize: '0.8125rem',
          colors: 'var(--mui-palette-text-disabled)'
        }
      }
    },
    yaxis: {
      labels: {
        align: theme.direction === 'rtl' ? 'right' : 'left',
        style: {
          fontWeight: 500,
          fontSize: '0.8125rem',
          colors: 'var(--mui-palette-text-disabled)'
        },
        offsetX: theme.direction === 'rtl' ? -15 : -30
      }
    }
  }

  return (
    <Card>
      <CardHeader
        title='Class Performance Comparison'
        subheader='Average scores across all subjects (Academic Year 2024-25)'
        action={<OptionMenu options={['Export PDF', 'Print', 'Share']} />}
      />
      <CardContent>
        {mounted && (
          <Grid container>
            <Grid size={{ xs: 12, sm: 6 }} className='max-sm:mbe-6'>
              <AppReactApexCharts type='bar' height={400} width='100%' series={series} options={options} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <div className='flex justify-around items-start'>
                <div className='flex flex-col gap-y-6'>
                  {data1.map((item, i) => (
                    <div key={i} className='flex gap-2'>
                      <i className={classnames('ri-circle-fill text-xs m-[5px]', item.colorClass)} />
                      <div>
                        <Typography>{item.title}</Typography>
                        <Typography variant='h5'>{`${item.value}%`}</Typography>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='flex flex-col gap-y-6'>
                  {data2.map((item, i) => (
                    <div key={i} className='flex gap-2'>
                      <i className={classnames('ri-circle-fill text-xs m-[5px]', item.colorClass)} />
                      <div>
                        <Typography>{item.title}</Typography>
                        <Typography variant='h5'>{`${item.value}%`}</Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  )
}

export default InterestedTopics
