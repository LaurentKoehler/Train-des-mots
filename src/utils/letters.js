/**
 * utils/letters.js — Génération du tirage de 8 lettres.
 *
 * Distribution inspirée du Scrabble français :
 * - Poids élevé  : voyelles + lettres fréquentes (A E I O U N R S T L)
 * - Poids moyen  : B C D F G H M P
 * - Poids faible : J K Q V W X Y Z
 *
 * Contrainte : au moins 3 voyelles garanties dans chaque tirage.
 */

// Poids de tirage par lettre (plus le chiffre est grand, plus la lettre est fréquente)
const LETTER_WEIGHTS = {
  A: 9, E: 15, I: 8, O: 6, U: 6, N: 7, R: 6, S: 6, T: 6, L: 5,
  B: 2, C: 3,  D: 3, F: 2, G: 2, H: 2, M: 3, P: 3,
  J: 1, K: 1,  Q: 1, V: 1, W: 1, X: 1, Y: 2, Z: 1,
};

const VOYELLES = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

// Pool pondéré : chaque lettre est répétée autant de fois que son poids
// Ex : A apparaît 9 fois, E 15 fois, J 1 fois, etc.
const POOL = Object.entries(LETTER_WEIGHTS).flatMap(
  ([lettre, poids]) => Array(poids).fill(lettre)
);

/** Pioche une lettre aléatoire depuis un tableau de lettres. */
function piocher(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Génère un tirage de 8 lettres majuscules avec au moins 3 voyelles.
 * @returns {string[]} Tableau de 8 lettres majuscules.
 */
export function generateLetters() {
  const lettres = [];

  // 1. Garantir 3 voyelles en piochant uniquement dans le pool de voyelles
  const poolVoyelles = POOL.filter(l => VOYELLES.has(l));
  for (let i = 0; i < 3; i++) {
    lettres.push(piocher(poolVoyelles));
  }

  // 2. Compléter jusqu'à 8 lettres depuis le pool complet (voyelles et consonnes)
  while (lettres.length < 8) {
    lettres.push(piocher(POOL));
  }

  // 3. Mélange Fischer-Yates pour ne pas toujours commencer par les voyelles
  for (let i = lettres.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lettres[i], lettres[j]] = [lettres[j], lettres[i]];
  }

  return lettres;
}

/**
 * Valeurs Scrabble françaises des lettres.
 * Affichées en bas à droite de chaque tuile.
 */
export const SCRABBLE_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 10, L: 1, M: 2, N: 1, O: 1, P: 3, Q: 8, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 10, X: 10, Y: 10, Z: 10,
};
