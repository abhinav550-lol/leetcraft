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

- intuition:
  Explain WHY this approach works and what core idea makes it effective.

  Sub-parts to cover:
  1. Main Insight:
     Describe the key observation that unlocks the solution.
  2. Pattern Recognition:
     Relate it to a known pattern, data structure property, or problem-solving technique when relevant.
  3. Why It Works:
     Explain why this idea correctly solves the problem.
  4. High-Level Reasoning:
     Briefly mention why this direction is better than brute force or more naive approaches.

  Writing style:
  - At least 3-4 sentences.
  - Use spaced paragraphs so it looks clean and readable on LeetCode.
  - Keep it explanatory, not just descriptive.

- approach:
  Give a detailed strategy of how the solution is built and why each decision was made.

  Sub-parts to cover:
  1. Overall Strategy:
     Explain the full plan before diving into implementation details.
  2. Key Components:
     Describe the important variables, data structures, helper functions, or states used.
  3. Design Choices:
     Explain why this implementation choice is suitable and mention better-known alternatives only if useful.
  4. Edge Cases:
     Mention how the solution handles tricky cases, corner cases, or constraints.
  5. Correctness Flow:
     Show how each part of the approach contributes to the final answer.

  Writing style:
  - At least 4-5 sentences.
  - Add spacing between ideas/paragraphs so the section does not look cluttered.
  - Make it feel like a polished editorial explanation suitable for LeetCode.

- algorithm:
  Provide a clear, step-by-step walkthrough of exactly what the code does.

  Sub-parts to cover:
  1. Initialization:
     Explain the setup, variable declarations, and any preprocessing.
  2. Core Execution:
     Walk through the main logic in the same order as the code.
  3. Condition Handling:
     Explain important branches, checks, transitions, or updates.
  4. Final Result:
     Show how the answer is produced and returned.
  5. Dry Run:
     Include a small example walkthrough if it helps understanding.

  Writing style:
  - Use numbered steps.
  - Be thorough and code-aligned.
  - Keep spacing between steps so it remains easy to read on LeetCode.

- timeComplexity:
  State the Big-O complexity clearly and explain the contributing operations.

  Writing style:
  - Maximum 2 lines.
  - Concise and direct.
  - Mention the dominant loop, recursion, or data structure operation responsible.

- spaceComplexity:
  State the Big-O auxiliary space clearly and explain what consumes memory.

  Writing style:
  - Maximum 2 lines.
  - Concise and direct.
  - Mention recursion stack, extra arrays, maps, sets, queues, or other auxiliary structures if used.

Additional formatting requirements:
- Return valid JSON ONLY.
- Do not add extra keys.
- Write in a polished LeetCode editorial style.
- Keep explanations educational and beginner-friendly, but still detailed.
- Add natural spacing within each field using newline breaks so the content looks clean and not cluttered.
- Do not use markdown code fences.
- Do not make timeComplexity or spaceComplexity verbose.
- Ensure the write-up teaches both the intuition behind the solution and the exact flow of the code.`

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
