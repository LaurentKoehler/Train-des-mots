const LETTER_WEIGHTS = {
  // Poids élevé
  A: 9, E: 15, I: 8, O: 6, U: 6, N: 7, R: 6, S: 6, T: 6, L: 5,
  // Poids moyen
  B: 2, C: 3, D: 3, F: 2, G: 2, H: 2, M: 3, P: 3,
  // Poids faible
  J: 1, K: 1, Q: 1, V: 1, W: 1, X: 1, Y: 2, Z: 1,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

// Construit le pool pondéré une seule fois
const POOL = Object.entries(LETTER_WEIGHTS).flatMap(([letter, weight]) =>
  Array(weight).fill(letter)
);

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateLetters() {
  const letters = [];

  // Garantit au moins 3 voyelles
  const vowelPool = POOL.filter((l) => VOWELS.has(l));
  const consonantPool = POOL.filter((l) => !VOWELS.has(l));

  for (let i = 0; i < 3; i++) {
    letters.push(pickRandom(vowelPool));
  }

  // Remplit les 5 restantes depuis le pool complet
  while (letters.length < 8) {
    letters.push(pickRandom(POOL));
  }

  // Mélange Fischer-Yates
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  return letters;
}

// Valeurs Scrabble des lettres (référence officielle française)
export const SCRABBLE_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 10, L: 1, M: 2, N: 1, O: 1, P: 3, Q: 8, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 10, X: 10, Y: 10, Z: 10,
};
