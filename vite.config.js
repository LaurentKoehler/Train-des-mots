/**
 * vite.config.js — Configuration du bundler Vite.
 *
 * `base` : chemin racine du site une fois déployé.
 * Sur GitHub Pages, l'app n'est PAS à la racine (/) mais sous /Train-des-mots/.
 * Sans ce réglage, Vite génère des chemins absolus (/assets/…) qui ne trouvent
 * rien sur le CDN de GitHub → page blanche.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Train-des-mots/',   // doit correspondre EXACTEMENT au nom du repo GitHub
})
