import request from 'supertest'
import { createApp } from '../src/app.js'

describe('health endpoint', () => {
  const app = createApp()

  it('returns ok', async () => {
    const res = await request(app).get('/api/v1/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
