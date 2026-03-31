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
Given user-provided code and optional notes, produce a structured write-up.

Return JSON ONLY with these fields: intuition, approach, algorithm, timeComplexity, spaceComplexity.

STRICT OUTPUT RULES:
- Use bullet points (•) in ALL sections except complexity.
- Each bullet MUST be concise (max 3 lines per bullet).
- Prefer more bullets instead of long paragraphs.
- Avoid long paragraphs completely.
- Keep spacing clean and readable for LeetCode.
- Do NOT add extra keys or text outside JSON.

Guidelines for each field:

- intuition:
  Explain WHY the approach works.

  Sub-parts (use bullets):
  • Main Insight: Core observation that unlocks the solution  
  • Pattern: Related concept (greedy / dp / graph / etc.) if applicable  
  • Why it Works: Reasoning behind correctness  
  • Optimization Thought: Why better than brute force  

  Constraints:
  - Minimum 4 bullets
  - Keep explanations crisp, not story-like

- approach:
  Explain HOW to build the solution step-by-step.

  Sub-parts (use bullets):
  • Strategy Overview: High-level plan  
  • Key Components: Data structures / variables used  
  • Design Decisions: Why this approach was chosen  
  • Edge Cases: Important corner cases handled  
  • Flow: How data moves through the solution  

  Constraints:
  - Minimum 5 bullets
  - Avoid paragraphs, only structured bullets

- algorithm:
  Provide exact execution steps matching the code.

  Sub-parts (use numbered bullets):
  1. Initialization: Setup and variables  
  2. Main Logic: Core iteration / recursion  
  3. Conditions: Important checks and transitions  
  4. Result Formation: How answer is computed  
  5. Dry Run: Small example walkthrough  

  Constraints:
  - Each step must be concise and code-aligned
  - Keep clarity over verbosity

- timeComplexity:
  - Format: O(...) + 1 short explanation
  - Max 2 lines total
  - Mention dominant operations only

- spaceComplexity:
  - Format: O(...) + 1 short explanation
  - Max 2 lines total
  - Mention auxiliary space only

FINAL NOTES:
- Make it look like a clean LeetCode editorial.
- Keep it beginner-friendly but technically accurate.
- Avoid unnecessary repetition.
- Do NOT include markdown/code fences.
- Ensure JSON is valid and parsable.`

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
