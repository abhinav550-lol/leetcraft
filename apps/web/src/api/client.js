const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

const getStored = () => {
  const raw = localStorage.getItem('leetcraft_auth')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

const store = (data) => {
  localStorage.setItem('leetcraft_auth', JSON.stringify(data))
}

export const clearSession = () => {
  localStorage.removeItem('leetcraft_auth')
}

export const getSession = () => getStored()

const request = async (path, { method = 'GET', body, token, headers = {} } = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : await res.text()
  if (!res.ok) {
    const message = isJson ? data?.error || 'Request failed' : 'Request failed'
    throw new Error(message)
  }
  return data
}

export const authApi = {
  register: async (payload) => {
    const data = await request('/auth/register', { method: 'POST', body: payload })
    store(data)
    return data
  },
  login: async (payload) => {
    const data = await request('/auth/login', { method: 'POST', body: payload })
    store(data)
    return data
  }
}

export const submissionsApi = {
  list: async (token) => request('/submissions', { token }),
  create: async (token, payload) => request('/submissions', { method: 'POST', body: payload, token }),
  generate: async (token, submissionId) => request(`/submissions/${submissionId}/generate`, { method: 'POST', token }),
  getWriteup: async (token, submissionId) => request(`/submissions/${submissionId}/writeup`, { token }),
  share: async (token, submissionId) => request(`/submissions/${submissionId}/share`, { method: 'POST', token }),
  unshare: async (token, submissionId) => request(`/submissions/${submissionId}/share`, { method: 'DELETE', token }),
  export: async (token, submissionId, format = 'md') => {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}/writeup/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      throw new Error('Export failed')
    }
    const blob = await res.blob()
    return blob
  }
}

export const shareApi = {
  get: async (shareToken) => request(`/share/${shareToken}`)
}

