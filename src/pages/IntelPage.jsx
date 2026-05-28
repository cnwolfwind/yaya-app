import React, { useState, useEffect, useCallback } from 'react'

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

const PAGE_SIZE = 20

function groupByDate(items) {
  const groups = {}
  for (const item of items) {
    const date = item.report_date || '未知日期'
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

export default function IntelPage({ onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [allItems, setAllItems] = useState([])
  const [displayedItems, setDisplayedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('latest') // 'latest' | 'hot'

  // 加载全部数据
  const loadAll = useCallback(() => {
    setLoading(true)
    // 每次多拿一些，用于热门筛选
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'http://121.196.229.11/raw/?limit=200', true)
    xhr.timeout = 20000
    xhr.ontimeout = () => { setError('请求超时'); setLoading(false) }
    xhr.onerror = () => { setError('网络错误'); setLoading(false) }
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const d = JSON.parse(xhr.responseText)
          const items = d.records || []
          setAllItems(items)
          setDisplayedItems(items.slice(0, PAGE_SIZE))
          setHasMore(items.length > PAGE_SIZE)
          setLoading(false)
        } catch {
          setError('数据解析失败'); setLoading(false)
        }
      } else {
        setError('HTTP ' + xhr.status); setLoading(false)
      }
    }
    xhr.send()
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const next = allItems.slice(displayedItems.length, displayedItems.length + PAGE_SIZE)
    setTimeout(() => {
      setDisplayedItems(prev => [...prev, ...next])
      setHasMore(displayedItems.length + next.length < allItems.length)
      setLoadingMore(false)
    }, 300)
  }, [loadingMore, hasMore, displayedItems.length, allItems])

  const filtered = activeFilter === 'all' ? allItems : allItems.filter(i => {
    const map = {
      '科技情报': i.agent === 'feishu_product',
      '生活情报': i.agent === 'feishu_co' && i.source === '股市直击',
      '管理情报': i.agent === 'feishu_cio',
      '招商局情报': i.agent === 'wuzhao'
    }
    return map[activeFilter] || false
  })

  const displayedFiltered = activeFilter === 'all' ? displayedItems : displayedItems.filter(i => {
    const map = {
      '科技情报': i.agent === 'feishu_product',
      '生活情报': i.agent === 'feishu_co' && i.source === '股市直击',
      '管理情报': i.agent === 'feishu_cio',
      '招商局情报': i.agent === 'wuzhao'
    }
    return map[activeFilter] || false
  })

  // 无限滚动
  const handleScroll = useCallback((e) => {
    const el = e.target
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
      loadMore()
    }
  }, [loadMore])

  // App 内嵌页面打开文章
  const openLink = (url, title, source) => {
    if (!url || url === '#') return
    onNavigate('article', { url, title, source })
  }

  // 按日期分组
  const grouped = groupByDate(displayedFiltered)

  return (
    <div className="app" onScroll={handleScroll}>
      {/* 顶部：返回按钮 + 标题 */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => onNavigate('home')}>←</button>
        <h2>情报雷达</h2>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-light)' }}>
          {allItems.length} 条
        </span>
      </div>

      {/* 筛选标签 */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <div key={f.value} onClick={() => setActiveFilter(f.value)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: activeFilter === f.value ? 'var(--cocoa)' : 'var(--card)',
              color: activeFilter === f.value ? '#fff' : 'var(--text-light)',
              border: `1.5px solid ${activeFilter === f.value ? 'var(--cocoa)' : 'var(--border)'}`,
              cursor: 'pointer', userSelect: 'none'
            }}>
            {f.label}
          </div>
        ))}
      </div>

      {/* 内容区 */}
      <div className="app-body" style={{ overflowY: 'auto' }} onScroll={handleScroll}>
        {error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <div className="empty-text">{error}</div>
          </div>
        ) : loading ? (
          <div className="loading">加载中…</div>
        ) : displayedFiltered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">暂无情报</div>
          </div>
        ) : (
          <>
            {/* 按日期分组显示 */}
            {grouped.map(([date, items]) => {
              const displayDate = (() => {
                const d = new Date(date + 'T00:00:00')
                const today = new Date()
                const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
                const isToday = d.toDateString() === today.toDateString()
                const isYest = d.toDateString() === yesterday.toDateString()
                if (isToday) return '今天'
                if (isYest) return '昨天'
                return d.toLocaleDateString('zh-CN', { month:'2-digit', day:'2-digit' })
              })()

              return (
                <div key={date}>
                  {/* 日期分组标题 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px 6px' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--cocoa)' }}>
                      {displayDate}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                      {items.length} 条
                    </span>
                  </div>

                  {/* 情报卡片 */}
                  {items.map((item, idx) => {
                    const isSci = item.agent === 'feishu_product'
                    const isLife = item.agent === 'feishu_co' && item.source === '股市直击'
                    const isMgr = item.agent === 'feishu_cio'
                    const isInvest = item.agent === 'wuzhao'
                    const typeMap = { '科技情报': isSci, '生活情报': isLife, '管理情报': isMgr, '招商局情报': isInvest }
                    const type = Object.keys(typeMap).find(k => typeMap[k]) || ''
                    const colors = TYPE_COLORS[type] || { bg: '#eee', color: '#666' }

                    return (
                      <div key={item.id || idx}
                        className="intel-card"
                        onClick={() => item.link && item.link !== '#' ? openLink(item.link, item.title, item.source) : null}
                        style={{ cursor: item.link && item.link !== '#' ? 'pointer' : 'default' }}
                      >
                        <span className="intel-tag" style={{ background: colors.bg, color: colors.color }}>
                          {item.source || item.agent || '未知'}
                        </span>
                        <div className="intel-title">{item.title}</div>
                        {item.summary && (
                          <div className="intel-summary">{item.summary.replace(/[#*\-]/g, '').trim()}</div>
                        )}
                        <div className="intel-source">
                          {item.pub_date ? new Date(item.pub_date).toLocaleString('zh-CN', {
                            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                          }) : ''}
                          {item.link && item.link !== '#' && (
                            <span style={{ marginLeft: 8, color: 'var(--tea)', fontSize: 11 }}>↗</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* 加载更多 */}
            {loadingMore && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontSize: 13 }}>
                加载中…
              </div>
            )}
            {!hasMore && displayedFiltered.length > 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontSize: 12 }}>
                — 已加载全部 {displayedFiltered.length} 条 —
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}