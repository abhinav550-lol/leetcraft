import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import pinoHttp from 'pino-http'
import { config } from './config.js'
import { logger } from './logger.js'
import { apiRateLimiter } from './middleware/rateLimit.js'
import { notFound, errorHandler } from './middleware/error.js'
import healthRoutes from './routes/health.js'
import authRoutes from './routes/auth.js'
import submissionRoutes from './routes/submissions.js'
import shareRoutes from './routes/share.js'

export const createApp = () => {
  const app = express()

  app.use(pinoHttp({ logger }))
  app.use(helmet())
  app.use(cors({ origin: config.clientOrigin, credentials: true }))
  app.use(compression())
  app.use(express.json({ limit: '1mb' }))
  app.use(apiRateLimiter)

  app.use('/api/v1', healthRoutes)
  app.use('/api/v1/auth', authRoutes)
  app.use('/api/v1/submissions', submissionRoutes)
  app.use('/api/v1/share', shareRoutes)

  app.use(notFound)
  app.use(errorHandler)
  return app
}
