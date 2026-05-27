import React, { useState, useEffect, useRef } from 'react'

const TICK_COUNT = 21
const API_BASE = 'http://121.196.229.11'

// XHR helper — 华为鸿蒙 WebView 拦截 fetch, 必须用 XHR
function xhrGet(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.timeout = 15000
    xhr.onload = () => {
      if (xhr.status === 200) resolve(xhr.responseText)
      else reject(new Error('HTTP ' + xhr.status))
    }
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
    xhr.onload = () => {
      if (xhr.status === 200) resolve(xhr.responseText)
      else reject(new Error('HTTP ' + xhr.status))
    }
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
  const dotsRef = useRef(null)

  // 加载已有数据
  useEffect(() => {
    xhrGet(API_BASE + '/api/submissions')
      .then(txt => { const d = JSON.parse(txt); if (Array.isArray(d)) setData(d); console.log('JK loaded', d.length, 'submissions') })
      .catch((err) => { console.error('JK load error:', err); })
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

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
          setName('')
          setProb(50)
          showToast('提交成功')
        } else if (d.error) {
          showToast(d.error)
        }
      })
      .catch(() => { setSubmitting(false); showToast('提交失败') })
  }

  // 计算数轴上的点位置
  const getPosition = (p) => ((p / 100) * 100).toFixed(1) + '%'

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="page-title">JK概率</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--brown)' }}>{data.length}人已填写</span>
      </div>

      {/* 数轴展示 */}
      <div style={{ background: 'var(--card-bg)', margin: '16px', borderRadius: 16, padding: '20px 16px 16px' }}>
        <div style={{ position: 'relative', height: 48 }}>
          {/* 轴线 */}
          <div style={{ position: 'absolute', top: 20, left: 0, right: 0, height: 2, background: '#c4a882' }} />
          {/* 刻度 */}
          <div style={{ position: 'absolute', top: 12, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
            {[...Array(TICK_COUNT)].map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 1, height: 10, background: '#c4a882' }} />
                <span style={{ fontSize: 9, color: 'var(--brown)', marginTop: 2 }}>{i * 5}</span>
              </div>
            ))}
          </div>
          {/* 散点 */}
          <div ref={dotsRef} style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 24, display: 'flex', alignItems: 'center' }}>
            {data.map((d, i) => (
              <div key={d.id || i} title={`${d.name}: ${d.probability}%`}
                style={{
                  position: 'absolute', left: getPosition(parseFloat(d.probability)),
                  width: 8, height: 8, borderRadius: '50%', background: '#5c4a3a',
                  transform: 'translateX(-50%)', cursor: 'default',
                }} />
            ))}
          </div>
        </div>
      </div>

      {/* 填写表单 */}
      <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', margin: '0 16px 16px', borderRadius: 16, padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="输入你的名字"
            maxLength={10}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 15, background: 'var(--bg)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{prob}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="0.1"
            value={prob}
            onChange={e => setProb(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#5c4a3a' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--brown)', marginTop: 4 }}>
            <span>0%</span><span>100%</span>
          </div>
        </div>
        <button type="submit" disabled={submitting} style={{ width: '100%', padding: 14, borderRadius: 12, background: submitting ? 'var(--cream)' : 'var(--dark)', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? '提交中...' : '提交'}
        </button>
      </form>

      {/* 已填写列表 */}
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ fontSize: 12, color: 'var(--brown)', marginBottom: 10 }}>已填写 {data.length} 人</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {data.map((d, i) => (
            <div key={d.id || i} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: '6px 14px', fontSize: 13 }}>
              {d.name}: <b>{d.probability}%</b>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'var(--dark)', color: '#fff', padding: '10px 24px', borderRadius: 24, fontSize: 14, zIndex: 100 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  )
}