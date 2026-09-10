import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

// Suppress benign Chrome DevTools Live Metrics & Web-Vitals injected script errors (e.g. reportAllChanges startTime bug)
window.addEventListener('error', (event) => {
  if (
    event?.message?.includes("Cannot read properties of undefined (reading 'startTime')") ||
    event?.error?.stack?.includes('reportAllChanges')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (
    event?.reason?.message?.includes("Cannot read properties of undefined (reading 'startTime')") ||
    event?.reason?.stack?.includes('reportAllChanges')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
