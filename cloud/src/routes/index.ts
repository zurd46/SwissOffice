import { Hono } from 'hono'
import { authRoutes } from './auth.routes'
import { documentRoutes } from './documents.routes'
import { versionRoutes } from './versions.routes'
import { shareRoutes } from './shares.routes'
import { emailRoutes } from './email.routes'
import { contactRoutes } from './contacts.routes'
import { calendarRoutes, eventRoutes } from './calendars.routes'
import { meetRoutes } from './meet'

export const routes = new Hono()

routes.route('/auth', authRoutes)
routes.route('/documents', documentRoutes)
// Versionen und Freigaben sind unter /documents/:id/ verschachtelt
routes.route('/documents', versionRoutes)
routes.route('/documents', shareRoutes)
routes.route('/email', emailRoutes)
routes.route('/contacts', contactRoutes)
routes.route('/calendars', calendarRoutes)
routes.route('/events', eventRoutes)
// Meet — Chat, Teams, Channels, Calls
routes.route('/meet', meetRoutes)
