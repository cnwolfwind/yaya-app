import React, { useState, useEffect } from 'react'
import JKPage from './pages/JKPage.jsx'
import IntelPage from './pages/IntelPage.jsx'
import HomePage from './pages/HomePage.jsx'

export default function App() {
  const [page, setPage] = useState('home')
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    })
  }, [])

  const handleInstall = () => {
    if (installPrompt) {
      installPrompt.prompt()
      installPrompt.userChoice.then(() => setInstallPrompt(null))
    }
  }

  const renderPage = () => {
    if (page === 'jk') return <JKPage onBack={() => setPage('home')} />
    if (page === 'intel') return <IntelPage onBack={() => setPage('home')} />
    return <HomePage onNavigate={setPage} installPrompt={installPrompt} onInstall={handleInstall} />
  }

  return (
    <div className="app">
      {installPrompt && (
        <div className="install-banner">
          <span>安装雅雅到桌面</span>
          <button className="install-btn" onClick={handleInstall}>安装</button>
        </div>
      )}
      {renderPage()}
    </div>
  )
}