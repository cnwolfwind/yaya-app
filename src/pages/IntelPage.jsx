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

  useEffect(() => {
    fetch('http://121.196.229.11/api/intelligence?limit=50')
      .then(r => r.json())
      .then(d => {
        setItems(d.records || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = activeFilter === 'all' ? items : items.filter(i => i.source === activeFilter)

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="page-title">情报雷达</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--brown)' }}>{items.length} 条</span>
      </div>

      {/* Filter */}
      <div style={{ background: 'var(--card-bg)', padding: '12px 16px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="intel-filter">
          {FILTERS.map(f => (
            <div
              key={f.value}
              className={`filter-chip ${activeFilter === f.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </div>
          ))}
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">暂无情报</div>
        ) : (
          filtered.map((item, i) => {
            const badge = TYPE_COLORS[item.source] || TYPE_COLORS['all']
            return (
              <div key={i} className="intel-card">
                <div className="intel-card-meta">
                  <span className="intel-type-badge" style={{ background: badge.bg, color: badge.color }}>
                    {item.source || item.agent || '未知'}
                  </span>
                  <span className="intel-time">
                    {item.pub_date ? new Date(item.pub_date).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="intel-title">{item.title}</div>
                {item.summary && (
                  <div className="intel-summary">{item.summary.replace(/[#*\-]/g, '').trim()}</div>
                )}
                {item.link && item.link.startsWith('http') && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent)', marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>
                    查看原文 →
                  </a>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}