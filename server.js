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
