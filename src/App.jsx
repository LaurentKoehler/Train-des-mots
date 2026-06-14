import { useState, useEffect, useCallback, useRef } from 'react';
import { useDictionary } from './hooks/useDictionary';
import { useGameLoop } from './hooks/useGameLoop';
import { generateLetters } from './utils/letters';
import { findAllWords } from './utils/wordValidation';
import TrainScene from './components/TrainScene';
import LetterTiles from './components/LetterTiles';
import WordInput from './components/WordInput';
import WordGrid from './components/WordGrid';
import HUD from './components/HUD';
import EndScreen from './components/EndScreen';
import './styles/App.css';
import './styles/Game.css';

const GAME_DURATION = 90;

function computeScore(scoreItems, timeLeft, victory) {
  const wordScore = scoreItems.reduce(
    (sum, { length, comboMult }) => sum + Math.round(length * length * comboMult),
    0
  );
  const timeBonus = victory ? timeLeft * 15 : 0;
  return wordScore + timeBonus;
}

export default function App() {
  const { isLoading, dictionary } = useDictionary();

  const [letters, setLetters] = useState(() => generateLetters());
  // 'waiting' → 'playing' → 'victory' | 'defeat'
  const [gameState, setGameState] = useState('waiting');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  const [targetWords, setTargetWords] = useState([]);
  // foundWords : Set de TOUS les mots trouvés (cibles + bonus)
  const [foundWords, setFoundWords] = useState(new Set());

  const timerRef = useRef(null);
  const gameStateRef = useRef(gameState);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Recalcule les mots cibles au chargement du dico et à chaque nouveau tirage
  useEffect(() => {
    if (isLoading) return;
    const targets = findAllWords(letters, dictionary);
    setTargetWords(targets);
    setFoundWords(new Set());
  }, [letters, dictionary, isLoading]);

  const handleVictory = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    setGameState('victory');
  }, []);

  const handleWordValidated = useCallback((word) => {
    setFoundWords((prev) => {
      const next = new Set(prev);
      next.add(word);
      return next;
    });
  }, []);

  const handleWordInvalid = useCallback(() => {}, []);

  const { position, velocity, combo, scoreItems, submitWord, resetGame } = useGameLoop({
    letters,
    dictionary,
    gameState,
    onVictory: handleVictory,
    onWordValidated: handleWordValidated,
    onWordInvalid: handleWordInvalid,
  });

  // Timer : ne tourne qu'en 'playing'
  useEffect(() => {
    if (gameState !== 'playing' || isLoading) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState('defeat');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, isLoading]);

  const currentScore = computeScore(scoreItems, timeLeft, false);

  const handleReplay = useCallback(() => {
    clearInterval(timerRef.current);
    resetGame();
    setLetters(generateLetters());
    setTimeLeft(GAME_DURATION);
    // Retour à l'écran de départ pour voir les nouvelles lettres avant de commencer
    setGameState('waiting');
  }, [resetGame]);

  const handleStart = useCallback(() => {
    setGameState('playing');
  }, []);

  /* ---- Écran de chargement ---- */
  if (isLoading) {
    return (
      <div className="app-wrapper">
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Chargement du dictionnaire…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>🚂 Train de Mots</h1>
        <p>Forme des mots avec les lettres disponibles pour faire avancer le train !</p>
      </header>

      <HUD timeLeft={timeLeft} score={currentScore} combo={combo} />

      <div className="train-section">
        <TrainScene position={position} velocity={velocity} />
      </div>

      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${position}%` }} />
      </div>

      <div className="game-section">
        <div className="section-label">Tes lettres</div>
        <LetterTiles letters={letters} />

        {/* Bouton Go (état waiting) ou saisie (état playing/fin) */}
        {gameState === 'waiting' ? (
          <button className="go-btn" onClick={handleStart}>
            🚂 Lancer le train !
          </button>
        ) : (
          <>
            <div className="section-label">Ton mot</div>
            <WordInput onSubmit={submitWord} disabled={gameState !== 'playing'} />
          </>
        )}

        <div className="section-label">Mots possibles</div>
        <WordGrid targetWords={targetWords} foundWords={foundWords} />
      </div>

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
