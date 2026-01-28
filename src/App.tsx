import React from 'react'
import './App.css'
import TimeDisplay from './components/TimeDisplay'

// TODO: Add literary quotes based on time of day
// TODO: Add vscode folder with launch settings
// TODO: Add unit tests for TimeDisplay component
// TODO: Implement dark mode based on system preferences
// TODO: Add scripts in package.json for building and deploying the app
// TODO: README.md with project description and setup instructions

function App() {
  return (
    <div className="time-container">
      <TimeDisplay />
    </div>
  )
}

export default App
