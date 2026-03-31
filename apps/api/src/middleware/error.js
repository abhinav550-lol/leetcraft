import { logger } from '../logger.js'

export const notFound = (req, res) => {
  res.status(404).json({ error: 'Not Found' })
}

export const errorHandler = (err, req, res, next) => {
  logger.error({ err }, 'Unhandled error')
  if (res.headersSent) return next(err)
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Internal Server Error' })
}
