import React, { useState, useEffect } from 'react'

export default function JKPage({ onBack }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => {
    fetch('http://121.196.229.11/api/submissions?limit=10')
      .then(r => r.json())
      .then(d => { if (d.submissions) setResults(d.submissions) })
      .catch(() => {})
  }, [])

  const addOption = () => setOptions([...options, ''])
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i))
  const updateOption = (i, val) => { const n = [...options]; n[i] = val; setOptions(n) }

  const submit = () => {
    const filled = options.filter(o => o.trim())
    if (!question.trim() || filled.length < 2) return
    setLoading(true)
    fetch('http://121.196.229.11/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.trim(), options: filled }),
    }).then(r => r.json()).then(d => {
      setLoading(false)
      if (d.submission) {
        setResults(prev => [d.submission, ...(prev || [])])
        setActiveTab('list')
        setQuestion('')
        setOptions(['', ''])
      }
    }).catch(() => setLoading(false))
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="page-title">JK概率</span>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <div className={`tab-item ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')} style={{ flex: 1 }}>
          历史
        </div>
        <div className={`tab-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')} style={{ flex: 1 }}>
          新建投票
        </div>
      </div>

      <div className="page-content">
        {activeTab === 'create' ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="输入你的问题..."
                style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 15, background: 'var(--card-bg)', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    placeholder={`选项 ${i + 1}`}
                    style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14, background: 'var(--card-bg)', outline: 'none' }}
                  />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(i)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: 16 }}>×</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addOption} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px dashed var(--border)', background: 'transparent', fontSize: 14, color: 'var(--brown)', cursor: 'pointer', marginBottom: 16 }}>+ 添加选项</button>
            <button onClick={submit} disabled={loading || !question.trim() || options.filter(o=>o.trim()).length < 2} style={{ width: '100%', padding: 14, borderRadius: 12, background: loading ? 'var(--cream)' : 'var(--dark)', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '提交中...' : '发起投票'}
            </button>
          </div>
        ) : (
          <div>
            {!results || results.length === 0 ? (
              <div className="empty">暂无投票记录</div>
            ) : results.map((item, i) => {
              const total = item.options.reduce((s, o) => s + (o.count || 0), 0)
              return (
                <div key={i} style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: '0 2px 12px var(--shadow)' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>{item.question}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {item.options.map((opt, j) => {
                      const pct = total > 0 ? Math.round((opt.count / total) * 100) : 0
                      return (
                        <div key={j}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                            <span>{opt.text}</span>
                            <span style={{ color: 'var(--brown)' }}>{pct}% ({opt.count})</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: 'var(--cream)' }}>
                            <div style={{ width: pct + '%', height: '100%', borderRadius: 3, background: 'var(--dark)' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}