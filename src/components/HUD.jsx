/**
 * components/HUD.jsx — Tête d'affichage (Heads-Up Display).
 *
 * Barre horizontale toujours visible affichant :
 *   ⏱ XXs  |  Score : XXXX  |  Combo ×N
 *
 * Le timer passe en rouge et clignote quand il reste ≤ 20 secondes.
 * Le combo est masqué si sa valeur est 0 (début de partie ou après erreur).
 */

/**
 * @param {number} timeLeft - Secondes restantes
 * @param {number} score    - Score courant
 * @param {number} combo    - Multiplicateur de combo courant
 */
export default function HUD({ timeLeft, score, combo }) {
  const classeTimer = timeLeft <= 20 ? 'hud-timer hud-timer--danger' : 'hud-timer';

  return (
    <div className="hud">
      <span className={classeTimer}>⏱ {timeLeft}s</span>
      <span className="hud-score">Score : {score}</span>
      {/* Combo masqué si = 0 */}
      {combo > 0 && <span className="hud-combo">Combo ×{combo}</span>}
    </div>
  );
}
