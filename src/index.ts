import { Hono } from 'hono'
import { kerberosAuth } from './middleware/kerberos-auth'
import { serve } from '@hono/node-server'

const app = new Hono()

// Apply Kerberos authentication middleware to all routes
app.use('*', kerberosAuth())

app.get('/currentuser', async (c) => {
  // The user information will be available from the context after authentication
  const user = c.get('user')
  
  return c.json({
    username: user.name,
    realm: user.realm,
    authenticated: true
  })
})

// Start the server
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on port ${info.port}`)
})

export default app 