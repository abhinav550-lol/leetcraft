import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// Public — no auth required
router.get('/:token', async (req, res, next) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { shareToken: req.params.token },
      include: {
        writeup: true,
        user: { select: { name: true } }
      }
    })

    if (!submission || !submission.writeup || submission.writeup.status !== 'completed') {
      return res.status(404).json({ error: 'Shared write-up not found' })
    }

    res.json({
      title: submission.title,
      problemUrl: submission.problemUrl,
      language: submission.language,
      code: submission.code,
      author: submission.user?.name || 'Anonymous',
      createdAt: submission.createdAt,
      writeup: {
        intuition: submission.writeup.intuition,
        approach: submission.writeup.approach,
        algorithm: submission.writeup.algorithm,
        timeComplexity: submission.writeup.timeComplexity,
        spaceComplexity: submission.writeup.spaceComplexity
      }
    })
  } catch (err) {
    next(err)
  }
})

export default router
