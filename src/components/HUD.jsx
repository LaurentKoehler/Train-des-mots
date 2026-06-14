export default function HUD({ timeLeft, score, combo }) {
  const timerClass = timeLeft <= 20 ? 'hud-timer hud-timer--danger' : 'hud-timer';

  return (
    <div className="hud">
      <span className={timerClass}>⏱ {timeLeft}s</span>
      <span className="hud-score">Score : {score}</span>
      {combo > 0 && <span className="hud-combo">Combo ×{combo}</span>}
    </div>
  );
}
