import '../styles/TrainScene.css';

const VIEWBOX_W = 900;
const VIEWBOX_H = 200;

function Station({ x, isArrival }) {
  return (
    <g transform={`translate(${x}, 80)`}>
      <rect x={isArrival ? -40 : 0} y={60} width={80} height={8} fill="#8b7355" rx={2} />
      <rect x={isArrival ? -30 : 10} y={10} width={60} height={50} fill="#c4a882" rx={2} />
      <polygon
        points={`${isArrival ? -35 : 5},10 ${isArrival ? -5 : 35},-15 ${isArrival ? 35 : 65},10`}
        fill="#8b4513"
      />
      <rect x={isArrival ? -18 : 22} y={25} width={16} height={20} fill="#7ec8e3" rx={2} opacity={0.8} />
      <rect x={isArrival ? 0 : 40} y={25} width={16} height={20} fill="#7ec8e3" rx={2} opacity={0.8} />
      {isArrival && (
        <>
          <line x1={20} y1={10} x2={20} y2={-30} stroke="#555" strokeWidth={2} />
          <rect x={20} y={-30} width={6} height={6} fill="#111" />
          <rect x={26} y={-30} width={6} height={6} fill="#eee" />
          <rect x={20} y={-24} width={6} height={6} fill="#eee" />
          <rect x={26} y={-24} width={6} height={6} fill="#111" />
        </>
      )}
    </g>
  );
}

function Wheel({ cx, cy, r, speed }) {
  return (
    <g>
      {/* Cercle de la roue — pas d'animation (une roue est symétrique, ça ne se voit pas) */}
      <circle cx={cx} cy={cy} r={r} fill="#1a1a2e" stroke="#888" strokeWidth={1.5} />
      {/* Moyeu */}
      <circle cx={cx} cy={cy} r={Math.max(2, r * 0.35)} fill="#888" />
      {/* Rayon : c'est lui qui tourne visuellement */}
      <line
        x1={cx} y1={cy - r + 1}
        x2={cx} y2={cy + r - 1}
        stroke="#555"
        strokeWidth={1.2}
        style={{
          animation: `spin ${speed} linear infinite`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
    </g>
  );
}

export default function TrainScene({ position, velocity }) {
  const START_X = 80;
  const TRAIN_W = 205;
  const END_X = VIEWBOX_W - 80 - TRAIN_W;
  const trainX = START_X + ((END_X - START_X) * position) / 100;

  const wheelSpeed = `${Math.max(0.15, 2 / (velocity + 0.1))}s`;
  const smokeDuration = velocity > 5 ? 0.8 : 2.2;
  const wobbleClass = velocity > 3 ? 'wagon-wobble-fast' : 'wagon-wobble-slow';

  const NUM_SLEEPERS = 28;
  const sleepers = Array.from({ length: NUM_SLEEPERS }, (_, i) => ({
    x: (VIEWBOX_W / (NUM_SLEEPERS + 1)) * (i + 1),
  }));

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      width="100%"
      height="200"
      className="train-scene"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x={0} y={0} width={VIEWBOX_W} height={VIEWBOX_H} fill="#1a1a2e" />

      {/* Traverses */}
      {sleepers.map((s, i) => (
        <rect key={i} x={s.x - 3} y={148} width={6} height={20} fill="#5a4020" rx={1} />
      ))}

      {/* Rails */}
      <line x1={0} y1={150} x2={VIEWBOX_W} y2={150} stroke="#8b6914" strokeWidth={3} />
      <line x1={0} y1={165} x2={VIEWBOX_W} y2={165} stroke="#8b6914" strokeWidth={3} />

      {/* Gares */}
      <Station x={30} isArrival={false} />
      <Station x={VIEWBOX_W - 60} isArrival={true} />

      {/* Train complet */}
      <g
        transform={`translate(${trainX}, 0)`}
        style={{ '--wheel-speed': wheelSpeed }}
        className={wobbleClass}
      >
        {/*
          Wagons :
          - Groupe EXTERNE : positionnement SVG uniquement (transform SVG)
          - Groupe INTERNE (.wagon) : cible de l'animation CSS waggle
          Séparation indispensable pour éviter que l'animation CSS n'écrase
          le transform SVG et propulse les wagons en haut de l'écran.
        */}

        {/* Wagon 2 */}
        <g transform="translate(0, 110)">
          <g className="wagon">
            <rect x={0} y={0} width={55} height={28} fill="#2d5a8e" rx={4} />
            <rect x={8} y={5} width={15} height={14} fill="#7ec8e3" rx={2} opacity={0.7} />
            <rect x={32} y={5} width={15} height={14} fill="#7ec8e3" rx={2} opacity={0.7} />
            <Wheel cx={12} cy={30} r={7} speed={wheelSpeed} />
            <Wheel cx={43} cy={30} r={7} speed={wheelSpeed} />
          </g>
        </g>

        {/* Wagon 1 */}
        <g transform="translate(62, 110)">
          <g className="wagon">
            <rect x={0} y={0} width={55} height={28} fill="#2d5a8e" rx={4} />
            <rect x={8} y={5} width={15} height={14} fill="#7ec8e3" rx={2} opacity={0.7} />
            <rect x={32} y={5} width={15} height={14} fill="#7ec8e3" rx={2} opacity={0.7} />
            <Wheel cx={12} cy={30} r={7} speed={wheelSpeed} />
            <Wheel cx={43} cy={30} r={7} speed={wheelSpeed} />
          </g>
        </g>

        {/* Locomotive */}
        <g transform="translate(124, 0)">
          <rect x={0} y={100} width={75} height={40} fill="#c0392b" rx={5} />
          <rect x={40} y={85} width={35} height={20} fill="#922b21" rx={3} />
          <rect x={46} y={88} width={12} height={12} fill="#7ec8e3" rx={2} opacity={0.8} />
          {/* Cheminée */}
          <rect x={10} y={82} width={12} height={20} fill="#333" rx={2} />
          <rect x={8} y={79} width={16} height={5} fill="#555" rx={2} />
          {/* Fumée */}
          {[
            { cx: 16, cy: 75, r: 5, delay: 0 },
            { cx: 13, cy: 62, r: 7, delay: smokeDuration / 3 },
            { cx: 18, cy: 48, r: 9, delay: (smokeDuration * 2) / 3 },
          ].map((s, i) => (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="rgba(180,180,180,0.6)"
              style={{
                animation: `smokeRise ${smokeDuration}s ease-out ${s.delay}s infinite`,
                transformOrigin: `${s.cx}px ${s.cy}px`,
              }}
            />
          ))}
          {/* Roues locomotive */}
          {[12, 35, 58].map((cx) => (
            <Wheel key={cx} cx={cx} cy={143} r={9} speed={wheelSpeed} />
          ))}
          {/* Phare */}
          <circle cx={74} cy={112} r={5} fill="#ffe866" opacity={0.9} />
          <rect x={72} y={128} width={5} height={6} fill="#555" rx={1} />
        </g>
      </g>
    </svg>
  );
}
