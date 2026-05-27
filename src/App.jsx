import React, { useState, useCallback, useEffect } from 'react'

import HomePage from './pages/HomePage'
import JKPage from './pages/JKPage'
import IntelPage from './pages/IntelPage'
import SettingsPage from './pages/SettingsPage'

const APP_VERSION = '2.0.0'
const UPDATE_URL = 'http://121.196.229.11/yaya/version.json'
const APK_URL = 'http://121.196.229.11/yaya/yaya.apk'

export default function App() {
  const [page, setPage] = useState('home')
  const [prev, setPrev] = useState('home')
  const [checking, setChecking] = useState(false)
  const [updateInfo, setUpdateInfo] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  const navigate = useCallback((p) => { setPrev(page); setPage(p) }, [page])

  const checkForUpdate = () => {
    setChecking(true)
    const xhr = new XMLHttpRequest()
    xhr.open('GET', UPDATE_URL, true)
    xhr.timeout = 10000
    xhr.onload = () => {
      setChecking(false)
      if (xhr.status === 200) {
        try {
          const info = JSON.parse(xhr.responseText)
          if (info.version && info.version !== APP_VERSION) {
            console.log('发现新版本:', info.version)
            setUpdateInfo(info)
          } else {
            console.log('已是最新版本:', APP_VERSION)
          }
        } catch (e) {
          console.log('更新检查JSON解析失败:', e.message)
        }
      }
    }
    xhr.onerror = () => { setChecking(false); console.log('更新检查失败: 网络错误') }
    xhr.ontimeout = () => { setChecking(false); console.log('更新检查失败: 超时') }
    xhr.send()
  }

  useEffect(() => { checkForUpdate() }, [])

  return (
    <>
      {page === 'home' && <HomePage onNavigate={navigate} />}
      {page === 'jk' && <JKPage onBack={() => setPage(prev)} />}
      {page === 'intel' && <IntelPage onBack={() => setPage(prev)} />}
      {page === 'settings' && <SettingsPage onBack={() => setPage(prev)} />}

      {updateInfo && (
        <div style={{
          position:'fixed',bottom:20,left:16,right:16,
          background:'var(--cocoa)',color:'white',
          borderRadius:16,padding:'14px 20px',
          display:'flex',alignItems:'center',justifyContent:'space-between',
          zIndex:200,boxShadow:'0 4px 20px rgba(74,55,40,0.3)'
        }}>
          <div>
            <b>新版本 {updateInfo.version}</b>
            <div style={{fontSize:12,opacity:0.8,marginTop:2}}>{updateInfo.releaseNotes || ''}</div>
          </div>
          <button onClick={() => window.open(APK_URL, '_blank')} style={{
            background:'white',color:'var(--cocoa)',border:'none',
            borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer'
          }}>更新</button>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
