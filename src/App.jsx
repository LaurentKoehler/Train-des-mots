/**
 * App.jsx — Composant racine, orchestrateur du jeu.
 *
 * Responsabilités :
 *   - Charger le dictionnaire (via useDictionary)
 *   - Gérer l'état global : gameState, timer, lettres, mots trouvés
 *   - Calculer les paramètres physiques dynamiques (physicsScale, requiredWords)
 *   - Vérifier les conditions de victoire (train à 100% OU 75% des mots trouvés)
 *   - Distribuer les données aux composants enfants
 *   - Mettre en page les 3 colonnes (sidebar gauche | jeu | sidebar droite)
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDictionary }          from './hooks/useDictionary';
import { useGameLoop }            from './hooks/useGameLoop';
import { generateLetters }        from './utils/letters';
import { findAllWords }           from './utils/wordValidation';
import TrainScene                 from './components/TrainScene';
import LetterTiles                from './components/LetterTiles';
import WordInput                  from './components/WordInput';
import WordGrid                   from './components/WordGrid';
import HUD                        from './components/HUD';
import EndScreen                  from './components/EndScreen';
import './styles/App.css';
import './styles/Game.css';

// Durée d'une partie en secondes
const DUREE_PARTIE = 90;

// ─── Fonctions utilitaires pures (hors composant, pas de re-calcul) ────────

/**
 * Calcule le score total à partir des mots trouvés.
 * Formule : Σ(longueur² × comboMult) + tempsRestant × 15 (si victoire)
 */
function calculerScore(scoreItems, tempsRestant, victoire) {
  const scoreMotsn = scoreItems.reduce(
    (total, { length, comboMult }) => total + Math.round(length * length * comboMult),
    0
  );
  const bonusTemps = victoire ? tempsRestant * 15 : 0;
  return scoreMotsn + bonusTemps;
}

/**
 * Calcule le nombre de mots "requis" pour calibrer la physique.
 * Plafonné à 15 : au-delà de 15 mots disponibles, la difficulté ne change plus.
 * En dessous, la physique s'adapte pour que la partie reste jouable.
 */
function calcRequiredWords(allWords) {
  return Math.max(3, Math.min(allWords.length, 15));
}

/**
 * Seuil de victoire par pourcentage.
 * Le joueur gagne en trouvant min(15, 75% des mots disponibles).
 * Cela garantit qu'une partie avec peu de mots reste jouable.
 */
function calcWinThreshold(allWords) {
  return Math.min(15, Math.max(3, Math.ceil(allWords.length * 0.75)));
}

// ─── Composant principal ────────────────────────────────────────────────────

