/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  exp: number;
}

const AuthGuard = ({ children, locale }: ChildrenType & { locale: Locale }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

 useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);

      const now = Date.now() / 1000; // Current time in seconds
      if (decoded.exp < now) {
        localStorage.removeItem('auth_token'); // Optional: auto-remove
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) return null // Or show a loader

  return <>{isAuthenticated ? children : <AuthRedirect lang={locale} />}</>
}

export default AuthGuard
