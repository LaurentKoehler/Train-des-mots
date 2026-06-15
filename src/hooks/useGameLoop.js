import { useState, useRef, useEffect, useCallback } from 'react';
import { isValidWord } from '../utils/wordValidation';

// Nombre de mots requis dans un jeu "standard" pour que les formules donnent
// un impulse de base de 0.5 par lettre → ~5% par mot de 3 lettres.
// Sert uniquement à calibrer l'échelle.
const BASE_WORDS = 17;

export function useGameLoop({
  letters,
  dictionary,
  gameState,
  onVictory,
  onWordValidated,
  onWordInvalid,
  requiredWords = 17,
}) {
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [combo, setCombo]     = useState(0);
  const [scoreItems, setScoreItems] = useState([]);

  const stateRef        = useRef({ position: 0, velocity: 0, combo: 0 });
  const lastTimestampRef = useRef(null);
  const rafRef          = useRef(null);
  const gameStateRef    = useRef(gameState);
  const usedWordsRef    = useRef(new Set());

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const loop = useCallback((timestamp) => {
    if (gameStateRef.current !== 'playing') return;

    if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;

    const dt = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;

    let { position: pos, velocity: vel } = stateRef.current;

    vel = vel * Math.pow(0.985, dt * 60);          // friction frame-rate-independent
    pos = Math.min(pos + vel * dt * 3, 100);        // scale 3 → 3.33 % par unité de vélo

    stateRef.current = { ...stateRef.current, position: pos, velocity: vel };
    setPosition(pos);
    setVelocity(vel);

    if (pos >= 100) { onVictory(); return; }
    rafRef.current = requestAnimationFrame(loop);
  }, [onVictory]);

  useEffect(() => {
    if (gameState === 'playing') {
      lastTimestampRef.current = null;
      rafRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => { cancelAnimationFrame(rafRef.current); rafRef.current = null; };
  }, [gameState, loop]);

  const submitWord = useCallback((input) => {
    const wordNorm = input.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const { velocity: vel, combo: cmb } = stateRef.current;

    const valid      = isValidWord(input, letters, dictionary);
    const alreadyUsed = usedWordsRef.current.has(wordNorm);

    if (valid && !alreadyUsed) {
      usedWordsRef.current.add(wordNorm);

      const wordLen = wordNorm.length;
      const comboMult = 1 + cmb * 0.15;

      // Impulse scalé selon le nombre de mots requis dans ce tirage.
      // BASE_WORDS/requiredWords = 1 pour un jeu "normal",
      // > 1 si peu de mots dispo (train plus rapide),
      // < 1 si beaucoup de mots (train un peu plus lent, mais cap MAX_REQUIRED protège).
      const impulseScale = BASE_WORDS / Math.max(1, requiredWords);
      const velCap       = Math.min(12, 4 * impulseScale); // plafond monte quand peu de mots

      let impulse = wordLen * 0.5 * impulseScale * comboMult;
      const newVel   = Math.min(vel + impulse, velCap);
      const newCombo = cmb + 1;

      stateRef.current = { ...stateRef.current, velocity: newVel, combo: newCombo };
      setVelocity(newVel);
      setCombo(newCombo);
      setScoreItems((prev) => [...prev, { word: wordNorm, length: wordLen, comboMult }]);

      onWordValidated(wordNorm);
      return true;
    } else {
      stateRef.current = { ...stateRef.current, velocity: 0, combo: 0 };
      setVelocity(0);
      setCombo(0);
      onWordInvalid();
      return false;
    }
  }, [letters, dictionary, onWordValidated, onWordInvalid, requiredWords]);

  const resetGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current    = null;
    lastTimestampRef.current = null;
    stateRef.current  = { position: 0, velocity: 0, combo: 0 };
    usedWordsRef.current = new Set();
    setPosition(0);
    setVelocity(0);
    setCombo(0);
    setScoreItems([]);
  }, []);

  return { position, velocity, combo, scoreItems, submitWord, resetGame };
}
