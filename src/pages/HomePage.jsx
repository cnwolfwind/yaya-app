import React, { useState, useEffect, useCallback } from 'react'
import { Browser } from '@capacitor/browser'

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

function getWeekDay() {
  return ['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()]
}

function getRecentDays(n) {
  const days = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export default function HomePage({ onNavigate }) {
  const [totalCount, setTotalCount] = useState(null)
  const [jkCount, setJkCount] = useState(null)
  const [hotArticles, setHotArticles] = useState([])
  const [loadingHot, setLoadingHot] = useState(false)

  const loadStats = useCallback(() => {
    // 取 total
    xhrGet(API_BASE + '/raw/?limit=1').then(txt => {
      try {
        const d = JSON.parse(txt)
        setTotalCount(d.total || 0)
      } catch {}
    }).catch(() => {})

    xhrGet(API_BASE + '/api/submissions').then(txt => {
      try {
        const d = JSON.parse(txt)
        if (Array.isArray(d)) setJkCount(d.length)
      } catch {}
    }).catch(() => {})
  }, [])

  const loadHot = useCallback(() => {
    setLoadingHot(true)
    xhrGet(API_BASE + '/raw/?limit=50').then(txt => {
      try {
        const d = JSON.parse(txt)
        const items = (d.records || []).sort(() => Math.random() - 0.5).slice(0, 10)
        setHotArticles(items)
        setLoadingHot(false)
      } catch { setLoadingHot(false) }
    }).catch(() => { setLoadingHot(false) })
  }, [])

  useEffect(() => {
    loadStats()
    loadHot()
  }, [loadStats, loadHot])

  const openLink = async (url) => {
    if (!url || url === '#') return
    try { await Browser.open({ url }) } catch { window.open(url, '_blank') }
  }

  const today = new Date()
  const recentDays = getRecentDays(2)

  return (
    <div className="app">
      {/* 头部 */}
      <div className="app-header" style={{ paddingTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="mascot-home">
            <img src="/icon.svg" alt="鸭鸭" style={{ width: 50, height: 50 }} />
          </div>
          <div className="greeting">
            <h2>你好，{getWeekDay()}好 ☀️</h2>
            <div className="day-tag">
              {today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日
            </div>
          </div>
        </div>
      </div>

      <div className="app-body">
        {/* 数据摘要 */}
        <div className="section-label">今日概览</div>
        <div className="stats-row">
          <div className="stat-card" onClick={() => onNavigate('intel')}>
            <div className="stat-icon">📡</div>
            <div className="stat-value">{totalCount !== null ? totalCount.toLocaleString() : '…'}</div>
            <div className="stat-label">条情报</div>
          </div>
          <div className="stat-card" onClick={() => onNavigate('jk')}>
            <div className="stat-icon">🎲</div>
            <div className="stat-value">{jkCount !== null ? jkCount : '…'}</div>
            <div className="stat-label">人已填写概率</div>
          </div>
        </div>

        {/* 近两天热门文章（随机展示10条） */}
        <div className="section-label">近两天热门</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loadingHot ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontSize: 13 }}>
              加载中…
            </div>
          ) : hotArticles.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontSize: 13 }}>
              暂无数据
            </div>
          ) : (
            hotArticles.map((item, idx) => (
              <div key={item.id || idx}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px',
                  borderBottom: idx < hotArticles.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: item.link && item.link !== '#' ? 'pointer' : 'default'
                }}
                onClick={() => item.link && item.link !== '#' ? openLink(item.link) : null}
              >
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--cream)', color: 'var(--cocoa)',
                  fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>{idx + 1}</span>
                <span style={{ flex: 1, fontSize: 13, lineHeight: 1.4, color: 'var(--cocoa)' }}>
                  {item.title}
                </span>
                {item.link && item.link !== '#' && (
                  <span style={{ color: 'var(--tea)', fontSize: 12, flexShrink: 0 }}>↗</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* 快捷工具 */}
        <div className="section-label">工具</div>
        <div className="tools-row">
          <div className="tool-card" onClick={() => onNavigate('intel')}>
            <div className="tool-icon">📡</div>
            <div className="tool-name">情报雷达</div>
            <div className="tool-desc">每日信息采集</div>
          </div>
          <div className="tool-card" onClick={() => onNavigate('jk')}>
            <div className="tool-icon">🎲</div>
            <div className="tool-name">JK 概率</div>
            <div className="tool-desc">概率预测与统计</div>
          </div>
        </div>
      </div>
    </div>
  )
}