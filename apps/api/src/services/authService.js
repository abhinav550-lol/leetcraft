import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { config } from '../config.js'

const issueToken = (payload, secret, expiresIn) => jwt.sign(payload, secret, { expiresIn })

export const registerUser = async ({ email, password, name }) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const err = new Error('Email already registered')
    err.status = 400
    throw err
  }

  const passwordHash = await bcrypt.hash(password, config.passwordSaltRounds)
  const user = await prisma.user.create({ data: { email, passwordHash, name } })
  const accessToken = issueToken({ sub: user.id, email: user.email }, config.jwt.secret, config.jwt.expiresIn)
  const refreshToken = issueToken({ sub: user.id, email: user.email }, config.jwt.refreshSecret, config.jwt.refreshExpiresIn)
  return { user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken }
}

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const err = new Error('Invalid credentials')
    err.status = 401
    throw err
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    const err = new Error('Invalid credentials')
    err.status = 401
    throw err
  }

  const accessToken = issueToken({ sub: user.id, email: user.email }, config.jwt.secret, config.jwt.expiresIn)
  const refreshToken = issueToken({ sub: user.id, email: user.email }, config.jwt.refreshSecret, config.jwt.refreshExpiresIn)
  return { user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken }
}
