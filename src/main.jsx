import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import './index.scss'

const redirect = sessionStorage.redirect;
if (redirect) {
  sessionStorage.removeItem("redirect");
  const path = redirect.replace(window.location.origin, "");
  if (path && path !== window.location.pathname) {
    window.history.replaceState(null, "", path);
  }
}

function ZoomBlocker({ children }) {
  useEffect(() => {
    const handleGestureStart = (e) => e.preventDefault()
    const handleTouchMove = (e) => {
      if (e.scale && e.scale !== 1) {
        e.preventDefault()
      }
    }

    document.addEventListener('gesturestart', handleGestureStart)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      document.removeEventListener('gesturestart', handleGestureStart)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ZoomBlocker>
      <App />
    </ZoomBlocker>
  </StrictMode>
)