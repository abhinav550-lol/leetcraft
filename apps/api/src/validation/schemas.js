import { z } from 'zod'

export const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1).optional()
    })
  }),
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8)
    })
  })
}

export const submissionSchemas = {
  create: z.object({
    body: z.object({
      title: z.string().min(1),
      problemUrl: z.string().url().optional(),
      language: z.string().min(1),
      code: z.string().min(1),
      notes: z.string().optional()
    })
  }),
  generate: z.object({
    params: z.object({
      submissionId: z.string().min(1)
    })
  })
}
