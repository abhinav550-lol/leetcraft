import axios from 'axios'
import { z } from 'zod'
import { config } from '../config.js'

const writeupSchema = z.object({
  intuition: z.string().min(1),
  approach: z.string().min(1),
  algorithm: z.string().min(1),
  timeComplexity: z.string().min(1),
  spaceComplexity: z.string().min(1)
})

const systemPrompt = `You are an expert competitive programming tutor that explains accepted LeetCode solutions in depth.

Given user-provided code and optional notes, produce a thorough, detailed structured write-up.

Output Format:
Return JSON ONLY with these exact fields:

intuition
approach
algorithm
timeComplexity
spaceComplexity

Guidelines:

intuition:

Explain WHY this approach works.
Describe the key insight behind the solution.
Relate it to known patterns, observations, or data-structure properties where relevant.
Write at least 3–4 sentences.

approach:

Give a detailed step-by-step strategy.
Explain important design choices.
Mention why possible alternatives may be less suitable, if relevant.
Cover how edge cases are handled.
Write at least 4–5 sentences.

algorithm:

Provide a clear, numbered, step-by-step walkthrough of exactly what the code does.
Keep the explanation aligned with the actual implementation.
Include a small dry run if it helps understanding.
Be thorough and easy to follow.

timeComplexity:

State the Big-O time complexity.
Explain why in one line

spaceComplexity:

State the Big-O space complexity.
Explain why in one line

Writing Style:

Be detailed, educational, and student-friendly.
Write as if teaching someone who wants to deeply understand the solution.
Focus on clarity, correctness, and intuition..`

export const generateWriteup = async ({ code, notes, language, title, problemUrl }) => {
  const prompt = `Problem: ${title || 'Untitled'}${problemUrl ? `\nURL: ${problemUrl}` : ''}\nLanguage: ${language}\nNotes: ${notes || 'None'}\nCode:\n${code}`

  const client = axios.create({
    baseURL: 'https://api.groq.com/openai/v1',
    headers: {
      Authorization: `Bearer ${config.groq.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: config.groq.timeoutMs
  })

  const response = await client.post('/chat/completions', {
    model: config.groq.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1500,
    response_format: { type: 'json_object' }
  })

  let content = response?.data?.choices?.[0]?.message?.content?.trim()
  if (!content) {
    const err = new Error('Empty response from Groq')
    err.status = 502
    throw err
  }

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch (parseErr) {
    const err = new Error('Failed to parse Groq response')
    err.status = 502
    throw err
  }

  const result = writeupSchema.safeParse(parsed)
  if (!result.success) {
    const err = new Error('Groq response missing required fields')
    err.status = 502
    throw err
  }

  return result.data
}
