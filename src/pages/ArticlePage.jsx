import React, { useState, useRef, useEffect } from 'react'
import { Browser } from '@capacitor/browser'

export default function ArticlePage({ url, title, source, onBack }) {
  const [loading, setLoading] = useState(true)
  const [iframeBlocked, setIframeBlocked] = useState(false)
  const iframeRef = useRef(null)
  const timeoutRef = useRef(null)

  // 超时检测：8 秒还没加载完就算失败
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setLoading(false)
        try {
          // 尝试检测 iframe 是否真的在加载（跨域情况下无法访问 contentDocument）
          const doc = iframeRef.current?.contentDocument
          if (doc && (doc.body?.innerHTML === '' || doc.body?.children.length === 0)) {
            setIframeBlocked(true)
          }
        } catch {
          // 跨域时 contentDocument 访问会抛异常，但不代表被阻止
        }
      }
    }, 8000)
    return () => clearTimeout(timeoutRef.current)
  }, [loading, url])

  const handleIframeLoad = () => {
    clearTimeout(timeoutRef.current)
    setLoading(false)
  }

  const handleIframeError = () => {
    clearTimeout(timeoutRef.current)
    setLoading(false)
    setIframeBlocked(true)
  }

  const openExternal = async () => {
    try {
      await Browser.open({ url })
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="app">
      {/* 顶栏：返回 + 标题 */}
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 700, color: 'var(--cocoa)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {title || '阅读文章'}
          </div>
          {source && (
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 1 }}>
              {source}
            </div>
          )}
        </div>
        {/* 浏览器兜底按钮 */}
        <button
          onClick={openExternal}
          style={{
            background: 'var(--white)', border: '1.5px solid var(--border)',
            borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 600,
            color: 'var(--text-light)', cursor: 'pointer', flexShrink: 0
          }}
        >
          ↗ 浏览器
        </button>
      </div>

      {/* 加载进度条 */}
      {loading && !iframeBlocked && (
        <div style={{ height: 3, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'var(--tea)', borderRadius: '0 2px 2px 0',
            animation: 'articleLoading 1.8s ease-in-out infinite'
          }} />
        </div>
      )}

      {/* iframe 内容区 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {iframeBlocked ? (
          <div className="empty-state" style={{ paddingTop: 60 }}>
            <div className="empty-icon">🔒</div>
            <div className="empty-text" style={{ marginBottom: 4 }}>该网站不支持内嵌阅读</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 16, wordBreak: 'break-all', padding: '0 20px' }}>
              {url}
            </div>
            <button className="btn btn-primary" onClick={openExternal}>
              在浏览器中打开 ↗
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={url}
            style={{
              width: '100%', height: '100%', border: 'none',
              visibility: loading ? 'hidden' : 'visible',
              position: 'absolute', top: 0, left: 0
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
            title="文章内容"
          />
        )}

        {loading && !iframeBlocked && (
          <div className="loading" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            加载中…
          </div>
        )}
      </div>
    </div>
  )
}
