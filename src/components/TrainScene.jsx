/**
 * components/TrainScene.jsx — Scène SVG du train.
 *
 * Affiche :
 *   - Les rails (deux lignes + traverses)
 *   - La gare de départ (gauche) et la gare d'arrivée (droite, drapeau à damier)
 *   - Le train : [Wagon 2][Wagon 1][Locomotive], le tout qui avance de gauche à droite
 *
 * La position (0-100) est convertie en coordonnée X dans le viewBox 900×200.
 *
 * LOCOMOTIVE : orientée correctement pour une loco à vapeur allant vers la droite :
 *   - Cabine du conducteur à GAUCHE (côté wagons = arrière)
 *   - Chaudière + cheminée à DROITE (côté gare d'arrivée = avant)
 *   - Phare à l'extrême droite (avant)
 *
 * ASTUCE CSS/SVG — animation de balancement :
 *   Les wagons utilisent DEUX groupes imbriqués :
 *     <g transform="translate(…)">          ← positionnement SVG (attribut)
 *       <g className="wagon">               ← cible de l'animation CSS
 *   Cela évite un bug où l'animation CSS écrase le transform SVG et
 *   propulse les wagons en haut de l'écran (comportement de certains navigateurs).
 */
import '../styles/TrainScene.css';

// Dimensions du viewBox SVG
const VW = 900;
const VH = 200;

// ─── Composant Gare ──────────────────────────────────────────────────────────

/**
 * Dessine une gare en SVG.
 * @param {number}  x          - Position X de la gare dans le viewBox
 * @param {boolean} isArrival  - true = gare d'arrivée (avec drapeau à damier)
 */
