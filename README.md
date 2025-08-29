This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: process.env.BASEPATH || '',
  trailingSlash: true, 
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en/login', // You wanted login, not dashboards/crm
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/login',
        permanent: true,
        locale: false
      },
      {
        source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
        destination: '/en/:path',
        permanent: true,
        locale: false
      }
    ]
  },

  }

export default nextConfig

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const host = req.headers.host || ''
    const subdomain = host.split('.')[0]
    req.subdomain = subdomain
    handle(req, res, parsedUrl)
  }).listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`)
  })
})


# ---------------------------------------------------------------------
# App
# ---------------------------------------------------------------------
BASEPATH=
NEXT_PUBLIC_APP_URL=https://icbapp.site
NEXT_PUBLIC_DOCS_URL=https://icbapp.site/docs

# ---------------------------------------------------------------------
# Authentication (NextAuth.js)
# ---------------------------------------------------------------------
NEXTAUTH_BASEPATH=/api/auth
NEXTAUTH_URL=https://masteradmin.icbapp.site/api
NEXTAUTH_SECRET=T4KqUtiMaZIn01zqJ7popTPyxw7H5IrjT49dOK0tEm8=

# ---------------------------------------------------------------------
# Google OAuth 2.0 (optional)
# ---------------------------------------------------------------------
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ---------------------------------------------------------------------
# API (used in frontend/backend calls)
# ---------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=https://masteradmin.icbapp.site/api/
NEXT_PUBLIC_API_URL=https://masteradmin.icbapp.site/api/

# ---------------------------------------------------------------------
# Mapbox (optional, for map features)
# ---------------------------------------------------------------------
MAPBOX_ACCESS_TOKEN=


# -----------------------------------------------------------------------------
# App
# -----------------------------------------------------------------------------
BASEPATH=
NEXT_PUBLIC_APP_URL=http://localhost:3000${BASEPATH}

# -----------------------------------------------------------------------------
# Authentication (NextAuth.js)
# -----------------------------------------------------------------------------
NEXTAUTH_BASEPATH=${BASEPATH}/api/auth
NEXTAUTH_URL=https://masteradmin.icbapp.site/api
NEXTAUTH_SECRET=T4KqUtiMaZIn01zqJ7popTPyxw7H5IrjT49dOK0tEm8=


# Google OAuth 2.0 (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# -----------------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------------
DATABASE_URL=

# -----------------------------------------------------------------------------
# API
# -----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=https://masteradmin.icbapp.site/api/
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_APP_URL}



# -----------------------------------------------------------------------------
# Mapbox
# -----------------------------------------------------------------------------
MAPBOX_ACCESS_TOKEN=

