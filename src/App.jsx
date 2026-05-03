import { useState } from 'react'
import nuLogo from '/nu-logo.svg'
import './App.css'

const ENDPOINT = '/nu-web/fetchAdmissionTestResultInformation'

function parseResult(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const rows = []
  doc.querySelectorAll('div').forEach((div) => {
    const label = div.querySelector('font')?.textContent?.trim()
    if (!label) return
    const value = Array.from(div.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .filter(Boolean)
      .join(' ')
    rows.push({ label, value })
  })
  return rows
}

function App() {
  const [roll, setRoll] = useState('')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  const onSearch = async (e) => {
    e.preventDefault()
    if (!roll.trim()) return
    setLoading(true)
    setError('')
    setRows(null)
    try {
      const body = new URLSearchParams({ admissionRoll: roll.trim() })
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const text = await res.text()
      const parsed = parseResult(text)
      if (parsed.length === 0) throw new Error('No result found.')
      setRows(parsed)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-left">
          <img src={nuLogo} alt="National University" className="nu-logo" />
        </div>
        <div className="card-right">
          <h2 className="title">** Admission Test Result **</h2>
          <form onSubmit={onSearch}>
            <label className="field-label" htmlFor="roll">
              Application ID or Admission Test Roll No.<span className="req">*</span>
            </label>
            <input
              id="roll"
              type="text"
              className="field-input"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="search-btn" disabled={loading}>
              Search
            </button>
          </form>

          {loading && (
            <div className="loading">
              <div className="loading-bar" />
              <div className="loading-text">Loading........!!!</div>
            </div>
          )}

          {error && !loading && <div className="error">{error}</div>}

          {rows && !loading && (
            <div className="result">
              {rows.map((r, i) => (
                <div key={i} className="result-row">
                  <span className="result-label">{r.label}</span>
                  <span className="result-value">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
