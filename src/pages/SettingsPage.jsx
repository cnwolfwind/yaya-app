import React, { useState } from 'react'

const APP_VERSION = '2.0.1'
const APP_BUILD = 14
const UPDATE_URL = 'http://121.196.229.11/yaya/version.json'
const APK_URL = 'http://121.196.229.11/yaya/yaya.apk'

export default function SettingsPage({ onNavigate }) {
  const [checking, setChecking] = useState(false)
  const [updateAvail, setUpdateAvail] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  const checkUpdate = () => {
    setChecking(true)
    setUpdateAvail(null)
    const xhr = new XMLHttpRequest()
    xhr.open('GET', UPDATE_URL, true)
    xhr.timeout = 8000
    xhr.onload = () => {
      setChecking(false)
      if (xhr.status === 200) {
        try {
          const info = JSON.parse(xhr.responseText)
          if (info.version && info.version !== APP_VERSION) {
            setUpdateAvail(info)
          } else {
            showToast('已是最新版本')
          }
        } catch { showToast('服务器响应异常') }
      }
    }
    xhr.onerror = () => { setChecking(false); showToast('网络不可用') }
    xhr.ontimeout = () => { setChecking(false); showToast('请求超时') }
    xhr.send()
  }

  const clearCache = () => {
    showToast('缓存已清除')
  }

  return (
    <div className="app">
      <div className="top-bar">
        <button className="back-btn" onClick={() => onNavigate('home')}>←</button>
        <h2>设置</h2>
      </div>
      <div className="app-body">
        {/* 版本信息 */}
        <div className="settings-section">
          <div className="card version-card">
            <div className="mascot-lg">
              <img src="/icon.svg" alt="鸭鸭" style={{width:80,height:80}} />
            </div>
            <div className="v-name">鸭鸭 Yaya</div>
            <div className="v-num">版本 {APP_VERSION}</div>
            <div className="v-build">Build {APP_BUILD}</div>
          </div>
        </div>

        {/* 功能列表 */}
        <div className="settings-section">
          <div className="settings-list">
            <div className="settings-item" onClick={() => { checkUpdate() }}>
              <div className="si-left">
                <span className="si-icon">{checking ? '⏳' : '🔄'}</span>
                <span className="si-label">检查更新</span>
              </div>
              <div className="si-right">{checking ? '检查中…' : '手动检查'}</div>
            </div>

            <div className="settings-item" onClick={clearCache}>
              <div className="si-left">
                <span className="si-icon">🗑️</span>
                <span className="si-label">清除缓存</span>
              </div>
              <div className="si-right">释放存储</div>
            </div>
          </div>
        </div>

        {updateAvail && (
          <div className="card" style={{marginBottom:16, textAlign:'center'}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>
              新版本 {updateAvail.version}
            </div>
            <div style={{fontSize:13,color:'var(--text-light)',marginBottom:16}}>
              {updateAvail.releaseNotes || '建议更新到最新版本'}
            </div>
            <button className="btn btn-primary btn-full" onClick={() => {
              window.open(APK_URL, '_blank')
            }}>
              下载更新
            </button>
          </div>
        )}

        {/* 关于 */}
        <div className="settings-section">
          <div className="section-label">关于</div>
          <div className="settings-list">
            <div className="settings-item">
              <div className="si-left">
                <span className="si-icon">📱</span>
                <span className="si-label">技术框架</span>
              </div>
              <div className="si-right">React · Capacitor</div>
            </div>
            <div className="settings-item">
              <div className="si-left">
                <span className="si-icon">🐉</span>
                <span className="si-label">吉祥物</span>
              </div>
              <div className="si-right">小龙幼崽</div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <div className="bottom-nav">
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 16px', color: 'var(--text-light)', fontSize: 11 }} onClick={() => onNavigate('home')}>
          <span style={{ fontSize: 22 }}>🏠</span>返回首页
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
