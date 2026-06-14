import { useState, useEffect } from 'react';
import frenchWords from 'an-array-of-french-words';

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Anglicismes courants entrés dans l'usage quotidien français
 * mais absents du dictionnaire npm.
 */
const ANGLICISMS = [
  // Alimentation
  'toast', 'toasts', 'steak', 'steaks', 'burger', 'burgers',
  'cake', 'cakes', 'cookie', 'cookies', 'chips', 'bacon',
  'brownie', 'brownies', 'muffin', 'muffins', 'brunch',
  // Technologie & internet
  'web', 'blog', 'blogs', 'tweet', 'tweets', 'mail', 'mails',
  'wifi', 'pixel', 'pixels', 'selfie', 'selfies',
  // Sport & loisirs
  'goal', 'goals', 'surf', 'jogging', 'fitness', 'bowling',
  // Vie quotidienne
  'cool', 'job', 'jobs', 'fun', 'ok', 'stop', 'box',
  'parking', 'shopping', 'camping', 'meeting', 'weekend',
  'manager', 'managers', 'stress', 'look', 'boss',
  // Mode
  'jean', 'jeans', 'short', 'shorts', 'sweat', 'sweats',
  // Culture
  'fan', 'fans', 'star', 'stars', 'rock', 'pop', 'rap',
  'punk', 'show', 'live',
  // Mots très courants
  'yes', 'no',
  // Divers
  'hall', 'kit', 'kits', 'tag', 'tags',
].map(normalize);

export function useDictionary() {
  const [isLoading, setIsLoading] = useState(true);
  const [dictionary, setDictionary] = useState(new Set());

  useEffect(() => {
    async function buildDictionary() {
      // Source 1 : package npm
      const npmSet = new Set(frenchWords.map(normalize));

      // Source 2 : réseau
      let netSet = new Set();
      try {
        const resp = await fetch(
          'https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/fr.txt'
        );
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text = await resp.text();
        netSet = new Set(
          text
            .split('\n')
            .map((w) => normalize(w.trim()))
            .filter(Boolean)
        );
      } catch (err) {
        console.warn('[useDictionary] Source réseau indisponible, on continue sans elle :', err);
      }

      // Source 3 : anglicismes courants
      const anglicismSet = new Set(ANGLICISMS);

      // Fusion des trois sources
      const merged = new Set([...npmSet, ...netSet, ...anglicismSet]);
      setDictionary(merged);
      setIsLoading(false);
    }

    buildDictionary();
  }, []);

  return { isLoading, dictionary };
}
