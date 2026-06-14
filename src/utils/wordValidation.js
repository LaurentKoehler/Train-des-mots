function normalize(str) {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Vérifie si un mot DÉJÀ normalisé peut être formé avec les lettres données (lowercase). */
function canFormNormalized(word, lettersLower) {
  const available = {};
  for (const l of lettersLower) {
    available[l] = (available[l] || 0) + 1;
  }
  for (const char of word) {
    if (!available[char]) return false;
    available[char]--;
    if (available[char] < 0) return false;
  }
  return true;
}

/**
 * isValidWord(input, letters, dictionary) → boolean
 */
export function isValidWord(input, letters, dictionary) {
  const word = normalize(input);
  if (word.length < 2) return false;
  if (!dictionary.has(word)) return false;
  return canFormNormalized(word, letters.map(l => l.toLowerCase()));
}

/**
 * findAllWords(letters, dictionary) → string[]
 * Retourne TOUS les mots du dictionnaire formables avec les 8 lettres disponibles.
 * Triés par longueur croissante, puis alphabétiquement.
 */
export function findAllWords(letters, dictionary) {
  const lettersLower = letters.map(l => l.toLowerCase());
  const result = [];

  for (const word of dictionary) {
    const len = word.length;
    if (len < 2 || len > 8) continue;
    if (canFormNormalized(word, lettersLower)) {
      result.push(word);
    }
  }

  result.sort((a, b) => a.length - b.length || a.localeCompare(b));
  return result;
}
