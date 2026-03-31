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
Return JSON ONLY with these fields: intuition, approach, algorithm, timeComplexity, spaceComplexity.

Guidelines for each field:
- intuition: Explain WHY this approach works. Describe the key insight, relate it to known patterns or data-structure properties. At least 3-4 sentences.
- approach: Give a detailed step-by-step strategy. Explain design choices, why alternatives were rejected, and how edge cases are handled. At least 4-5 sentences.
- algorithm: Provide a clear, numbered step-by-step walkthrough of exactly what the code does. Include a small dry-run example if helpful. Be thorough.
- timeComplexity: State the Big-O and explain exactly which operations contribute to it and why.
- spaceComplexity: State the Big-O and explain what auxiliary data structures consume memory and why.

Be detailed and educational. Write as if teaching a student who wants to deeply understand the solution.`

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
    temperature: 0.2,
    max_tokens: 1024,
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
