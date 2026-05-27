import React, { useState, useEffect } from 'react'

const FILTERS = [
  { label: '全部', value: 'all' },
  { label: '🚀 科技', value: '科技情报' },
  { label: '🌿 生活', value: '生活情报' },
  { label: '💼 管理', value: '管理情报' },
  { label: '🏢 招商', value: '招商局情报' },
]

const TYPE_COLORS = {
  '科技情报': { bg: '#E3F2FD', color: '#1565C0' },
  '生活情报': { bg: '#E8F5E9', color: '#2E7D32' },
  '管理情报': { bg: '#FFF3E0', color: '#E65100' },
  '招商局情报': { bg: '#F3E5F5', color: '#7B1FA2' },
  'all': { bg: 'var(--dark)', color: '#fff' },
}

export default function IntelPage({ onBack }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [diag, setDiag] = useState('')

  useEffect(() => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'http://121.196.229.11/raw/?limit=50', true)
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.timeout = 15000

    xhr.ontimeout = () => {
      setDiag('[超时] XMLHttpRequest timeout')
      setError('请求超时，请检查网络')
      setLoading(false)
    }

    xhr.onerror = () => {
      setDiag('[网络错误] XHR onerror, readyState=' + xhr.readyState + ', status=' + xhr.status)
      setError('网络错误 (XHR onerror)')
      setLoading(false)
    }

    xhr.onload = () => {
      setDiag('[响应] XHR readyState=4, status=' + xhr.status)
      if (xhr.status === 200) {
        try {
          const d = JSON.parse(xhr.responseText)
          setDiag('[成功] records=' + (d.records || []).length)
          setItems(d.records || [])
          setLoading(false)
        } catch (e) {
          setDiag('[JSON解析失败] ' + e.message)
          setError('数据解析失败')
          setLoading(false)
        }
      } else {
        setDiag('[HTTP错误] status=' + xhr.status)
        setError('HTTP ' + xhr.status)
        setLoading(false)
      }
    }

    xhr.send()
  }, [])

  const filtered = activeFilter === 'all' ? items : items.filter(i => {
    const isSci = i.agent === 'feishu_product'
    const map = { '科技情报': isSci, '生活情报': i.agent === 'feishu_co' && item.source === '股市直击', '管理情报': i.agent === 'feishu_cio', '招商局情报': i.agent === 'wuzhao' }
    return map[activeFilter] || false
  })

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="page-title">情报雷达</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--brown)' }}>{items.length} 条</span>
      </div>
      <div style={{ background: '#222', color: '#0f0', fontSize: 11, fontFamily: 'monospace', padding: '8px', wordBreak: 'breakAll' }}>
        诊断: {diag}<br/>v1.0.9-xhr
      </div>
      <div style={{ background: 'var(--card-bg)', padding: '12px 16px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="intel-filter">
          {FILTERS.map(f => (
            <div key={f.value} className={'filter-chip ' + (activeFilter === f.value ? 'active' : '')} onClick={() => setActiveFilter(f.value)}>{f.label}</div>
          ))}
        </div>
      </div>
      <div className="page-content">
        {error ? <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div> :
         loading ? <div className="loading">加载中...</div> :
         filtered.length === 0 ? <div className="empty">暂无情报</div> :
         filtered.map((item, idx) => {
           const isSci = item.agent === 'feishu_product'
           const isLife = item.agent === 'feishu_co' && item.source === '股市直击'
           const isMgr = item.agent === 'feishu_cio'
           const isInvest = item.agent === 'wuzhao'
           const typeMap = { '科技情报': isSci, '生活情报': isLife, '管理情报': isMgr, '招商局情报': isInvest }
           const type = Object.keys(typeMap).find(k => typeMap[k]) || ''
           const colors = TYPE_COLORS[type] || { bg: '#eee', color: '#666' }
           return (
             <div key={idx} className="intel-card">
               <div className="intel-card-meta">
                 <span className="intel-type-badge" style={{ background: colors.bg, color: colors.color }}>{item.source || item.agent || '未知'}</span>
                 <span className="intel-time">{item.pub_date ? new Date(item.pub_date).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span>
               </div>
               <div className="intel-title">{item.title}</div>
               {item.summary && <div className="intel-summary">{item.summary.replace(/[#*\-]/g, '').trim()}</div>}
               {item.link && item.link.startsWith('http') && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent)', marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>查看原文 →</a>}
             </div>
           )
         })}
      </div>
    </div>
  )
}
