export default function WordGrid({ targetWords, foundWords }) {
  if (!targetWords || targetWords.length === 0) {
    return (
      <div className="word-grid word-grid--loading">
        Calcul des mots possibles…
      </div>
    );
  }

  // Grouper tous les mots par longueur
  const byLength = {};
  for (const word of targetWords) {
    if (!byLength[word.length]) byLength[word.length] = [];
    byLength[word.length].push(word);
  }
  const lengths = Object.keys(byLength).map(Number).sort((a, b) => a - b);

  return (
    <div className="word-grid">
      {lengths.map((len) => (
        <div key={len} className="wg-group">
          <span className="wg-len-label">
            {len} lettre{len > 1 ? 's' : ''}
            <span className="wg-count">
              {foundWords
                ? `${byLength[len].filter(w => foundWords.has(w)).length}/${byLength[len].length}`
                : `0/${byLength[len].length}`}
            </span>
          </span>
          <div className="wg-row">
            {byLength[len].map((word, wi) => {
              const found = foundWords && foundWords.has(word);
              return (
                <div key={wi} className="wg-word">
                  {Array.from(word).map((letter, li) => (
                    <div
                      key={li}
                      className={`wg-sq${found ? ' wg-sq--found' : ''}`}
                    >
                      {found ? letter.toUpperCase() : ''}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
