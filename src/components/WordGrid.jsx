function WordGroup({ len, words, foundWords }) {
  const found = words.filter(w => foundWords && foundWords.has(w)).length;
  return (
    <div className="wg-group">
      <span className="wg-len-label">
        {len}L<span className="wg-count">{found}/{words.length}</span>
      </span>
      <div className="wg-row">
        {words.map((word, wi) => {
          const isFound = foundWords && foundWords.has(word);
          return (
            <div key={wi} className="wg-word">
              {Array.from(word).map((letter, li) => (
                <div key={li} className={`wg-sq${isFound ? ' wg-sq--found' : ''}`}>
                  {isFound ? letter.toUpperCase() : ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * side = 'left'  → longueurs ≤ 4 (mots courts, sidebar gauche)
 * side = 'right' → longueurs ≥ 5 (mots longs, sidebar droite)
 */
export default function WordGrid({ targetWords, foundWords, side = 'all' }) {
  if (!targetWords || targetWords.length === 0) {
    return side !== 'right'
      ? <p className="wg-empty">Calcul…</p>
      : null;
  }

  const byLength = {};
  for (const w of targetWords) {
    if (!byLength[w.length]) byLength[w.length] = [];
    byLength[w.length].push(w);
  }
  const all = Object.keys(byLength).map(Number).sort((a, b) => a - b);

  const lengths =
    side === 'left'  ? all.filter(l => l <= 4) :
    side === 'right' ? all.filter(l => l >= 5) : all;

  if (lengths.length === 0) return null;

  return (
    <div className="wg-column">
      {lengths.map(len => (
        <WordGroup key={len} len={len} words={byLength[len]} foundWords={foundWords} />
      ))}
    </div>
  );
}
