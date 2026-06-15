/**
 * hooks/useDictionary.js — Chargement et fusion du dictionnaire français.
 *
 * Le dictionnaire final est un Set de mots normalisés (minuscules, sans accents).
 * Il est construit à partir de trois sources :
 *
 *   1. Package npm "an-array-of-french-words" (~336 000 mots, chargé en local)
 *   2. Fichier texte sur GitHub (~74 000 mots, chargé via fetch au démarrage)
 *   3. Liste manuelle d'anglicismes courants absents des sources ci-dessus
 *      (toast, burger, cool, job, wifi, tweet…)
 *
 * Si la source réseau échoue (pas de connexion, CORS…), le jeu continue
 * sans elle — ça n'est pas bloquant.
 */
import { useState, useEffect } from 'react';
import frenchWords from 'an-array-of-french-words';  // JSON de ~336k mots

/** Normalise : minuscules + suppression des accents. */
function normaliser(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Anglicismes courants utilisés en français quotidien,
 * souvent absents des dictionnaires traditionnels.
 */
const ANGLICISMES = [
  // Alimentation
  'toast', 'toasts', 'steak', 'steaks', 'burger', 'burgers',
  'cake', 'cakes', 'cookie', 'cookies', 'chips', 'bacon', 'brownie', 'brunch',
  // Technologie & internet
  'web', 'blog', 'blogs', 'tweet', 'tweets', 'mail', 'mails',
  'wifi', 'pixel', 'pixels', 'selfie',
  // Sport & loisirs
  'goal', 'goals', 'surf', 'jogging', 'fitness', 'bowling',
  // Vie quotidienne
  'cool', 'job', 'jobs', 'fun', 'ok', 'stop', 'box',
  'parking', 'shopping', 'camping', 'meeting', 'weekend',
  'manager', 'stress', 'look', 'boss',
  // Mode
  'jean', 'jeans', 'short', 'shorts', 'sweat', 'sweats',
  // Culture
  'fan', 'fans', 'star', 'stars', 'rock', 'pop', 'rap', 'show', 'live',
  // Divers
  'yes', 'no', 'hall', 'kit', 'kits', 'tag', 'tags',
].map(normaliser);  // tous normalisés dès la déclaration

/**
 * Hook React qui construit le dictionnaire de façon asynchrone.
 *
 * @returns {{ isLoading: boolean, dictionary: Set<string> }}
 *   - isLoading : true pendant la construction (affiche l'écran d'attente)
 *   - dictionary : Set prêt à l'emploi une fois chargé
 */
export function useDictionary() {
  const [isLoading, setIsLoading]   = useState(true);
  const [dictionary, setDictionary] = useState(new Set());

  useEffect(() => {
    async function construireDico() {
      // --- Source 1 : package npm (synchrone, déjà en mémoire) ---
      const setNpm = new Set(frenchWords.map(normaliser));

      // --- Source 2 : fichier réseau ---
      let setReseau = new Set();
      try {
        const resp = await fetch(
          'https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/fr.txt'
        );
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const texte = await resp.text();
        setReseau = new Set(
          texte.split('\n').map(m => normaliser(m.trim())).filter(Boolean)
        );
      } catch (err) {
        // Silencieux : le jeu fonctionne sans la source réseau
        console.warn('[useDictionary] Source réseau indisponible :', err.message);
      }

      // --- Source 3 : anglicismes manuels ---
      const setAnglicismes = new Set(ANGLICISMES);

      // --- Fusion des trois sources dans un seul Set ---
      const fusion = new Set([...setNpm, ...setReseau, ...setAnglicismes]);

      setDictionary(fusion);
      setIsLoading(false);
    }

    construireDico();
  }, []); // [] = s'exécute une seule fois au montage du composant

  return { isLoading, dictionary };
}
