import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/errorHandler'
import { routes } from './routes'

export const app = new Hono()

app.use('*', corsMiddleware)
app.onError(errorHandler)

app.get('/health', (c) => c.json({ ok: true, timestamp: new Date().toISOString() }))

app.route('/api/v1', routes)
