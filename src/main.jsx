import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MouthMetricsApp } from './mouthmetrics/MouthMetricsApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MouthMetricsApp />
  </StrictMode>,
)
