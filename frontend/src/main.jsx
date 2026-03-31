import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)

/* 
// Désactivé temporairement pour résoudre le conflit de cache React
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('SW enregistré avec succès:', registration.scope);
    }).catch((error) => {
      console.log('Erreur d\'enregistrement du SW:', error);
    });
  });
}
*/
