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
}

export default function IntelPage({ onBack }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'http://121.196.229.11/raw/?limit=50', true)
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.timeout = 15000

    xhr.ontimeout = () => { setError('请求超时'); setLoading(false) }
    xhr.onerror = () => { setError('网络错误'); setLoading(false) }

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const d = JSON.parse(xhr.responseText)
          setItems(d.records || [])
          setLoading(false)
        } catch (e) {
          setError('数据解析失败')
          setLoading(false)
        }
      } else {
        setError('HTTP ' + xhr.status)
        setLoading(false)
      }
    }
    xhr.send()
  }, [])

  const filtered = activeFilter === 'all' ? items : items.filter(i => {
    const map = {
      '科技情报': i.agent === 'feishu_product',
      '生活情报': i.agent === 'feishu_co' && i.source === '股市直击',
      '管理情报': i.agent === 'feishu_cio',
      '招商局情报': i.agent === 'wuzhao'
    }
    return map[activeFilter] || false
  })

  return (
    <div className="app">
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2>情报雷达</h2>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-light)' }}>{items.length} 条</span>
      </div>

      {/* 筛选标签 */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <div key={f.value}
            onClick={() => setActiveFilter(f.value)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: activeFilter === f.value ? 'var(--cocoa)' : 'var(--card)',
              color: activeFilter === f.value ? '#fff' : 'var(--text-light)',
              border: `1.5px solid ${activeFilter === f.value ? 'var(--cocoa)' : 'var(--border)'}`,
              cursor: 'pointer'
            }}
          >{f.label}</div>
        ))}
      </div>

      {/* 信息流 */}
      <div className="app-body">
        {error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <div className="empty-text">{error}</div>
          </div>
        ) : loading ? (
          <div className="loading">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">暂无情报</div>
          </div>
        ) : (
          <div className="intel-feed">
            {filtered.map((item, idx) => {
              const isSci = item.agent === 'feishu_product'
              const isLife = item.agent === 'feishu_co' && item.source === '股市直击'
              const isMgr = item.agent === 'feishu_cio'
              const isInvest = item.agent === 'wuzhao'
              const typeMap = { '科技情报': isSci, '生活情报': isLife, '管理情报': isMgr, '招商局情报': isInvest }
              const type = Object.keys(typeMap).find(k => typeMap[k]) || ''
              const colors = TYPE_COLORS[type] || { bg: '#eee', color: '#666' }
              return (
                <div key={idx} className="intel-card" onClick={() => {
                  if (item.link && item.link.startsWith('http')) window.open(item.link, '_blank')
                }}>
                  <span className="intel-tag" style={{ background: colors.bg, color: colors.color }}>
                    {item.source || item.agent || '未知'}
                  </span>
                  <div className="intel-title">{item.title}</div>
                  {item.summary && (
                    <div className="intel-summary">{item.summary.replace(/[#*\-]/g, '').trim()}</div>
                  )}
                  <div className="intel-source">
                    {item.pub_date ? new Date(item.pub_date).toLocaleString('zh-CN', { month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit' }) : ''}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-item" onClick={onBack}>
          <span className="nav-icon">🏠</span> 返回首页
        </button>
      </div>
    </div>
  )
}
