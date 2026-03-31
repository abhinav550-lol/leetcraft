import { useEffect, useMemo, useState } from 'react'
import { authApi, clearSession, getSession, submissionsApi, shareApi } from './api/client.js'

const languages = [
  'javascript', 'typescript', 'python', 'java', 'csharp',
  'cplusplus', 'golang', 'ruby', 'rust', 'kotlin', 'swift', 'other'
]

/* ————————————————————————————————————————
   Reusable primitives
   ———————————————————————————————————————— */

const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    default: 'bg-white/[0.06] text-neutral-400 border-white/[0.06]',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-wide uppercase border ${styles[variant]}`}>
      {children}
    </span>
  )
}

const statusBadge = (status) => {
  const map = { completed: 'success', failed: 'error', pending: 'pending' }
  return <Badge variant={map[status] || 'default'}>{status || 'none'}</Badge>
}

const Btn = ({ children, onClick, disabled, variant = 'primary', size = 'md', className = '' }) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 select-none whitespace-nowrap'
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-sm gap-2'
  }
  const variants = {
    primary: 'bg-white text-black hover:bg-neutral-200 active:bg-neutral-300 shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
    secondary: 'bg-white/[0.06] text-neutral-300 border border-white/[0.08] hover:bg-white/[0.1] hover:text-white hover:border-white/[0.14]',
    ghost: 'text-neutral-400 hover:text-white hover:bg-white/[0.06]',
    danger: 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

const Input = ({ label, ...props }) => (
  <label className="grid gap-2 text-sm">
    <span className="text-neutral-400 font-medium text-xs tracking-wide uppercase">{label}</span>
    <input {...props} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-neutral-600 text-sm focus:outline-none" />
  </label>
)

const Select = ({ label, children, ...props }) => (
  <label className="grid gap-2 text-sm">
    <span className="text-neutral-400 font-medium text-xs tracking-wide uppercase">{label}</span>
    <select {...props} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none appearance-none cursor-pointer">
      {children}
    </select>
  </label>
)

const Textarea = ({ label, ...props }) => (
  <label className="grid gap-2 text-sm">
    <span className="text-neutral-400 font-medium text-xs tracking-wide uppercase">{label}</span>
    <textarea {...props} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-neutral-600 text-sm font-mono min-h-[200px] resize-y focus:outline-none leading-relaxed" />
  </label>
)

const Card = ({ children, className = '' }) => (
  <div className={`bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 md:p-8 border-glow animate-fade-in ${className}`}>
    {children}
  </div>
)

const ErrorText = ({ message }) =>
  message ? (
    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-2.5">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
      </svg>
      {message}
    </div>
  ) : null

/* ————— Icons ————— */
const IconSparkle = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
)
const IconDownload = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M12 5v14m0 0l-4-4m4 4l4-4M4 19h16" />
  </svg>
)
const IconRefresh = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
  </svg>
)
const IconLink = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.424 0a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.838" />
  </svg>
)
const IconShare = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
)
const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

/* ————————————————————————————————————————
   Hash-based Router
   ———————————————————————————————————————— */
function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const handler = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])
  return hash
}

/* ————————————————————————————————————————
   Main App (Router)
   ———————————————————————————————————————— */
export default function App() {
  const hash = useHash()

  // Route: #/share/<token>
  const shareMatch = hash.match(/^#\/share\/(.+)$/)
  if (shareMatch) {
    return <SharedView token={shareMatch[1]} />
  }

  return <Dashboard />
}

/* ————————————————————————————————————————
   Public Shared View
   ———————————————————————————————————————— */
function SharedView({ token }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await shareApi.get(token)
        setData(res)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" onClick={() => { window.location.hash = ''; }} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black text-xs font-bold">LC</span>
            </div>
            <span className="text-white font-semibold tracking-tight">LeetCraft</span>
          </a>
          <Badge>Shared write-up</Badge>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <Card className="text-center py-16">
            <p className="text-red-400 text-sm">❌ {error}</p>
            <p className="text-neutral-600 text-xs mt-2">This shared link may be invalid or the write-up isn't ready yet.</p>
          </Card>
        )}

        {data && (
          <div className="animate-slide-up space-y-6">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Badge>{data.language}</Badge>
                <span className="text-[11px] text-neutral-600">by {data.author}</span>
                <span className="text-[11px] text-neutral-600">•</span>
                <span className="text-[11px] text-neutral-600">{new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{data.title}</h1>
              {data.problemUrl && (
                <a href={data.problemUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors mt-2">
                  <IconLink /> View problem on LeetCode
                </a>
              )}
            </div>

            {/* Write-up sections */}
            <div className="grid gap-4 md:grid-cols-2">
              <WriteupSection label="Intuition" value={data.writeup.intuition} />
              <WriteupSection label="Approach" value={data.writeup.approach} />
              <WriteupSection label="Algorithm" value={data.writeup.algorithm} full />
              <WriteupSection label="Time Complexity" value={data.writeup.timeComplexity} />
              <WriteupSection label="Space Complexity" value={data.writeup.spaceComplexity} />
            </div>

            {/* Code */}
            <Card>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-3">Solution Code</p>
              <pre className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 overflow-x-auto">
                <code className="text-sm font-mono text-neutral-300 leading-relaxed">{data.code}</code>
              </pre>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

/* ————————————————————————————————————————
   Dashboard (authenticated)
   ———————————————————————————————————————— */
function Dashboard() {
  const [authMode, setAuthMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const [tokens, setTokens] = useState(() => getSession())
  const [user, setUser] = useState(() => getSession()?.user || null)

  const [submissions, setSubmissions] = useState([])
  const [subsLoading, setSubsLoading] = useState(false)
  const [subsError, setSubsError] = useState('')

  const [title, setTitle] = useState('')
  const [problemUrl, setProblemUrl] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [notes, setNotes] = useState('')
  const [submissionLoading, setSubmissionLoading] = useState(false)
  const [submissionError, setSubmissionError] = useState('')

  const [expandedId, setExpandedId] = useState(null)

  const tokenValue = useMemo(() => tokens?.accessToken, [tokens])

  useEffect(() => {
    if (!tokenValue) return
    const load = async () => {
      setSubsLoading(true)
      setSubsError('')
      try {
        const data = await submissionsApi.list(tokenValue)
        setSubmissions(data.submissions || [])
      } catch (err) {
        setSubsError(err.message)
      } finally {
        setSubsLoading(false)
      }
    }
    load()
  }, [tokenValue])

  const handleAuth = async (mode) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const payload = { email, password, ...(mode === 'register' ? { name } : {}) }
      const fn = mode === 'register' ? authApi.register : authApi.login
      const data = await fn(payload)
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
      setUser(data.user)
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    setTokens(null)
    setUser(null)
    clearSession()
    setSubmissions([])
  }

  const handleCreateSubmission = async () => {
    if (!tokenValue) return
    setSubmissionLoading(true)
    setSubmissionError('')
    try {
      await submissionsApi.create(tokenValue, { title, problemUrl, language, code, notes })
      setTitle('')
      setProblemUrl('')
      setCode('')
      setNotes('')
      const data = await submissionsApi.list(tokenValue)
      setSubmissions(data.submissions || [])
    } catch (err) {
      setSubmissionError(err.message)
    } finally {
      setSubmissionLoading(false)
    }
  }

  const handleGenerate = async (id) => {
    if (!tokenValue) return
    try {
      await submissionsApi.generate(tokenValue, id)
      const data = await submissionsApi.list(tokenValue)
      setSubmissions(data.submissions || [])
    } catch (err) {
      alert(err.message)
    }
  }

  const handleRefreshWriteup = async (id) => {
    if (!tokenValue) return
    try {
      const data = await submissionsApi.getWriteup(tokenValue, id)
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, writeup: data.writeup } : s))
      )
    } catch (err) {
      alert(err.message)
    }
  }

  const handleExport = async (id, format) => {
    if (!tokenValue) return
    try {
      const blob = await submissionsApi.export(tokenValue, id, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `writeup-${id}.${format === 'pdf' ? 'pdf' : 'md'}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleShare = async (id) => {
    if (!tokenValue) return
    try {
      const { shareToken } = await submissionsApi.share(tokenValue, id)
      const link = `${window.location.origin}/#/share/${shareToken}`
      await navigator.clipboard.writeText(link)
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, shareToken } : s))
      )
    } catch (err) {
      alert(err.message)
    }
  }

  const handleUnshare = async (id) => {
    if (!tokenValue) return
    try {
      await submissionsApi.unshare(tokenValue, id)
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, shareToken: null } : s))
      )
    } catch (err) {
      alert(err.message)
    }
  }

  /* ————— Auth Screen ————— */
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <nav className="border-b border-white/[0.06] px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black text-xs font-bold">LC</span>
              </div>
              <span className="text-white font-semibold tracking-tight">LeetCraft</span>
            </div>
            <div className="flex items-center gap-1">
              <Btn variant={authMode === 'login' ? 'ghost' : 'secondary'} size="sm" onClick={() => setAuthMode('login')}>Sign in</Btn>
              <Btn variant={authMode === 'register' ? 'primary' : 'ghost'} size="sm" onClick={() => setAuthMode('register')}>Create account</Btn>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md animate-slide-up">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
                {authMode === 'login' ? 'Welcome back' : 'Get started'}
              </h1>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto">
                {authMode === 'login' ? 'Sign in to access your write-ups and submissions.' : 'Create an account to start generating AI-powered write-ups.'}
              </p>
            </div>
            <Card>
              <div className="grid gap-5">
                {authMode === 'register' && <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />}
                <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
                <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
                <ErrorText message={authError} />
                <Btn onClick={() => handleAuth(authMode)} disabled={authLoading} size="lg" className="w-full mt-1">
                  {authLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign in' : 'Create account'}
                </Btn>
              </div>
            </Card>
            <p className="text-center text-neutral-600 text-xs mt-6">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-neutral-400 hover:text-white transition-colors">
                {authMode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  /* ————— Dashboard ————— */
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] glass-strong">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black text-xs font-bold">LC</span>
            </div>
            <span className="text-white font-semibold tracking-tight">LeetCraft</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-neutral-500 uppercase tracking-wider">Signed in as</p>
              <p className="text-sm text-white font-medium">{user.email}</p>
            </div>
            <Btn variant="ghost" size="sm" onClick={handleLogout}>Log out</Btn>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 space-y-8">
        <header className="animate-fade-in">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-2">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Your write-ups</h1>
          <p className="text-neutral-500 mt-2 max-w-lg text-sm leading-relaxed">
            Paste your accepted LeetCode solution and get a structured explanation — intuition, approach, algorithm, time &amp; space complexity.
          </p>
        </header>

        {/* New Submission */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <span className="text-white text-sm">+</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">New submission</h2>
              <p className="text-xs text-neutral-500">Add your accepted solution to generate a write-up</p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Two Sum" />
            <Input label="Problem URL" value={problemUrl} onChange={(e) => setProblemUrl(e.target.value)} placeholder="https://leetcode.com/problems/..." />
            <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {languages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </Select>
            <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Edge cases, constraints..." />
          </div>
          <div className="mt-5">
            <Textarea label="Accepted code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your accepted solution here..." />
          </div>
          <ErrorText message={submissionError} />
          <div className="flex justify-end mt-6">
            <Btn onClick={handleCreateSubmission} disabled={submissionLoading || !title || !code} size="md">
              {submissionLoading ? 'Saving...' : 'Save submission'}
            </Btn>
          </div>
        </Card>

        {/* Submissions list */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Submissions</h2>
              <Badge>{submissions.length} total</Badge>
            </div>
            {subsLoading && (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <div className="w-3 h-3 border border-neutral-600 border-t-white rounded-full animate-spin" />
                Loading…
              </div>
            )}
          </div>

          {subsError && <ErrorText message={subsError} />}

          {submissions.length === 0 && !subsLoading ? (
            <Card className="text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <IconSparkle />
              </div>
              <p className="text-neutral-400 text-sm">No submissions yet.</p>
              <p className="text-neutral-600 text-xs mt-1">Add your first solution above to get started.</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {submissions.map((s) => (
                <SubmissionRow
                  key={s.id}
                  submission={s}
                  expanded={expandedId === s.id}
                  onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  onGenerate={() => handleGenerate(s.id)}
                  onRefresh={() => handleRefreshWriteup(s.id)}
                  onExport={(fmt) => handleExport(s.id, fmt)}
                  onShare={() => handleShare(s.id)}
                  onUnshare={() => handleUnshare(s.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

/* ————————————————————————————————————————
   Submission Row
   ———————————————————————————————————————— */
function SubmissionRow({ submission, expanded, onToggle, onGenerate, onRefresh, onExport, onShare, onUnshare }) {
  const writeup = submission.writeup
  const status = writeup?.status || 'none'
  const [copied, setCopied] = useState(false)

  const handleShareClick = async () => {
    await onShare()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = submission.shareToken
    ? `${window.location.origin}/#/share/${submission.shareToken}`
    : null

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden transition-all duration-300 hover:border-white/[0.1] border-glow shine">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 cursor-pointer select-none" onClick={onToggle}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
            <span className="text-xs font-mono text-neutral-400 uppercase">{submission.language?.slice(0, 2)}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm font-semibold text-white truncate">{submission.title}</h3>
              <Badge>{submission.language}</Badge>
              {statusBadge(status)}
              {submission.shareToken && <Badge variant="success">shared</Badge>}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {submission.problemUrl && (
                <a className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors" href={submission.problemUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                  <IconLink /> View problem
                </a>
              )}
              <span className="text-[11px] text-neutral-600">{new Date(submission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <Btn variant="primary" size="sm" onClick={onGenerate}>
            <IconSparkle /> Generate
          </Btn>
          <Btn variant="secondary" size="sm" onClick={onRefresh}>
            <IconRefresh /> Refresh
          </Btn>
          {writeup?.status === 'completed' && (
            <>
              <Btn variant={copied ? 'secondary' : 'ghost'} size="sm" onClick={handleShareClick}>
                {copied ? <><IconCheck /> Copied!</> : <><IconShare /> Share</>}
              </Btn>
              {submission.shareToken && (
                <Btn variant="danger" size="sm" onClick={onUnshare}>
                  Unshare
                </Btn>
              )}
              <Btn variant="ghost" size="sm" onClick={() => onExport('md')}>
                <IconDownload /> .md
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => onExport('pdf')}>
                <IconDownload /> .pdf
              </Btn>
            </>
          )}
        </div>
      </div>

      {/* Share link banner */}
      {expanded && shareLink && (
        <div className="border-t border-white/[0.06] px-5 py-3 flex items-center gap-3 bg-emerald-500/5">
          <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider shrink-0">Share link</span>
          <code className="text-xs text-neutral-400 truncate flex-1">{shareLink}</code>
          <Btn variant="ghost" size="sm" onClick={async () => {
            await navigator.clipboard.writeText(shareLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}>
            {copied ? 'Copied!' : 'Copy'}
          </Btn>
        </div>
      )}

      {/* Expanded write-up */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-5 py-5 animate-fade-in">
          {writeup?.status === 'completed' ? (
            <div className="grid gap-5 md:grid-cols-2">
              <WriteupSection label="Intuition" value={writeup.intuition} />
              <WriteupSection label="Approach" value={writeup.approach} />
              <WriteupSection label="Algorithm" value={writeup.algorithm} full />
              <WriteupSection label="Time Complexity" value={writeup.timeComplexity} />
              <WriteupSection label="Space Complexity" value={writeup.spaceComplexity} />
            </div>
          ) : writeup?.status === 'failed' ? (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Generation failed: {writeup.failureReason}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No write-up yet. Click Generate to create one.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ————————————————————————————————————————
   Writeup Section
   ———————————————————————————————————————— */
const WriteupSection = ({ label, value, full }) => (
  <div className={`bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 ${full ? 'md:col-span-2' : ''}`}>
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-2">{label}</p>
    <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{value}</p>
  </div>
)

/* ————————————————————————————————————————
   Footer
   ———————————————————————————————————————— */
const Footer = () => (
  <footer className="border-t border-white/[0.04] mt-auto">
    <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-[11px] text-neutral-600">&copy; {new Date().getFullYear()} LeetCraft. AI-powered write-ups.</p>
      <div className="flex items-center gap-1 text-[11px] text-neutral-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
        All systems operational
      </div>
    </div>
  </footer>
)
