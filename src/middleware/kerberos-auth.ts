import { Context, Next } from 'hono'
import { KerberosClient } from 'kerberos'

type User = {
  name: string
  realm: string
}

declare module 'hono' {
  interface ContextVariableMap {
    user: User
  }
}

export const kerberosAuth = () => {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Negotiate ')) {
      c.header('WWW-Authenticate', 'Negotiate')
      return c.text('Unauthorized', 401)
    }

    try {
      const token = authHeader.substring('Negotiate '.length)
      const client = new KerberosClient()
      
      const clientResponse = await client.step(token)
      
      // Extract user information from Kerberos response
      const [name, realm] = clientResponse.username.split('@')
      
      // Store user information in context
      c.set('user', {
        name,
        realm
      })

      // Set the Negotiate response header
      c.header('WWW-Authenticate', `Negotiate ${clientResponse.response}`)
      
      await next()
    } catch (error) {
      console.error('Kerberos authentication error:', error)
      return c.text('Authentication failed', 401)
    }
  }
} 