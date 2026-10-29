import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './legacy.css'

document.body.classList.add('disp')
createRoot(document.getElementById('root')).render(<App />)
