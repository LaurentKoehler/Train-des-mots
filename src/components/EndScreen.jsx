/**
 * components/EndScreen.jsx — Overlay de fin de partie.
 *
 * Affiché en overlay plein écran semi-transparent quand le jeu se termine.
 *
 * VICTOIRE  (🚂 ARRIVÉE !)  : score avec bonus temps, liste des mots trouvés
 * DÉFAITE   (⏱ TEMPS ÉCOULÉ) : score sans bonus, même liste
 *
 * Le score détaillé montre pour chaque mot :
 *   longueur² × comboMult = points
 *
 * @param {boolean}  victory    - true = victoire, false = défaite
 * @param {Array}    scoreItems - [{word, length, comboMult}]
 * @param {number}   timeLeft   - Secondes restantes au moment de la fin
 * @param {Function} onReplay   - Callback "Rejouer"
 */
export default function EndScreen({ victory, scoreItems, timeLeft, onReplay }) {
  // Calcul du score depuis les items
  const scoreMotsn = scoreItems.reduce(
    (total, { length, comboMult }) => total + Math.round(length * length * comboMult),
    0
  );
  const bonusTemps = victory ? timeLeft * 15 : 0;
  const total      = scoreMotsn + bonusTemps;

  return (
    <div className="end-overlay">
      <div className="end-panel">

        {/* Titre selon résultat */}
        <h1 className={victory ? 'end-title--victory' : 'end-title--defeat'}>
          {victory ? '🚂 ARRIVÉE !' : '⏱ TEMPS ÉCOULÉ'}
        </h1>

        {/* Détail du score */}
        <div className="end-score-detail">
          <p>Score mots : <strong>{scoreMotsn}</strong></p>
          {/* Bonus temps uniquement en cas de victoire */}
          {victory && (
            <p>Bonus temps (+{timeLeft}s × 15) : <strong>+{bonusTemps}</strong></p>
          )}
          <p className="end-total">Total : <strong>{total}</strong></p>
        </div>

        {/* Liste des mots trouvés avec détail */}
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
