/**
 * HTTPS → HTTP redirect server
 * Listens on port 8443 (no admin rights needed) and redirects all
 * traffic to the Vite dev server on port 5173.
 *
 * Run: node scripts/https-redirect.mjs
 */

import https from 'node:https'
import selfsigned from 'selfsigned'
import os from 'node:os'

const HTTPS_PORT = 8443
const HTTP_PORT  = 5173

// Generate a throwaway self-signed cert for the TLS handshake
const attrs = [{ name: 'commonName', value: 'mypantry-redirect' }]
const pems   = selfsigned.generate(attrs, { days: 365 })

const server = https.createServer({ key: pems.private, cert: pems.cert }, (req, res) => {
  const host   = (req.headers.host ?? '').replace(/:\d+$/, '')
  const target = `http://${host}:${HTTP_PORT}${req.url}`
  res.writeHead(301, { Location: target })
  res.end()
})

server.listen(HTTPS_PORT, '0.0.0.0', () => {
  const ifaces  = os.networkInterfaces()
  const localIp = Object.values(ifaces)
    .flat()
    .find((i) => i?.family === 'IPv4' && !i.internal)?.address ?? 'localhost'

  console.log(`HTTPS redirect listening on:`)
  console.log(`  https://localhost:${HTTPS_PORT}  →  http://localhost:${HTTP_PORT}`)
  console.log(`  https://${localIp}:${HTTPS_PORT}  →  http://${localIp}:${HTTP_PORT}`)
  console.log(`\nBrowsers will show a cert warning — click through once per session.`)
})
