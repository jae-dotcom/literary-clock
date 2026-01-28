import React, { useEffect, useState } from 'react'

const TimeDisplay: React.FC = () => {
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const formatted = now.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return <div className="time-display">{formatted}</div>
}

export default TimeDisplay
