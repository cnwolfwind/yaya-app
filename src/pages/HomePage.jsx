import React from 'react'

export default function HomePage({ onNavigate, installPrompt, onInstall, version }) {
  return (
    <div className="content" style={{ padding: 0 }}>
      {/* Header */}
      <div className="header" style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/icon.png" alt="yaya" style={{ width: 40, height: 40, borderRadius: 12, marginRight: 12 }} onError={e => e.target.style.display='none'} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>雅雅</div>
            <div style={{ fontSize: 11, color: 'var(--brown)', marginTop: 1 }}>Yaya · 个人工具箱 · v{version || '1.0.0'}</div>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div style={{ padding: '0 16px 16px' }}>
        <div className="tool-list">
          <div className="tool-card" onClick={() => onNavigate('jk')}>
            <div className="tool-card-header">
              <div className="tool-card-icon">🎲</div>
              <div>
                <div className="tool-card-title">JK概率</div>
                <div className="tool-card-desc">概率投票工具，帮你做出决策</div>
              </div>
            </div>
            <div><span className="tool-card-status status-online">运行中</span></div>
          </div>

          <div className="tool-card" onClick={() => onNavigate('intel')}>
            <div className="tool-card-header">
              <div className="tool-card-icon">📡</div>
              <div>
                <div className="tool-card-title">情报雷达</div>
                <div className="tool-card-desc">每日科技/商业情报，智能筛选</div>
              </div>
            </div>
            <div><span className="tool-card-status status-new">更新</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
