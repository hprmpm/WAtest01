import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

const url = "https://w2ygeo29p0.microcms.io/api/v1/episode2"
const apiKey = "gcqrzfLpHdLWE0ytFNtRGCle386wiz2qr9qx"

function App() {
  const [contents, setContents] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [picked, setPicked] = useState(null)

  useEffect(() => {
    axios.get(url, { headers: { 'X-MICROCMS-API-KEY': apiKey } })
      .then(res => setContents(res.data.contents))
      .catch(console.error)
  }, [])

  const generateQuiz = async (content) => {
    try {
      const res = await axios.post("http://localhost:3000/quiz", { content })
      setQuiz(res.data)
      setPicked(null)
      setSelectedItem(content)
    } catch (e) {
      console.error(e)
      alert("クイズ生成に失敗しました。サーバが起動しているか確認してください。")
    }
  }

  const onPick = (i) => setPicked(i)

  return (
    <>
      <div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {contents.map(content => (
            <li key={content.id} style={{ marginBottom: 24, border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
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
                <button onClick={() => generateQuiz(content)}>クイズ生成</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 詳細ポップアップ */}
      {selectedItem && (
        <div id='popup' onClick={() => setSelectedItem(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div id='popup-content' onClick={(e) => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 12, padding: 24, width: 'min(720px, 90vw)'
          }}>
            <h2 id='popup-title'>
              第{selectedItem.number}話: {selectedItem.title}
            </h2>
            <p id='popup-description'>{selectedItem.description}</p>

            {/* クイズ表示 */}
            {quiz && quiz.meta?.sourceId === selectedItem.id && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ marginBottom: 8 }}>クイズ</h3>
                <p style={{ fontWeight: 600 }}>{quiz.question}</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {quiz.options.map((opt, i) => {
                    const isPicked = picked === i
                    const isCorrect = quiz.answer.index === i
                    const bg =
                      picked == null ? '#fff' :
                      isCorrect ? '#e6ffe6' :
                      isPicked ? '#ffe6e6' : '#fff'
                    return (
                      <li key={i} style={{ margin: '8px 0' }}>
                        <button
                          onClick={() => onPick(i)}
                          style={{
                            width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 8,
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
                  <div style={{ marginTop: 12, padding: 12, background: '#f7f7f7', borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      {picked === quiz.answer.index ? '正解！' : '不正解'}
                    </div>
                    <div>{quiz.answer.explanation}</div>
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