import { useState, useRef, useEffect, useCallback } from 'react';
import { isValidWord } from '../utils/wordValidation';

export function useGameLoop({ letters, dictionary, gameState, onVictory, onWordValidated, onWordInvalid }) {
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [combo, setCombo] = useState(0);
  const [scoreItems, setScoreItems] = useState([]);

  const stateRef = useRef({ position: 0, velocity: 0, combo: 0 });
  const lastTimestampRef = useRef(null);
  const rafRef = useRef(null);
  const gameStateRef = useRef(gameState);
  // Mots déjà utilisés dans cette partie → rejet des doublons
  const usedWordsRef = useRef(new Set());

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const loop = useCallback((timestamp) => {
    if (gameStateRef.current !== 'playing') return;

    if (lastTimestampRef.current === null) {
      lastTimestampRef.current = timestamp;
    }

    const dt = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;

    let { position: pos, velocity: vel } = stateRef.current;

    // Friction frame-rate-independent
    vel = vel * Math.pow(0.985, dt * 60);

    // Déplacement — scale 3 : ~5% par mot de 3 lettres sans combo
    pos = Math.min(pos + vel * dt * 3, 100);

    stateRef.current = { ...stateRef.current, position: pos, velocity: vel };
    setPosition(pos);
    setVelocity(vel);

    if (pos >= 100) {
      onVictory();
      return;
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [onVictory]);

  useEffect(() => {
    if (gameState === 'playing') {
      lastTimestampRef.current = null;
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [gameState, loop]);

  const submitWord = useCallback((input) => {
    const wordNorm = input.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const { velocity: vel, combo: cmb } = stateRef.current;

    // Vérification : valide ET pas déjà utilisé
    const valid = isValidWord(input, letters, dictionary);
    const alreadyUsed = usedWordsRef.current.has(wordNorm);

    if (valid && !alreadyUsed) {
      usedWordsRef.current.add(wordNorm);

      const wordLen = wordNorm.length;
      // Combo multiplier : +15% par cran (moins agressif que +25%)
      const comboMult = 1 + cmb * 0.15;
      let impulse = wordLen * 0.5;
      impulse *= comboMult;

      // Plafond à 4 pour éviter qu'un long mot avec combo haut finisse la partie seul
      const newVel = Math.min(vel + impulse, 4);
      const newCombo = cmb + 1;

      stateRef.current = { ...stateRef.current, velocity: newVel, combo: newCombo };
      setVelocity(newVel);
      setCombo(newCombo);
      setScoreItems((prev) => [...prev, { word: wordNorm, length: wordLen, comboMult }]);

      onWordValidated(wordNorm);
      return true;
    } else {
      // Mot invalide OU doublon → même pénalité (reset vitesse et combo)
      stateRef.current = { ...stateRef.current, velocity: 0, combo: 0 };
      setVelocity(0);
      setCombo(0);
      onWordInvalid();
      return false;
    }
  }, [letters, dictionary, onWordValidated, onWordInvalid]);

  const resetGame = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTimestampRef.current = null;
    stateRef.current = { position: 0, velocity: 0, combo: 0 };
    usedWordsRef.current = new Set();
    setPosition(0);
    setVelocity(0);
    setCombo(0);
    setScoreItems([]);
  }, []);

  return { position, velocity, combo, scoreItems, submitWord, resetGame };
}
