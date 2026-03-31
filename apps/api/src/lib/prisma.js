import { PrismaClient } from '@prisma/client'
import { logger } from '../logger.js'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['warn', 'error'] : ['query', 'info', 'warn', 'error']
})

prisma.$on('error', (e) => logger.error(e, 'Prisma error'))

export { prisma }
