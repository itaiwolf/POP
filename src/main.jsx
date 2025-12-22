import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import { GameProvider } from './context/GameContext'
import { DataProvider } from './context/DataContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </GameProvider>
  </StrictMode>,
)
