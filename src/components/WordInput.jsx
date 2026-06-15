/**
 * components/WordInput.jsx — Champ de saisie du mot + bouton "Valider".
 *
 * Comportement :
 *   - Appui sur Entrée OU clic sur "Valider" → soumet le mot
 *   - Succès : flash vert sur la bordure pendant 600 ms, puis le champ se vide
 *   - Échec  : animation shake + bordure rouge pendant 800 ms, puis le champ se vide
 *   - Le champ retrouve le focus automatiquement après chaque soumission
 *   - Désactivé pendant les états 'waiting', 'victory', 'defeat'
 *
 * La prop `onSubmit` renvoie true (mot accepté) ou false (rejeté).
 */
import { useState, useRef, useEffect } from 'react';

/**
 * @param {Function} onSubmit  - Callback qui reçoit la saisie et retourne boolean
 * @param {boolean}  disabled  - true = champ verrouillé (hors phase de jeu)
 */
export default function WordInput({ onSubmit, disabled }) {
  const [valeur, setValeur]   = useState('');
  const [statut, setStatut]   = useState(null);  // null | 'success' | 'error'
  const inputRef = useRef(null);

  // Focus automatique au montage et quand le champ se déverrouille
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function soumettre() {
    if (!valeur.trim() || disabled) return;

    const accepte = onSubmit(valeur);

    if (accepte) {
      // Feedback positif : flash vert
      setStatut('success');
      setTimeout(() => {
        setStatut(null);
        inputRef.current?.focus();
      }, 600);
    } else {
      // Feedback négatif : shake rouge
      setStatut('error');
      setTimeout(() => {
        setStatut(null);
        inputRef.current?.focus();
      }, 800);
    }

    setValeur(''); // vide le champ immédiatement dans tous les cas
  }

  return (
    <div className="word-input-container">
      <input
        ref={inputRef}
        type="text"
        value={valeur}
        onChange={e => setValeur(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && soumettre()}
        className={`word-input${statut ? ` word-input--${statut}` : ''}`}
        placeholder="Tape un mot…"
        disabled={disabled}
        autoComplete="off"
        spellCheck="false"
      />
      <button
        onClick={soumettre}
        className="validate-btn"
        disabled={disabled || !valeur.trim()}
      >
        Valider
      </button>
    </div>
  );
}
