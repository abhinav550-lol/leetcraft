import { prisma } from '../lib/prisma.js'

export const createSubmission = async (userId, data) => {
  return prisma.submission.create({
    data: {
      title: data.title,
      problemUrl: data.problemUrl,
      language: data.language,
      code: data.code,
      notes: data.notes,
      userId
    }
  })
}

export const listSubmissions = async (userId, { skip = 0, take = 20 } = {}) => {
  return prisma.submission.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: { writeup: true }
  })
}

export const getSubmission = async (userId, submissionId) => {
  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, userId },
    include: { writeup: true }
  })
  if (!submission) {
    const err = new Error('Submission not found')
    err.status = 404
    throw err
  }
  return submission
}
