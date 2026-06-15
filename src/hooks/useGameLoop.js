/**
 * hooks/useGameLoop.js — Moteur physique du train.
 *
 * Modèle physique simplifié :
 *   - Le train a une position (0-100 %) et une vélocité (≥ 0).
 *   - Chaque frame : la vélocité est réduite par friction, puis appliquée à la position.
 *   - Un mot valide ajoute une impulsion à la vélocité.
 *   - Un mot invalide ou doublon remet vélocité et combo à 0 (pénalité).
 *
 * La formule de friction est INDÉPENDANTE DU FRAMERATE :
 *   velocity *= 0.985 ^ (dt * 60)
 * Ainsi un joueur à 30 fps et un joueur à 144 fps ont exactement la même expérience.
 *
 * L'echelle `physicsScale` est calculée dynamiquement par App.jsx selon le nombre
 * de mots disponibles : peu de mots → grande échelle → train avance plus vite.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { isValidWord } from '../utils/wordValidation';

/**
 * @param {Object}   params
 * @param {string[]} params.letters       - Tirage courant (8 lettres majuscules)
 * @param {Set}      params.dictionary    - Dictionnaire normalisé
 * @param {string}   params.gameState     - 'waiting' | 'playing' | 'victory' | 'defeat'
 * @param {number}   params.physicsScale  - Multiplicateur de distance (calculé par App)
 * @param {number}   params.requiredWords - Nb de mots "cibles" pour calibrer l'impulsion
 * @param {Function} params.onVictory         - Callback quand position atteint 100
 * @param {Function} params.onWordValidated   - Callback(mot) quand un mot est accepté
 * @param {Function} params.onWordInvalid     - Callback quand un mot est refusé
 */
export function useGameLoop({
  letters,
  dictionary,
  gameState,
  physicsScale  = 3,   // valeur par défaut si App ne transmet rien
  requiredWords = 15,  // calibrage de l'impulsion
  onVictory,
  onWordValidated,
  onWordInvalid,
}) {
  // --- États React exposés aux composants ---
  const [position,   setPosition]   = useState(0);
  const [velocity,   setVelocity]   = useState(0);
  const [combo,      setCombo]      = useState(0);
  const [scoreItems, setScoreItems] = useState([]); // [{word, length, comboMult}]

  // --- Refs internes (pas de re-rendu, accessibles dans la boucle RAF) ---
  // On stocke les valeurs "chaudes" dans un ref pour que la boucle RAF
  // puisse toujours lire la dernière valeur sans dépendance de closure.
  const stateRef    = useRef({ position: 0, velocity: 0, combo: 0 });
  const rafRef      = useRef(null);          // id de requestAnimationFrame
  const lastTsRef   = useRef(null);          // timestamp de la frame précédente
  const gameStateRef = useRef(gameState);    // gameState accessible sans dépendance RAF
  const usedWordsRef = useRef(new Set());    // mots déjà utilisés cette partie → anti-doublon

  // Synchronise gameStateRef à chaque changement de gameState
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // --- Boucle d'animation (requestAnimationFrame) ---
  const loop = useCallback((timestamp) => {
    // On arrête immédiatement si la partie n'est plus en cours
    if (gameStateRef.current !== 'playing') return;

    // Calcul du delta temps (secondes) depuis la frame précédente
    if (lastTsRef.current === null) lastTsRef.current = timestamp;
    const dt = (timestamp - lastTsRef.current) / 1000;
    lastTsRef.current = timestamp;

    let { position: pos, velocity: vel } = stateRef.current;

    // Friction : décélération exponentielle, indépendante du framerate
    // 0.985^(dt*60) : à 60fps, dt=1/60, donc 0.985^1 = -1.5% par frame
    vel = vel * Math.pow(0.985, dt * 60);

    // Déplacement : physicsScale ajuste la "longueur" de la voie
    pos = Math.min(pos + vel * dt * physicsScale, 100);

    // Mise à jour du ref et des états React (pour le rendu SVG)
    stateRef.current = { ...stateRef.current, position: pos, velocity: vel };
    setPosition(pos);
    setVelocity(vel);

    // Condition de victoire : train arrivé à la gare
    if (pos >= 100) {
      onVictory();
      return; // on arrête la boucle
    }

    // Prochaine frame
    rafRef.current = requestAnimationFrame(loop);
  }, [onVictory, physicsScale]); // physicsScale peut changer entre les parties

  // --- Démarrage / arrêt de la boucle selon l'état du jeu ---
  useEffect(() => {
    if (gameState === 'playing') {
      lastTsRef.current = null; // reset du timer pour éviter un grand dt au démarrage
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
    // Nettoyage si le composant est démonté
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState, loop]);

  // --- Soumission d'un mot par le joueur ---
  const submitWord = useCallback((saisie) => {
    // Normalisation identique au dictionnaire
    const mot = saisie.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const estValide  = isValidWord(saisie, letters, dictionary);
    const estDoublon = usedWordsRef.current.has(mot);

    const { velocity: vel, combo: cmb } = stateRef.current;

    if (estValide && !estDoublon) {
      // === MOT ACCEPTÉ ===
      usedWordsRef.current.add(mot);

      const longueur  = mot.length;
      const BASE_MOTS = 17; // calibrage : nombre de mots dans une partie "standard"

      // Impulsion proportionnelle à la longueur + multiplicateur de combo
      // physicsScale inverse-proportionnel à requiredWords :
      //   peu de mots → grande impulsion → train avance vite
      const impulseScale = BASE_MOTS / requiredWords;
      const comboMult    = 1 + cmb * 0.15; // +15% par combo cran
      let   impulsion    = longueur * 0.5 * impulseScale * comboMult;

      // Plafond de vélocité pour éviter qu'un seul mot finisse la partie
      const newVel   = Math.min(vel + impulsion, 4);
      const newCombo = cmb + 1;

      stateRef.current = { ...stateRef.current, velocity: newVel, combo: newCombo };
      setVelocity(newVel);
      setCombo(newCombo);
      setScoreItems(prev => [...prev, { word: mot, length: longueur, comboMult }]);

      onWordValidated(mot);
      return true;

    } else {
      // === MOT REFUSÉ (invalide ou doublon) ===
      // Pénalité : remise à zéro de la vélocité et du combo
      stateRef.current = { ...stateRef.current, velocity: 0, combo: 0 };
      setVelocity(0);
      setCombo(0);
      onWordInvalid();
      return false;
    }
  }, [letters, dictionary, requiredWords, onWordValidated, onWordInvalid]);

  // --- Reset complet pour "Rejouer" ---
  const resetGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastTsRef.current   = null;
    stateRef.current    = { position: 0, velocity: 0, combo: 0 };
    usedWordsRef.current = new Set(); // vide la liste des mots déjà utilisés
    setPosition(0);
    setVelocity(0);
    setCombo(0);
    setScoreItems([]);
  }, []);

  return { position, velocity, combo, scoreItems, submitWord, resetGame };
}
