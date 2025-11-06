import { useState } from 'react'
import './App.css'

function App() {
  const [selectedDate] = useState<Date>(new Date())

  return (
    <div className="app">
      <header className="app-header">
        <h1>Stock Earnings Tracker</h1>
        <p className="subtitle">Track daily earnings reports and stock performance</p>
      </header>
      <main className="app-main">
        <div className="date-display">
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <div className="coming-soon">
          <p>Loading earnings data...</p>
        </div>
      </main>
    </div>
  )
}

export default App
