import { useState } from 'react'
import { lessons } from './data/lessons'
import './index.css'

function App() {
  const [activeLesson, setActiveLesson] = useState(1)

  const currentLesson = lessons.find(l => l.id === activeLesson)

  const goToLesson = (id) => {
    setActiveLesson(id)
    window.scrollTo(0, 0)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>🍃 MongoDB</h1>
        <p className="subtitle">Foundation Course for Web3 Wallet</p>

        <nav>
          <div className="nav-section">
            <h3>Lessons</h3>
            {lessons.map(lesson => (
              <div
                key={lesson.id}
                className={`nav-item ${activeLesson === lesson.id ? 'active' : ''}`}
                onClick={() => goToLesson(lesson.id)}
              >
                <span className="num">{lesson.id}</span>
                {lesson.title}
              </div>
            ))}
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="lesson-header">
          <div className="lesson-number">BÀI {currentLesson.id} / {lessons.length}</div>
          <h1 className="lesson-title">{currentLesson.title}</h1>
          <p className="lesson-desc">{currentLesson.desc}</p>
        </header>

        <LessonContent content={currentLesson.content} />

        <div className="nav-buttons">
          {activeLesson > 1 ? (
            <button className="nav-btn" onClick={() => goToLesson(activeLesson - 1)}>
              <div className="nav-btn-label">Previous</div>
              <div>{lessons[activeLesson - 2].title}</div>
            </button>
          ) : <div />}

          {activeLesson < lessons.length ? (
            <button className="nav-btn primary" onClick={() => goToLesson(activeLesson + 1)}>
              <div className="nav-btn-label">Next</div>
              <div>{lessons[activeLesson].title}</div>
            </button>
          ) : (
            <button className="nav-btn primary" onClick={() => goToLesson(1)}>
              <div className="nav-btn-label">Restart</div>
              <div>Quay lại bài 1</div>
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

function LessonContent({ content }) {
  const lines = content.trim().split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Headers
    if (line.startsWith('## ')) {
      elements.push(
        <div key={i} className="content-section">
          <h2>{line.slice(3)}</h2>
        </div>
      )
      i++
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i}>{line.slice(4)}</h3>)
      i++
      continue
    }

    // Code blocks
    if (line.startsWith('```')) {
      const lang = line.slice(3) || 'text'
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <div key={i} className="code-block">
          <div className="code-header">{lang}</div>
          <pre>{codeLines.join('\n')}</pre>
        </div>
      )
      i++
      continue
    }

    // Tables
    if (line.startsWith('|') && lines[i + 1]?.includes('---')) {
      const tableLines = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      elements.push(<Table key={i} lines={tableLines} />)
      continue
    }

    // Info boxes
    if (line.startsWith('> ⚠️')) {
      elements.push(
        <div key={i} className="info-box warning">
          <div className="info-box-title">⚠️ Lưu ý</div>
          <p>{line.slice(5).trim()}</p>
        </div>
      )
      i++
      continue
    }

    // Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={i}>
          {listItems.map((item, idx) => (
            <li key={idx}>{formatInlineCode(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      const listItems = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ol key={i}>
          {listItems.map((item, idx) => (
            <li key={idx}>{formatInlineCode(item)}</li>
          ))}
        </ol>
      )
      continue
    }

    // Regular paragraphs
    if (line.trim()) {
      elements.push(<p key={i}>{formatInlineCode(line)}</p>)
    }

    i++
  }

  return <div className="content">{elements}</div>
}

function Table({ lines }) {
  const headers = lines[0].split('|').filter(c => c.trim()).map(c => c.trim())
  const rows = lines.slice(2).map(line =>
    line.split('|').filter(c => c.trim()).map(c => c.trim())
  )

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{formatInlineCode(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{formatInlineCode(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatInlineCode(text) {
  if (!text) return text

  const parts = text.split(/(`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>
    }
    // Bold
    if (part.includes('**')) {
      const boldParts = part.split(/(\*\*[^*]+\*\*)/)
      return boldParts.map((bp, j) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return <strong key={j}>{bp.slice(2, -2)}</strong>
        }
        return bp
      })
    }
    return part
  })
}

export default App
