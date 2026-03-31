import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { submissionSchemas } from '../validation/schemas.js'
import { createSubmission, getSubmission, listSubmissions } from '../services/submissionService.js'
import { triggerWriteupGeneration } from '../services/writeupService.js'
import { exportMarkdown, exportPdf } from '../services/exportService.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const { skip = 0, take = 20 } = req.query
    const submissions = await listSubmissions(req.user.id, { skip: Number(skip), take: Number(take) })
    res.json({ submissions })
  } catch (err) {
    next(err)
  }
})

router.post('/', validate(submissionSchemas.create), async (req, res, next) => {
  try {
    const submission = await createSubmission(req.user.id, req.validated.body)
    res.status(201).json({ submission })
  } catch (err) {
    next(err)
  }
})

router.post('/:submissionId/generate', validate(submissionSchemas.generate), async (req, res, next) => {
  try {
    const writeup = await triggerWriteupGeneration(req.user.id, req.validated.params.submissionId)
    res.json({ writeup })
  } catch (err) {
    next(err)
  }
})

router.get('/:submissionId/writeup', async (req, res, next) => {
  try {
    const submission = await getSubmission(req.user.id, req.params.submissionId)
    res.json({ writeup: submission.writeup })
  } catch (err) {
    next(err)
  }
})

router.get('/:submissionId/writeup/export', async (req, res, next) => {
  try {
    const format = (req.query.format || 'md').toLowerCase()
    const submission = await getSubmission(req.user.id, req.params.submissionId)
    if (!submission.writeup || submission.writeup.status !== 'completed') {
      const err = new Error('Writeup not ready')
      err.status = 400
      throw err
    }

    if (format === 'pdf') {
      const pdf = await exportPdf(submission.writeup.markdown)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${submission.id}.pdf"`)
      return res.send(pdf)
    }

    const mdBuffer = exportMarkdown(submission.writeup.markdown)
    res.setHeader('Content-Type', 'text/markdown')
    res.setHeader('Content-Disposition', `attachment; filename="${submission.id}.md"`)
    return res.send(mdBuffer)
  } catch (err) {
    next(err)
  }
})

router.post('/:submissionId/share', async (req, res, next) => {
  try {
    const submission = await getSubmission(req.user.id, req.params.submissionId)
    if (submission.shareToken) {
      return res.json({ shareToken: submission.shareToken })
    }
    const { randomUUID } = await import('crypto')
    const token = randomUUID()
    await prisma.submission.update({
      where: { id: submission.id },
      data: { shareToken: token }
    })
    res.json({ shareToken: token })
  } catch (err) {
    next(err)
  }
})

router.delete('/:submissionId/share', async (req, res, next) => {
  try {
    const submission = await getSubmission(req.user.id, req.params.submissionId)
    await prisma.submission.update({
      where: { id: submission.id },
      data: { shareToken: null }
    })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
