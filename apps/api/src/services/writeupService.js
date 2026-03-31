import { prisma } from '../lib/prisma.js'
import { generateWriteup } from './aiService.js'

export const triggerWriteupGeneration = async (userId, submissionId) => {
  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, userId }
  })
  if (!submission) {
    const err = new Error('Submission not found')
    err.status = 404
    throw err
  }

  const existing = await prisma.writeup.findUnique({ where: { submissionId } })
  if (existing?.status === 'completed') return existing

  const writeup = existing
    ? await prisma.writeup.update({
        where: { submissionId },
        data: { status: 'pending', failureReason: null }
      })
    : await prisma.writeup.create({ data: { submissionId, status: 'pending' } })

  try {
    const generated = await generateWriteup({
      code: submission.code,
      notes: submission.notes,
      language: submission.language,
      title: submission.title,
      problemUrl: submission.problemUrl
    })

    return prisma.writeup.update({
      where: { id: writeup.id },
      data: {
        status: 'completed',
        intuition: generated.intuition,
        approach: generated.approach,
        algorithm: generated.algorithm,
        timeComplexity: generated.timeComplexity,
        spaceComplexity: generated.spaceComplexity,
        markdown: buildMarkdown(submission, generated),
        failureReason: null
      }
    })
  } catch (err) {
    await prisma.writeup.update({
      where: { id: writeup.id },
      data: { status: 'failed', failureReason: err.message }
    })
    throw err
  }
}

export const buildMarkdown = (submission, generated) => {
  return [
    `# ${submission.title}`,
    submission.problemUrl ? `Problem: ${submission.problemUrl}` : null,
    '',
    '## Intuition',
    generated.intuition,
    '',
    '## Approach',
    generated.approach,
    '',
    '## Algorithm',
    generated.algorithm,
    '',
    '## Time Complexity',
    generated.timeComplexity,
    '',
    '## Space Complexity',
    generated.spaceComplexity,
    '',
    '## Code',
    '```' + submission.language + '\n' + submission.code + '\n```'
  ]
    .filter(Boolean)
    .join('\n')
}
