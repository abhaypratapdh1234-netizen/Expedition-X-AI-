import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import 'leaflet/dist/leaflet.css'
import { initIdlePrefetching } from './utils/routePrefetcher'

// Kick off background prefetching during idle cycles so all pages load in 0ms
initIdlePrefetching()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

