import React, { useEffect, useState } from 'react'
import { TimeQuote, QUOTES } from '../constants/TimeQuotes'


const QuoteDisplay = () => {
  const [quote, setQuote] = useState<TimeQuote | null>(null)

  useEffect(() => {
    const updateQuote = () => {
      const now = new Date()
      const currentHour = now.getHours()
      const selectedQuote = QUOTES.find((q) => q.hour === currentHour)
      if (selectedQuote) {
        setQuote(selectedQuote)
      }
    }

    updateQuote()
    const interval = setInterval(updateQuote, 60000)
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
