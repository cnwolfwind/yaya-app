import React, { useState, useEffect, useRef } from 'react'

const TICK_COUNT = 21
const API_BASE = 'http://121.196.229.11'

function xhrGet(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.timeout = 15000
    xhr.onload = () => xhr.status === 200 ? resolve(xhr.responseText) : reject(new Error('HTTP ' + xhr.status))
    xhr.onerror = () => reject(new Error('网络错误'))
    xhr.ontimeout = () => reject(new Error('超时'))
    xhr.send()
  })
}

function xhrPost(url, body) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.timeout = 15000
    xhr.onload = () => xhr.status === 200 ? resolve(xhr.responseText) : reject(new Error('HTTP ' + xhr.status))
    xhr.onerror = () => reject(new Error('网络错误'))
    xhr.ontimeout = () => reject(new Error('超时'))
    xhr.send(body)
  })
}

export default function JKPage({ onBack }) {
  const [data, setData] = useState([])
  const [name, setName] = useState('')
  const [prob, setProb] = useState(50)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    xhrGet(API_BASE + '/api/submissions')
      .then(txt => { const d = JSON.parse(txt); if (Array.isArray(d)) setData(d) })
      .catch(() => {})
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) { showToast('请输入名字'); return }
    setSubmitting(true)
    xhrPost(API_BASE + '/api/submit', JSON.stringify({ name: name.trim(), probability: prob }))
      .then(txt => {
        setSubmitting(false)
        const d = JSON.parse(txt)
        if (d.data?.submission) {
          setData(prev => [d.data.submission, ...prev])
          setName(''); setProb(50)
          showToast('提交成功')
        } else if (d.error) showToast(d.error)
      })
      .catch(() => { setSubmitting(false); showToast('提交失败') })
  }

  return (
    <div className="app">
      <div className="top-bar">
        <button className="back-btn" onClick={() => onNavigate('home')}>←</button>
        <h2>JK 概率</h2>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-light)' }}>{data.length} 人已填</span>
      </div>

      <div className="app-body">
        {/* 数轴展示 */}
        <div className="dot-canvas" style={{height:200, marginBottom:16}}>
          {/* 轴线 */}
          <div style={{ position: 'absolute', bottom: 60, left: 16, right: 16, height: 2, background: 'var(--tea)' }} />
          {/* 刻度 */}
          <div style={{ position: 'absolute', bottom: 52, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
            {[...Array(TICK_COUNT)].map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 1, height: 8, background: 'var(--tea)' }} />
                <span style={{ fontSize: 9, color: 'var(--text-light)', marginTop: 2 }}>{i * 5}</span>
              </div>
            ))}
          </div>
          {/* 散点 */}
          {data.map((d, i) => (
            <div key={d.id || i} title={`${d.name}: ${d.probability}%`}
              style={{
                position: 'absolute',
                bottom: 62,
                left: `calc(16px + (100% - 32px) * ${parseFloat(d.probability) / 100})`,
                width: 10, height: 10, borderRadius: '50%',
                background: 'var(--cocoa)',
                transform: 'translateX(-50%)',
                boxShadow: '0 0 4px rgba(74,55,40,0.3)'
              }}
            />
          ))}
        </div>

        {/* 填写表单 */}
        <form onSubmit={handleSubmit} className="form-card">
          <div className="input-group">
            <label>你的名字</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="输入名字" maxLength={10} />
          </div>
          <div className="input-group">
            <label>概率预估</label>
            <div className="slider-row">
              <input type="range" min="1" max="100" step="0.1" value={prob}
                onChange={e => setProb(parseFloat(e.target.value))} />
              <span className="slider-value">{prob}%</span>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary btn-full">
            {submitting ? '提交中...' : '提交'}
          </button>
        </form>

        {/* 已填写列表 */}
        {data.length > 0 && (
          <div className="list-card">
            {data.map((d, i) => {
              const p = parseFloat(d.probability)
              const cls = p >= 70 ? 'high' : p >= 30 ? 'mid' : 'low'
              return (
                <div key={d.id || i} className="list-item">
                  <div className="li-left">
                    <span className="li-name">{d.name}</span>
                  </div>
                  <span className={`li-prob ${cls}`}>{d.probability}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bottom-nav" style={{ position: 'sticky', bottom: 0, zIndex: 100, background: 'var(--card)', borderTop: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-around', padding: '6px 0 calc(6px + env(safe-area-inset-bottom))' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 16px', color: 'var(--text-light)', fontSize: 11 }} onClick={() => onNavigate('home')}>
          <span style={{ fontSize: 22 }}>🏠</span>返回首页
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
