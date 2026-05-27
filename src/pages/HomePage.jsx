import React, { useState, useEffect, useCallback } from 'react'

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
  const names = ['周日','周一','周二','周三','周四','周五','周六']
  return names[new Date().getDay()]
}

export default function HomePage({ onNavigate }) {
  const [intelCount, setIntelCount] = useState(null)
  const [jkCount, setJkCount] = useState(null)

  const loadStats = useCallback(() => {
    xhrGet(API_BASE + '/raw/?limit=1').then(txt => {
      try {
        const d = JSON.parse(txt)
        if (d.data) setIntelCount(d.data.total || d.data.length || 0)
        else if (Array.isArray(d)) setIntelCount(d.length)
      } catch {}
    }).catch(() => {})

    xhrGet(API_BASE + '/api/submissions').then(txt => {
      try {
        const d = JSON.parse(txt)
        if (Array.isArray(d)) setJkCount(d.length)
      } catch {}
    }).catch(() => {})
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

  return (
    <div className="app">
      {/* 头部 */}
      <div className="app-header">
        <div className="dashboard-header" style={{padding:0}}>
          <div className="mascot-home">
            <img src="/icon.svg" alt="鸭鸭" style={{width:50,height:50}} />
          </div>
          <div className="greeting">
            <h2>你好，{getWeekDay()}好 ☀️</h2>
            <div className="day-tag">
              {new Date().getFullYear()}年{new Date().getMonth()+1}月{new Date().getDate()}日
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
            <div className="stat-value">{intelCount !== null ? intelCount : '…'}</div>
            <div className="stat-label">条情报</div>
          </div>
          <div className="stat-card" onClick={() => onNavigate('jk')}>
            <div className="stat-icon">🎲</div>
            <div className="stat-value">{jkCount !== null ? jkCount : '…'}</div>
            <div className="stat-label">人已填写概率</div>
          </div>
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

      {/* 底部导航 */}
      <div className="bottom-nav">
        <button className="nav-item active" onClick={() => onNavigate('home')}>
          <span className="nav-icon">🏠</span> 首页
        </button>
        <button className="nav-item" onClick={() => onNavigate('intel')}>
          <span className="nav-icon">📡</span> 情报
        </button>
        <button className="nav-item" onClick={() => onNavigate('jk')}>
          <span className="nav-icon">🎲</span> 概率
        </button>
        <button className="nav-item" onClick={() => onNavigate('settings')}>
          <span className="nav-icon">⚙️</span> 设置
        </button>
      </div>
    </div>
  )
}
