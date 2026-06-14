export default function EndScreen({ victory, scoreItems, timeLeft, onReplay }) {
  const wordScore = scoreItems.reduce(
    (sum, { length, comboMult }) => sum + Math.round(length * length * comboMult),
    0
  );
  const timeBonus = victory ? timeLeft * 15 : 0;
  const total = wordScore + timeBonus;

  return (
    <div className="end-overlay">
      <div className="end-panel">
        <h1 className={victory ? 'end-title--victory' : 'end-title--defeat'}>
          {victory ? '🚂 ARRIVÉE !' : '⏱ TEMPS ÉCOULÉ'}
        </h1>

        <div className="end-score-detail">
          <p>Score mots : <strong>{wordScore}</strong></p>
          {victory && <p>Bonus temps (+{timeLeft}s × 15) : <strong>+{timeBonus}</strong></p>}
          <p className="end-total">Total : <strong>{total}</strong></p>
        </div>

        {scoreItems.length > 0 && (
          <div className="end-words">
            <h3>Mots trouvés ({scoreItems.length})</h3>
            <ul>
              {scoreItems.map(({ word, length, comboMult }, i) => (
                <li key={i}>
                  {word}
                  <span className="end-word-detail">
                    {length}² × {comboMult.toFixed(2)} = {Math.round(length * length * comboMult)} pts
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className="replay-btn" onClick={onReplay}>
          🔄 Rejouer
        </button>
      </div>
    </div>
  );
}
