import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 2 * 60_000,   // 2 min avant de considérer les données périmées (Production standard)
            gcTime: 10 * 60_000,     // 10 min de cache en mémoire
            retry: 2,                // 2 tentatives avant échec définitif
            refetchOnWindowFocus: false, // Évite les appels réseau excessifs au focus
            refetchOnReconnect: true,     // Essentiel pour la résilience réseau (Guinée/Mobile)
        },
    },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Prompt user to update
    },
    onOfflineReady() {
      // App is ready to work offline
    },
  })
}
