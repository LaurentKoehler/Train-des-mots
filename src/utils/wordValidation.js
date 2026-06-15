/**
 * utils/wordValidation.js — Validation des mots et recherche des mots possibles.
 *
 * Toutes les comparaisons se font sur des mots NORMALISÉS :
 *   - minuscules
 *   - sans accents (NFD + suppression des diacritiques)
 * Cela permet de comparer "été" avec "ete" et de retrouver le mot
 * dans le dictionnaire même si le joueur tape sans accent.
 */

/** Normalise une chaîne : minuscules + suppression des accents. */
function normaliser(str) {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')                        // décompose "é" → "e" + combining acute
    .replace(/[\u0300-\u036f]/g, '');        // supprime les diacritiques
}

/**
 * Vérifie si un mot DÉJÀ normalisé peut être formé avec un ensemble de lettres.
 *
 * On utilise un compteur d'occurrences pour gérer les doublons :
 * si le mot demande 2×"E" mais le tirage n'en a qu'un → invalide.
 *
 * @param {string}   mot         - Mot normalisé (sans accents, minuscules)
 * @param {string[]} lettresBas  - Tableau de lettres du tirage en minuscules
 * @returns {boolean}
 */
function peutFormer(mot, lettresBas) {
  // Comptage des lettres disponibles
  const dispo = {};
  for (const l of lettresBas) {
    dispo[l] = (dispo[l] || 0) + 1;
  }
  // Consommation lettre par lettre du mot
  for (const c of mot) {
    if (!dispo[c]) return false;  // lettre absente ou épuisée
    dispo[c]--;
  }
  return true;
}

/**
 * Valide la saisie du joueur.
 *
 * Critères :
 * 1. Longueur ≥ 2 après normalisation
 * 2. Mot présent dans le dictionnaire
 * 3. Lettres toutes disponibles dans le tirage
 *
 * @param {string}   saisie      - Ce que le joueur a tapé
 * @param {string[]} lettres     - Tirage courant (majuscules)
 * @param {Set}      dico        - Set de mots normalisés sans accents
 * @returns {boolean}
 */
export function isValidWord(saisie, lettres, dico) {
  const mot = normaliser(saisie);
  if (mot.length < 2) return false;
  if (!dico.has(mot)) return false;
  return peutFormer(mot, lettres.map(l => l.toLowerCase()));
}

/**
 * Cherche TOUS les mots du dictionnaire formables avec le tirage courant.
 *
 * Parcoure les ~336 000 entrées du dictionnaire (~30-50 ms sur la plupart des machines).
 * Résultat trié par longueur croissante, puis alphabétiquement.
 *
 * @param {string[]} lettres - Tirage courant (majuscules)
 * @param {Set}      dico    - Set de mots normalisés
 * @returns {string[]}       - Liste triée des mots possibles
 */
export function findAllWords(lettres, dico) {
  const lettresBas = lettres.map(l => l.toLowerCase());
  const resultats = [];

  for (const mot of dico) {
    const len = mot.length;
    // On ignore les mots trop courts ou trop longs (> 8 lettres = notre tirage)
    if (len < 2 || len > 8) continue;
    if (peutFormer(mot, lettresBas)) {
      resultats.push(mot);
    }
  }

  // Tri : longueur croissante d'abord, puis alphabétique à longueur égale
  resultats.sort((a, b) => a.length - b.length || a.localeCompare(b));
  return resultats;
}