export default function App() {
  // Dictionnaire : chargé une fois au démarrage de l'app
  const { isLoading, dictionary } = useDictionary();

  // ── États du jeu ──
  const [letters,      setLetters]      = useState(() => generateLetters());
  const [gameState,    setGameState]    = useState('waiting');  // waiting | playing | victory | defeat
  const [timeLeft,     setTimeLeft]     = useState(DUREE_PARTIE);
  const [targetWords,  setTargetWords]  = useState([]);  // tous les mots formables avec le tirage
  const [foundWords,   setFoundWords]   = useState(new Set()); // mots déjà trouvés par le joueur
  const [requiredWords, setRequiredWords] = useState(15);
  const [winThreshold,  setWinThreshold]  = useState(15);

  // Ref pour accéder à gameState depuis les callbacks sans déclencher de re-rendu
  const gameStateRef = useRef(gameState);
  const timerRef     = useRef(null);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // ── Recalcul des mots possibles à chaque nouveau tirage ──
  // findAllWords parcourt ~336k mots (~30-50ms) → useEffect pour ne pas bloquer le rendu
  useEffect(() => {
    if (isLoading) return;
    const mots = findAllWords(letters, dictionary);
    setTargetWords(mots);
    setRequiredWords(calcRequiredWords(mots));
    setWinThreshold(calcWinThreshold(mots));
    setFoundWords(new Set()); // repart de zéro à chaque nouveau tirage
  }, [letters, dictionary, isLoading]);

  // ── Condition de victoire par pourcentage ──
  // Vérifié après chaque nouveau mot trouvé
  useEffect(() => {
    if (gameState !== 'playing' || targetWords.length === 0) return;
    if (foundWords.size >= winThreshold) {
      setGameState('victory');
    }
  }, [foundWords, winThreshold, targetWords.length, gameState]);

  // ── Callbacks transmis au moteur physique ──
  const handleVictory = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    setGameState('victory');
  }, []);

  const handleWordValidated = useCallback((mot) => {
    // Ajoute le mot au Set des mots trouvés (immutable → nouveau Set)
    setFoundWords(prev => {
      const next = new Set(prev);
      next.add(mot);
      return next;
    });
  }, []);

  const handleWordInvalid = useCallback(() => {
    // Le feedback visuel (shake) est géré dans WordInput.
    // Ici on n'a rien à faire côté App.
  }, []);

  // ── Moteur physique ──
  const {
    position, velocity, combo, scoreItems,
    submitWord, resetGame,
  } = useGameLoop({
    letters,
    dictionary,
    gameState,
    requiredWords,
    onVictory:       handleVictory,
    onWordValidated: handleWordValidated,
    onWordInvalid:   handleWordInvalid,
  });

  // ── Timer : ne tourne que pendant 'playing' ──
  useEffect(() => {
    if (gameState !== 'playing' || isLoading) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState('defeat');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current); // nettoyage si l'état change
  }, [gameState, isLoading]);

  // ── Handlers ──
  const handleStart = useCallback(() => {
    setGameState('playing');
  }, []);

  const handleReplay = useCallback(() => {
    clearInterval(timerRef.current);
    resetGame();
    setLetters(generateLetters()); // nouveau tirage → déclenche le recalcul des mots
    setTimeLeft(DUREE_PARTIE);
    setGameState('waiting'); // retour à l'écran de préparation
  }, [resetGame]);

  // Score affiché en temps réel pendant la partie (sans bonus temps)
  const scoreEnCours = calculerScore(scoreItems, timeLeft, false);

  // ── Écran de chargement ──
  if (isLoading) {
    return (
      <div className="page-layout">
        <aside className="sidebar sidebar--left" />
        <main className="game-center">
          <div className="loading-screen">
            <div className="loading-spinner" />
            <p>Chargement du dictionnaire…</p>
          </div>
        </main>
        <aside className="sidebar sidebar--right" />
      </div>
    );
  }

  return (
    <div className="page-layout">

      {/* ── Sidebar gauche : mots courts (2-4 lettres) ────────────────── */}
      <aside className="sidebar sidebar--left">
        <p className="sidebar-label">mots courts</p>
        <WordGrid
          targetWords={targetWords}
          foundWords={foundWords}
          side="left"
        />
      </aside>

      {/* ── Zone centrale : interface de jeu ──────────────────────────── */}
      <main className="game-center">
        <header className="app-header">
          <h1>🚂 Train de Mots</h1>
          <p>Forme des mots avec les lettres disponibles pour faire avancer le train !</p>
        </header>

        {/* Barre d'état : timer, score, combo */}
        <HUD timeLeft={timeLeft} score={scoreEnCours} combo={combo} />

        {/* Scène SVG animée */}
        <div className="train-section">
          <TrainScene position={position} velocity={velocity} />
        </div>

        {/* Barre de progression (reflet de la position du train) */}
        <div className="progress-bar-wrapper">
          <div className="progress-bar-fill" style={{ width: `${position}%` }} />
        </div>

        {/* Zone de saisie */}
        <div className="game-section">
          <div className="section-label">Tes lettres</div>
          <LetterTiles letters={letters} />

          {/* Avant le démarrage : bouton Go. Pendant/après : champ de saisie */}
          {gameState === 'waiting' ? (
            <button className="go-btn" onClick={handleStart}>
              🚂 Lancer le train !
            </button>
          ) : (
            <>
              <div className="section-label">Ton mot</div>
              <WordInput
                onSubmit={submitWord}
                disabled={gameState !== 'playing'}
              />
            </>
          )}
        </div>
      </main>

      {/* ── Sidebar droite : mots longs (5+ lettres) ──────────────────── */}
      <aside className="sidebar sidebar--right">
        <p className="sidebar-label">mots longs</p>
        <WordGrid
          targetWords={targetWords}
          foundWords={foundWords}
          side="right"
        />
      </aside>

      {/* ── Écran de fin (overlay plein écran) ────────────────────────── */}
      {(gameState === 'victory' || gameState === 'defeat') && (
        <EndScreen
          victory={gameState === 'victory'}
          scoreItems={scoreItems}
          timeLeft={timeLeft}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
}
