import { useState, useEffect } from 'react'

type ScrollDirection = 'up' | 'down'

function useScrollDirection() {
  const [direction, setDirection] = useState<ScrollDirection>('up')
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    let lastY = window.scrollY

    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastY

      setIsAtTop(currentY < 50)

      if (Math.abs(delta) > 5) {
        setDirection(delta > 0 ? 'down' : 'up')
        lastY = currentY
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { direction, isAtTop }
}

export default useScrollDirection
