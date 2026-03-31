import { Router } from 'express'
import { authRateLimiter } from '../middleware/rateLimit.js'
import { validate } from '../middleware/validate.js'
import { authSchemas } from '../validation/schemas.js'
import { registerUser, loginUser } from '../services/authService.js'

const router = Router()

router.post('/register', authRateLimiter, validate(authSchemas.register), async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.validated.body)
    res.status(201).json({ user, accessToken, refreshToken })
  } catch (err) {
    next(err)
  }
})

router.post('/login', authRateLimiter, validate(authSchemas.login), async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.validated.body)
    res.json({ user, accessToken, refreshToken })
  } catch (err) {
    next(err)
  }
})

export default router
