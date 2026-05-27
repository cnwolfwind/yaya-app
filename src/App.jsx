import React, { useState, useCallback, useEffect } from 'react'
import HomePage from './pages/HomePage'
import JKPage from './pages/JKPage'
import IntelPage from './pages/IntelPage'
import SettingsPage from './pages/SettingsPage'

const APP_VERSION = '2.0.1'
const UPDATE_URL = 'http://121.196.229.11/yaya/version.json'
const APK_URL = 'http://121.196.229.11/yaya/yaya.apk'

export default function App() {
  const [page, setPage] = useState('home')
  const [prevPage, setPrevPage] = useState('home')
  const [updateInfo, setUpdateInfo] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  // 持久底部导航：所有页面共享一套 nav，导航时不传 onBack
  const navigate = useCallback((p) => {
    if (p === page) return
    setPrevPage(page)
    setPage(p)
  }, [page])

  // 滑动返回上一页
  useEffect(() => {
    let startX = 0
    let startY = 0
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    const handleTouchEnd = (e) => {
      if (page === 'home') return
      const dx = e.changedTouches[0].clientX - startX
      const dy = Math.abs(e.changedTouches[0].clientY - startY)
      // 滑动超过 100px 且是右滑，且纵向滑动小于横向（防止误触）
      if (dx > 100 && dy < Math.abs(dx) * 0.6) {
        setPage(prevPage)
      }
    }
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [page, prevPage])

  const checkForUpdate = () => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', UPDATE_URL, true)
    xhr.timeout = 10000
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const info = JSON.parse(xhr.responseText)
          if (info.version && info.version !== APP_VERSION) setUpdateInfo(info)
        } catch {}
      }
    }
    xhr.send()
  }

  useEffect(() => { checkForUpdate() }, [])

  const activeNav = page

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', position: 'relative', background: 'var(--cream)' }}>
      {/* 页面内容 */}
      {page === 'home' && <HomePage onNavigate={navigate} />}
      {page === 'jk' && <JKPage onNavigate={navigate} />}
      {page === 'intel' && <IntelPage onNavigate={navigate} />}
      {page === 'settings' && <SettingsPage onNavigate={navigate} />}

      {/* 持久底部导航栏 */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 100,
        background: 'var(--card)',
        borderTop: '1.5px solid var(--border)',
        padding: '6px 0 calc(6px + env(safe-area-inset-bottom))',
        display: 'flex', justifyContent: 'space-around'
      }}>
        {[
          { id: 'home', icon: '🏠', label: '首页' },
          { id: 'intel', icon: '📡', label: '情报' },
          { id: 'jk', icon: '🎲', label: '概率' },
          { id: 'settings', icon: '⚙️', label: '设置' },
        ].map(n => (
          <button key={n.id}
            onClick={() => navigate(n.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 2, padding: '6px 16px',
              color: activeNav === n.id ? 'var(--cocoa)' : 'var(--text-light)',
              fontWeight: activeNav === n.id ? 700 : 500,
              fontSize: 11,
            }}
          >
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      {/* 更新提示 */}
      {updateInfo && (
        <div style={{
          position: 'fixed', bottom: 80, left: 16, right: 16,
          background: 'var(--cocoa)', color: 'white',
          borderRadius: 16, padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 200, boxShadow: '0 4px 20px rgba(74,55,40,0.3)'
        }}>
          <div>
            <b>新版本 {updateInfo.version}</b>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{updateInfo.releaseNotes || ''}</div>
          </div>
          <button onClick={() => window.open(APK_URL, '_blank')} style={{
            background: 'white', color: 'var(--cocoa)', border: 'none',
            borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>更新</button>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}