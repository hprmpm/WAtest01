import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

// microCMS 設定
const url = "https://w2ygeo29p0.microcms.io/api/v1/episode2"
const apiKey = "gcqrzfLpHdLWE0ytFNtRGCle386wiz2qr9qx"

// API
const API_BASE = "/api"

async function postWithRetry(body) {
  try {
    const r = await axios.post(`${API_BASE}/`, body, {
      headers: { "ngrok-skip-browser-warning": "true" },
      timeout: 15000,
    })
    return r.data
  } catch (e) {
    if (e?.response?.status === 429) {
      const retryAfter =
        Number(e.response.headers["retry-after"] ?? e.response.headers["retryafter"] ?? 1) * 1000
      await new Promise(r => setTimeout(r, retryAfter))
      const r2 = await axios.post(`${API_BASE}/`, body, {
        headers: { "ngrok-skip-browser-warning": "true" },
        timeout: 15000,
      })
      return r2.data
    }
    throw e
  }
}

function normalizeQuiz(raw, source) {
  if (!raw) return null
  const quiz = JSON.parse(JSON.stringify(raw))

  if (quiz.answer) {
    if (typeof quiz.answer.index !== 'number') {
      const correctRaw = quiz.answer.correct
      if (correctRaw != null) {
        const idx = Number(correctRaw)
        if (!Number.isNaN(idx)) quiz.answer.index = idx
      }
    }
  }

  quiz.meta = quiz.meta || {}
  if (!quiz.meta.sourceId && source?.id) quiz.meta.sourceId = source.id
  if (!quiz.meta.sourceTitle && source?.title) quiz.meta.sourceTitle = source.title
  if (!quiz.meta.type) quiz.meta.type = 'single'
  if (!quiz.meta.difficulty) quiz.meta.difficulty = 'easy'

  return quiz
}

function App() {
  const [contents, setContents] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [picked, setPicked] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios
      .get(url, { headers: { 'X-MICROCMS-API-KEY': apiKey } })
      .then(res => setContents(res.data.contents))
      .catch(console.error)
  }, [])

  const generateQuiz = async (content) => {
    if (loading) return
    setLoading(true)
    try {
      const raw = await postWithRetry(content)
      const normalized = normalizeQuiz(raw, content)

      if (!normalized?.question || !Array.isArray(normalized?.options)) {
        throw new Error('Invalid quiz format from API')
      }

      setQuiz(normalized)
      setPicked(null)
      setSelectedItem(content)
    } catch (e) {
      if (e?.response) {
        console.error('status:', e.response.status, 'data:', e.response.data)
        alert(`クイズ生成に失敗しました（HTTP ${e.response.status}）。コンソールの詳細を確認してください。`)
      } else {
        console.error(e?.message || e)
        alert(`クイズ生成に失敗しました。ネットワークエラーの可能性があります。`)
      }
      alert("クイズ生成に失敗しました。APIのURL/ルートとCORS設定をご確認ください。")
    } finally {
      setLoading(false)
    }
  }

  const onPick = (i) => setPicked(i)

  return (
    <>
      <div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {contents.map(content => (
            <li key={content.id} style={{
              marginBottom: 24, border: '1px solid #ddd',
              padding: 16, borderRadius: 8
            }}>
              {content.thumbnail && (
                <img
                  src={content.thumbnail.url}
                  alt={content.title}
                  style={{ width: '300px', borderRadius: '8px' }}
                />
              )}
              <h2>{content.title}</h2>
              <p>{content.summary}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setSelectedItem(content)}>詳細を開く</button>
                <button onClick={() => generateQuiz(content)} disabled={loading}>
                  {loading ? '生成中…' : 'クイズ生成'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 詳細ポップアップ */}
      {selectedItem && (
        <div
          id='popup'
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div
            id='popup-content'
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 12,
              padding: 24, width: 'min(720px, 90vw)'
            }}
          >
            <h2 id='popup-title'>
              第{selectedItem.number}話: {selectedItem.title}
            </h2>
            <p id='popup-description'>{selectedItem.description}</p>

            {/* クイズ表示 */}
            {quiz && (!quiz.meta?.sourceId || quiz.meta?.sourceId === selectedItem.id) && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ marginBottom: 8 }}>クイズ</h3>
                <p style={{ fontWeight: 600 }}>{quiz.question}</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {quiz.options.map((opt, i) => {
                    const isPicked = picked === i
                    const isCorrect = Number(quiz.answer?.index) === i
                    const bg =
                      picked == null ? '#fff'
                        : isCorrect ? '#e6ffe6'
                          : isPicked ? '#ffe6e6'
                            : '#fff'
                    return (
                      <li key={i} style={{ margin: '8px 0' }}>
                        <button
                          onClick={() => onPick(i)}
                          style={{
                            width: '100%', textAlign: 'left',
                            padding: '12px 14px', borderRadius: 8,
                            border: '1px solid #ccc', background: bg, cursor: 'pointer'
                          }}
                        >
                          {opt}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {picked != null && (
                  <div style={{
                    marginTop: 12, padding: 12,
                    background: '#f7f7f7', borderRadius: 8
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      {picked === Number(quiz.answer?.index) ? '正解！' : '不正解'}
                    </div>
                    <div>{quiz.answer?.explanation}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default App
