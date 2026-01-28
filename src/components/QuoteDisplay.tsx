import React, { useEffect, useState } from 'react'
import { TimeQuote, QUOTES } from '../constants/TimeQuotes'


const QuoteDisplay: React.FC = () => {
  const [quote, setQuote] = useState<TimeQuote | null>(null)

  useEffect(() => {
    const updateQuote = () => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const key = `${hh}:${mm}`
      const selectedQuote = QUOTES.find((q) => q.time === key)
      if (selectedQuote) {
        setQuote(selectedQuote)
      } else {
        setQuote(null)
      }
    }

    updateQuote()
    const interval = setInterval(updateQuote, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!quote) {
    return null
  }

  return (
    <div className="quote-display">
      <p className="quote-text">{quote.text}</p>
      {quote.author && <p className="quote-author">— {quote.author}</p>}
    </div>
  )
}

export default QuoteDisplay
