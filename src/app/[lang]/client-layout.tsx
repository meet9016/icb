'use client'

import Loader from '@/components/Loader'
import { resetAdminInfo, setAdminInfo } from '@/redux-store/slices/admin'
import axios, { AxiosResponse } from 'axios'
import { usePathname, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux-store'

export interface AdminData {
  accent_color: string
  background_image: string
  d_logo: string
  domain: string
  f_logo: string
  l_logo: string
  name: string
  primary_color: string
  school_id: number
  secondary_color: string
  tenant_id: string
  username: string
  id: string
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const [hostname, setHostname] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [adminData, setAdminData] = useState<{ name: string; favicon: string }>({ name: '', favicon: '/favicon.ico' })
  const pathname = usePathname()
  const { lang: locale } = useParams()
  const adminStore = useSelector((state: RootState) => state.admin)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location) return
    const host = window.location.hostname
    setHostname(host.split('.')[0])
  }, [])

  useEffect(() => {
    if (!adminStore.name && !adminStore.f_logo) return

    // Update title only if it's different
    // if (document.title !== adminStore.name) {
    //     document.title = adminStore.name
    // }
    const cleaned = pathname.replace(/^\/en\//, '/').replace(/^\/apps\//, '/')
    const formattedPath =
      cleaned
        .split('/')
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' / ') || 'Home'

    document.title = `${formattedPath}`

    // Update f_logo dynamically
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    if (link.href !== adminStore.f_logo) {
      link.href = adminStore.f_logo
    }
  }, [adminStore, pathname])

  const firstApiCall = async () => {
    // try {
    // setLoading(true);
    const hostNameParts = window.location.hostname.split('.');
    console.log("hostNameParts",hostNameParts); 
    
    // const hostNameData = hostNameParts.length > 2 ? 'icbrisbane' : 'icbmyschool';
    const hostNameData = hostNameParts.length > 2 ? hostNameParts[0] : 'icbmyschool';
    const baseURL = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!baseURL) {
      throw new Error('NEXT_PUBLIC_APP_URL is not defined')
    }

    const formData = new URLSearchParams()
    formData.append('type', hostNameData)
    
    try {
      const res = await fetch(`${baseURL}test-domain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })

      const data = await res.json() // 🔥 YOU MISSED THIS
      // console.log('✅ Final Parsed Response:', data)

      if (data.status === 200) {
        dispatch(setAdminInfo(data.data))
        //   setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error calling API', error)
    }
  }

  useEffect(() => {
    firstApiCall()
  }, [])

  return (
    <>
      {loading && <Loader />}
      {children}
    </>
  )
}
