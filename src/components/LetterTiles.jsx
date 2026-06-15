/**
 * components/LetterTiles.jsx — Affichage des 8 tuiles de lettres.
 *
 * Chaque tuile ressemble à une tuile de Scrabble :
 *   - Grande lettre au centre
 *   - Valeur Scrabble en bas à droite (importée depuis utils/letters.js)
 *
 * C'est un composant purement afficheur (aucune logique, aucun état).
 */
import { SCRABBLE_VALUES } from '../utils/letters';

/**
 * @param {string[]} letters - Tableau de 8 lettres majuscules
 */
export default function LetterTiles({ letters }) {
  return (
    <div className="letter-tiles">
      {letters.map((lettre, i) => (
        <div key={i} className="tile">
          {/* Lettre principale */}
          <span className="tile-letter">{lettre}</span>
          {/* Valeur Scrabble (coin bas-droit) */}
          <span className="tile-value">{SCRABBLE_VALUES[lettre] ?? 1}</span>
        </div>
      ))}
    </div>
  );
}
