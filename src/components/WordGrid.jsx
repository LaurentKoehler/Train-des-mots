/**
 * components/WordGrid.jsx — Grille de mots possibles avec carrés lettre par lettre.
 *
 * Ce composant est utilisé DEUX FOIS dans App.jsx, une fois par sidebar :
 *   - side="left"  → mots de 2, 3, 4 lettres (côté gauche de l'écran)
 *   - side="right" → mots de 5, 6, 7, 8 lettres (côté droit)
 *
 * Pour chaque longueur, on affiche :
 *   - Un label "NL" avec compteur trouvés/total
 *   - Une rangée de groupes de carrés (un carré par lettre du mot)
 *     - Carré vide (pointillés)  : mot pas encore trouvé
 *     - Carré vert (lettre)      : mot trouvé par le joueur
 */

/**
 * Un groupe de carrés pour un seul mot.
 * Affiche les lettres si trouvé, des cases vides sinon.
 */
function WordGroup({ len, words, foundWords }) {
  const nbTrouves = words.filter(w => foundWords && foundWords.has(w)).length;

  return (
    <div className="wg-group">
      {/* Label de longueur + compteur trouvés/total */}
      <span className="wg-len-label">
        {len}L
        <span className="wg-count">{nbTrouves}/{words.length}</span>
      </span>

      {/* Rangée de mots (chaque mot = une série de carrés) */}
      <div className="wg-row">
        {words.map((mot, wi) => {
          const trouve = foundWords && foundWords.has(mot);
          return (
            <div key={wi} className="wg-word">
              {Array.from(mot).map((lettre, li) => (
                <div
                  key={li}
                  className={`wg-sq${trouve ? ' wg-sq--found' : ''}`}
                >
                  {/* Affiche la lettre uniquement si le mot est trouvé */}
                  {trouve ? lettre.toUpperCase() : ''}
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
 * @param {string[]}     targetWords - Tous les mots formables avec le tirage courant
 * @param {Set<string>}  foundWords  - Mots déjà trouvés par le joueur
 * @param {'left'|'right'|'all'} side - Quelle moitié afficher
 */
export default function WordGrid({ targetWords, foundWords, side = 'all' }) {
  // Pendant le calcul initial, on affiche un message d'attente
  if (!targetWords || targetWords.length === 0) {
    return side !== 'right'
      ? <p className="wg-empty">Calcul…</p>
      : null;
  }

  // Regrouper les mots par longueur
  const parLongueur = {};
  for (const mot of targetWords) {
    if (!parLongueur[mot.length]) parLongueur[mot.length] = [];
    parLongueur[mot.length].push(mot);
  }

  // Toutes les longueurs présentes, triées
  const toutesLongueurs = Object.keys(parLongueur).map(Number).sort((a, b) => a - b);

  // Filtrer selon la sidebar demandée
  const longueurs =
    side === 'left'  ? toutesLongueurs.filter(l => l <= 4) :
    side === 'right' ? toutesLongueurs.filter(l => l >= 5) :
    toutesLongueurs;

  // Si aucun mot pour ce côté (ex: pas de mots longs), on n'affiche rien
  if (longueurs.length === 0) return null;

  return (
    <div className="wg-column">
      {longueurs.map(len => (
        <WordGroup
          key={len}
          len={len}
          words={parLongueur[len]}
          foundWords={foundWords}
        />
      ))}
    </div>
  );
}
