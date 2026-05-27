import React, { useState, useEffect } from 'react'
import JKPage from './pages/JKPage.jsx'
import IntelPage from './pages/IntelPage.jsx'
import HomePage from './pages/HomePage.jsx'

const APP_VERSION = '1.0.11'
const UPDATE_URL = 'http://121.196.229.11/yaya/version.json'
const APK_URL = 'http://121.196.229.11/yaya/yaya.apk'

export default function App() {
  const [page, setPage] = useState('home')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [updateInfo, setUpdateInfo] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    })

    // 检查更新
    checkForUpdate()
  }, [])

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

  const handleInstallApp = () => {
    if (installPrompt) {
      installPrompt.prompt()
      installPrompt.userChoice.then(() => setInstallPrompt(null))
    }
  }

  const handleUpdate = () => {
    // 在 Android 上打开下载链接，用户下载后手动安装
    window.open(APK_URL, '_blank')
  }

  const renderPage = () => {
    if (page === 'jk') return <JKPage onBack={() => setPage('home')} />
    if (page === 'intel') return <IntelPage onBack={() => setPage('home')} />
    return <HomePage onNavigate={setPage} installPrompt={installPrompt} onInstall={handleInstallApp} version={APP_VERSION} />
  }

  return (
    <div className="app">
      {/* 更新提示 Banner */}
      {updateInfo && (
        <div className="update-banner">
          <span>发现新版本 v{updateInfo.version}：{updateInfo.releaseNotes || '修复问题'}</span>
          <button onClick={handleUpdate}>立即更新</button>
        </div>
      )}

      {/* PWA 安装提示 */}
      {installPrompt && !updateInfo && (
        <div className="install-banner">
          <span>安装雅雅到桌面</span>
          <button className="install-btn" onClick={handleInstallApp}>安装</button>
        </div>
      )}

      {renderPage()}
    </div>
  )
}

export { APP_VERSION }
