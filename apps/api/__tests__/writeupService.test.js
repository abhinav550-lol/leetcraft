import { buildMarkdown } from '../src/services/writeupService.js'

describe('buildMarkdown', () => {
  it('formats write-up content into markdown', () => {
    const submission = {
      title: 'Two Sum',
      problemUrl: 'https://leetcode.com/problems/two-sum',
      language: 'javascript',
      code: 'function twoSum() { return [] }'
    }
    const generated = {
      intuition: 'Use a hash map to track complements.',
      approach: 'Iterate once and track seen numbers.',
      algorithm: 'For each number, check if target - num exists.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    }

    const md = buildMarkdown(submission, generated)
    expect(md).toContain('# Two Sum')
    expect(md).toContain('## Intuition')
    expect(md).toContain(generated.intuition)
    expect(md).toContain('```javascript')
    expect(md).toContain(submission.code)
  })
})
