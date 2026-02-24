import { Hono } from 'hono'
import { conversationRoutes } from './conversations.routes'
import { teamRoutes } from './teams.routes'

export const meetRoutes = new Hono()

meetRoutes.route('/conversations', conversationRoutes)
meetRoutes.route('/teams', teamRoutes)
