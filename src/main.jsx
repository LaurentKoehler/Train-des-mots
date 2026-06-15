/**
 * main.jsx — Point d'entrée de l'application React.
 *
 * Ce fichier est le seul appelé par index.html.
 * Il monte le composant racine <App /> dans la div#root du DOM.
 * <StrictMode> active des avertissements supplémentaires en développement
 * (double-exécution des effets, détection des mauvaises pratiques).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'      // reset CSS minimal
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
