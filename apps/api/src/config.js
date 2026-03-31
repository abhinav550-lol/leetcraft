import dotenv from 'dotenv'

dotenv.config()

const required = (value, name) => {
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

const requiredOrTestDefault = (value, fallback, name) => {
  if (process.env.NODE_ENV === 'test') return value || fallback
  return required(value, name)
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
  jwt: {
    secret: requiredOrTestDefault(process.env.JWT_SECRET, 'test-secret', 'JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: requiredOrTestDefault(process.env.JWT_REFRESH_SECRET, 'test-refresh', 'JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  passwordSaltRounds: Number(process.env.PASSWORD_SALT_ROUNDS || 10),
  groq: {
    apiKey: requiredOrTestDefault(process.env.GROQ_API_KEY, 'test-groq-key', 'GROQ_API_KEY'),
    model: process.env.GROQ_MODEL || 'llama3-70b-8192',
    timeoutMs: Number(process.env.GROQ_TIMEOUT_MS || 30000)
  },
  exportTmpDir: process.env.EXPORT_TMP_DIR || './tmp/exports'
}