function Station({ x, isArrival }) {
  return (
    <g transform={`translate(${x}, 80)`}>
      {/* Quai horizontal */}
      <rect x={isArrival ? -40 : 0} y={60} width={80} height={8} fill="#8b7355" rx={2} />
      {/* Corps du bâtiment */}
      <rect x={isArrival ? -30 : 10} y={10} width={60} height={50} fill="#c4a882" rx={2} />
      {/* Toit triangulaire */}
      <polygon
        points={`${isArrival ? -35 : 5},10 ${isArrival ? -5 : 35},-15 ${isArrival ? 35 : 65},10`}
        fill="#8b4513"
      />
      {/* Fenêtres */}
      <rect x={isArrival ? -18 : 22} y={25} width={16} height={20} fill="#7ec8e3" rx={2} opacity={0.8} />
      <rect x={isArrival ? 0  : 40} y={25} width={16} height={20} fill="#7ec8e3" rx={2} opacity={0.8} />
      {/* Drapeau à damier uniquement pour la gare d'arrivée */}
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

// ─── Composant Roue ──────────────────────────────────────────────────────────

/**
 * Dessine une roue avec un rayon animé en rotation.
 * La rotation est appliquée UNIQUEMENT sur le rayon (ligne) et non sur le cercle,
 * car un cercle qui tourne sur lui-même est invisible → pas de bug de transform-origin.
 *
 * @param {number} cx     - Centre X (dans le système de coordonnées parent)
 * @param {number} cy     - Centre Y
 * @param {number} r      - Rayon
 * @param {string} speed  - Durée CSS de l'animation (ex: "0.4s")
 */
function Wheel({ cx, cy, r, speed }) {
  return (
    <g>
      {/* Jante — pas d'animation (symétrie = invisible) */}
      <circle cx={cx} cy={cy} r={r}
        fill="#1a1a2e" stroke="#888" strokeWidth={1.5} />
      {/* Moyeu central */}
      <circle cx={cx} cy={cy} r={Math.max(2, r * 0.35)} fill="#888" />
      {/* Rayon : tourne autour du centre de la roue */}
      <line
        x1={cx} y1={cy - r + 1}
        x2={cx} y2={cy + r - 1}
        stroke="#555" strokeWidth={1.2}
        style={{
          animation:       `spin ${speed} linear infinite`,
          transformOrigin: `${cx}px ${cy}px`,  // pivot = centre de la roue
        }}
      />
    </g>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function TrainScene({ position, velocity }) {
  // Calcul de la position X du train dans le viewBox
  const DEBUT_X    = 80;                          // X de la gare de départ
  const LARGEUR_TRAIN = 205;                      // largeur totale [wagon2+wagon1+loco]
  const FIN_X      = VW - 80 - LARGEUR_TRAIN;    // X max pour que la loco s'arrête à la gare
  const trainX     = DEBUT_X + ((FIN_X - DEBUT_X) * position) / 100;

  // Vitesse de rotation des roues : plus le train est rapide, plus elles tournent vite
  const wheelSpeed = `${Math.max(0.15, 2 / (velocity + 0.1))}s`;

  // Durée du cycle de fumée : rapide si le train file, lente s'il ralentit
  const smokeDuration = velocity > 5 ? 0.8 : 2.2;

  // Classe d'oscillation des wagons selon la vitesse
  const wobbleClass = velocity > 3 ? 'wagon-wobble-fast' : 'wagon-wobble-slow';

  // Traverses de rails régulièrement espacées
  const traverses = Array.from({ length: 28 }, (_, i) => ({
    x: (VW / 29) * (i + 1),
  }));

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      height="200"
      className="train-scene"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Fond anthracite */}
      <rect x={0} y={0} width={VW} height={VH} fill="#1a1a2e" />

      {/* Traverses (dessous des rails) */}
      {traverses.map((t, i) => (
        <rect key={i} x={t.x - 3} y={148} width={6} height={20} fill="#5a4020" rx={1} />
      ))}

      {/* Rails (deux lignes parallèles) */}
      <line x1={0} y1={150} x2={VW} y2={150} stroke="#8b6914" strokeWidth={3} />
      <line x1={0} y1={165} x2={VW} y2={165} stroke="#8b6914" strokeWidth={3} />

      {/* Gare de départ (gauche) et d'arrivée (droite, drapeau à damier) */}
      <Station x={30}        isArrival={false} />
      <Station x={VW - 60}  isArrival={true}  />

      {/* ── Train complet ─────────────────────────────────────────────── */}
      <g
        transform={`translate(${trainX}, 0)`}
        style={{ '--wheel-speed': wheelSpeed }}
        className={wobbleClass}
      >
        {/*
          Chaque wagon utilise deux groupes imbriqués :
            - Groupe EXTERNE : transform SVG pour le positionnement (x, y)
            - Groupe INTERNE .wagon : cible de l'animation CSS de balancement
          Cette séparation évite que l'animation CSS n'écrase le transform SVG.
        */}

        {/* ── Wagon 2 (le plus à gauche du train) ── */}
        <g transform="translate(0, 110)">
          <g className="wagon">
            <rect x={0} y={0} width={55} height={28} fill="#2d5a8e" rx={4} />
            <rect x={8} y={5} width={15} height={14} fill="#7ec8e3" rx={2} opacity={0.7} />
            <rect x={32} y={5} width={15} height={14} fill="#7ec8e3" rx={2} opacity={0.7} />
            <Wheel cx={12} cy={30} r={7} speed={wheelSpeed} />
            <Wheel cx={43} cy={30} r={7} speed={wheelSpeed} />
          </g>
        </g>

        {/* ── Wagon 1 ── */}
        <g transform="translate(62, 110)">
          <g className="wagon">
            <rect x={0} y={0} width={55} height={28} fill="#2d5a8e" rx={4} />
            <rect x={8} y={5} width={15} height={14} fill="#7ec8e3" rx={2} opacity={0.7} />
            <rect x={32} y={5} width={15} height={14} fill="#7ec8e3" rx={2} opacity={0.7} />
            <Wheel cx={12} cy={30} r={7} speed={wheelSpeed} />
            <Wheel cx={43} cy={30} r={7} speed={wheelSpeed} />
          </g>
        </g>

        {/* ── Locomotive (à droite = avant du train) ── */}
        {/*
          Pour une loco vapeur allant vers la DROITE (→) :
            GAUCHE du SVG (x ≈ 0-35) = ARRIÈRE = Cabine du conducteur
            DROITE du SVG (x ≈ 55-75) = AVANT  = Cheminée + Phare
        */}
        <g transform="translate(124, 0)">
          {/* Corps de la chaudière (toute la largeur) */}
          <rect x={0} y={100} width={75} height={40} fill="#c0392b" rx={5} />

          {/* ── ARRIÈRE (gauche) : cabine du conducteur ── */}
          <rect x={0} y={85} width={32} height={20} fill="#922b21" rx={3} />
          {/* Fenêtre de la cabine */}
          <rect x={4} y={88} width={12} height={12} fill="#7ec8e3" rx={2} opacity={0.8} />
          <rect x={18} y={88} width={10} height={12} fill="#7ec8e3" rx={2} opacity={0.8} />

          {/* ── AVANT (droite) : cheminée ── */}
          {/* Fût de la cheminée */}
          <rect x={54} y={82} width={12} height={20} fill="#333" rx={2} />
          {/* Évasement en haut de la cheminée */}
          <rect x={52} y={79} width={16} height={5} fill="#555" rx={2} />

          {/* ── Fumée (sort de la cheminée, x≈60) ── */}
          {[
            { cx: 60, cy: 75, r: 5,  delay: 0 },
            { cx: 57, cy: 62, r: 7,  delay: smokeDuration / 3 },
            { cx: 63, cy: 48, r: 9,  delay: (smokeDuration * 2) / 3 },
          ].map((s, i) => (
            <circle
              key={i}
              cx={s.cx} cy={s.cy} r={s.r}
              fill="rgba(180,180,180,0.6)"
              style={{
                animation:       `smokeRise ${smokeDuration}s ease-out ${s.delay}s infinite`,
                transformOrigin: `${s.cx}px ${s.cy}px`,
              }}
            />
          ))}

          {/* ── Phare (extrême droite = avant de la loco) ── */}
          <circle cx={74} cy={112} r={5} fill="#ffe866" opacity={0.9} />

          {/* Tampon avant */}
          <rect x={72} y={128} width={5} height={6} fill="#555" rx={1} />

          {/* ── 3 grandes roues motrices ── */}
          {[12, 35, 58].map(cx => (
            <Wheel key={cx} cx={cx} cy={143} r={9} speed={wheelSpeed} />
          ))}
        </g>
      </g>
    </svg>
  );
}
