import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

function render() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

// En el navegador (sin Electron) usamos datos simulados para previsualizar la UI.
if (import.meta.env.DEV && !window.electronAPI) {
  import('./dev/mockElectron').then(render)
} else {
  render()
}
