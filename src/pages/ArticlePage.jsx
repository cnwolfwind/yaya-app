import React, { useState, useEffect, useRef } from 'react'
import { Browser } from '@capacitor/browser'

const API_BASE = 'http://121.196.229.11:8080/intelligence-api/api/extract'

export default function ArticlePage({ url, title, source, onBack }) {
  const [loading, setLoading] = useState(true)
  const [article, setArticle] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const resp = await fetch(`${API_BASE}?url=${encodeURIComponent(url)}`)
        const json = await resp.json()
        if (cancelled) return
        if (json.success) {
          setArticle(json.data)
        } else {
          setError(json.error || '提取失败')
        }
      } catch (e) {
        if (!cancelled) setError(e.message || '网络错误')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [url])

  const openExternal = async () => {
    try { await Browser.open({ url }) } catch { window.open(url, '_blank') }
  }

  return (
    <div className="app">
      {/* 顶栏 */}
      <div className="top-bar" style={{ gap: 0 }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: 'var(--cocoa)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {article?.title || title || '阅读文章'}
          </div>
          {source && (
            <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 1 }}>
              {source}
            </div>
          )}
        </div>
        <button
          onClick={openExternal}
          style={{
            background: 'var(--white)', border: '1.5px solid var(--border)',
            borderRadius: 10, padding: '5px 10px', fontSize: 11, fontWeight: 600,
            color: 'var(--text-light)', cursor: 'pointer', flexShrink: 0
          }}
        >
          ↗ 原网页
        </button>
      </div>

      {/* 加载进度条 */}
      {loading && (
        <div style={{ height: 3, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'var(--tea)', borderRadius: '0 2px 2px 0',
            animation: 'articleLoading 1.8s ease-in-out infinite'
          }} />
        </div>
      )}

      {/* 内容区 */}
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {loading && (
          <div className="loading" style={{ marginTop: 60 }}>提取文章中…</div>
        )}

        {error && (
          <div className="empty-state" style={{ paddingTop: 40 }}>
            <div className="empty-icon">😞</div>
            <div className="empty-text" style={{ marginBottom: 4 }}>{error}</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 16, padding: '0 20px', wordBreak: 'break-all' }}>
              {url}
            </div>
            <button className="btn btn-primary" onClick={openExternal}>
              在浏览器中打开 ↗
            </button>
          </div>
        )}

        {article && !loading && (
          <div style={{ padding: '16px 18px 24px' }}>
            {/* 标题 */}
            <h1 style={{
              fontSize: 20, fontWeight: 800, color: 'var(--cocoa)',
              lineHeight: 1.4, marginBottom: 12
            }}>
              {article.title}
            </h1>

            {/* 来源信息 */}
            {(article.byline || article.siteName) && (
              <div style={{
                fontSize: 12, color: 'var(--text-light)',
                marginBottom: 20, paddingBottom: 16,
                borderBottom: '1px solid var(--border)'
              }}>
                {article.byline && <span>{article.byline}</span>}
                {article.byline && article.siteName && <span> · </span>}
                {article.siteName && <span>{article.siteName}</span>}
              </div>
            )}

            {/* 正文内容 */}
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                fontSize: 16, lineHeight: 1.85, color: 'var(--cocoa)',
                wordBreak: 'break-word'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
