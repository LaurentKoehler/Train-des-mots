import { SCRABBLE_VALUES } from '../utils/letters';

export default function LetterTiles({ letters }) {
  return (
    <div className="letter-tiles">
      {letters.map((letter, i) => (
        <div key={i} className="tile">
          <span className="tile-letter">{letter}</span>
          <span className="tile-value">{SCRABBLE_VALUES[letter] ?? 1}</span>
        </div>
      ))}
    </div>
  );
}
