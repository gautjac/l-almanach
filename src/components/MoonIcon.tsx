// A small, exact SVG moon that draws the lit crescent/gibbous from a phase
// fraction (0 = new, 0.5 = full). The terminator is rendered as a half-ellipse
// whose horizontal radius scales with the phase, which is the correct geometry
// for the projected shadow boundary on a sphere.

interface Props {
  /** 0..1 around the cycle: 0 new, .25 first quarter, .5 full, .75 last quarter */
  fraction: number;
  size?: number;
  className?: string;
}

export function MoonIcon({ fraction, size = 72, className }: Props) {
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;

  // Waxing for fraction < 0.5 (lit on the right in the northern hemisphere).
  const waxing = fraction < 0.5;
  // Illuminated fraction of the disc width via (1 - cos)/2 maps to terminator.
  const illum = (1 - Math.cos(fraction * 2 * Math.PI)) / 2; // 0..1
  // The terminator ellipse horizontal radius: 0 at quarter, ±r at new/full.
  const k = Math.abs(Math.cos(fraction * 2 * Math.PI)); // 0 at quarter, 1 at new/full
  const rx = r * k;

  // Decide which side is lit and whether the lit area is more or less than half.
  const moreThanHalf = illum > 0.5;

  // Build the lit-region path: the right (or left) half-disc, plus the
  // terminator half-ellipse that either adds to or carves from it.
  // We draw the lit silhouette directly.
  const top = cy - r;
  const bot = cy + r;

  // Outer arc half (the limb on the lit side).
  // sweep for right limb (waxing) goes clockwise top→bottom.
  const limbSweep = waxing ? 1 : 0;
  // The terminator ellipse: from top to bottom along the center.
  // When moreThanHalf, the terminator bulges toward the dark side (lit > half).
  const termSweep = waxing
    ? moreThanHalf
      ? 1
      : 0
    : moreThanHalf
      ? 0
      : 1;

  const litPath = [
    `M ${cx} ${top}`,
    `A ${r} ${r} 0 0 ${limbSweep} ${cx} ${bot}`,
    `A ${rx} ${r} 0 0 ${termSweep} ${cx} ${top}`,
    "Z",
  ].join(" ");

  const newMoon = illum < 0.02;
  const fullMoon = illum > 0.98;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="moonlit" cx="38%" cy="34%" r="75%">
          <stop offset="0%" stopColor="rgb(var(--alm-surface))" />
          <stop offset="100%" stopColor="rgb(var(--alm-gild))" />
        </radialGradient>
      </defs>
      {/* dark disc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="rgb(var(--alm-line) / 0.45)"
        stroke="rgb(var(--alm-muted) / 0.5)"
        strokeWidth="1"
      />
      {/* lit region */}
      {fullMoon ? (
        <circle cx={cx} cy={cy} r={r} fill="url(#moonlit)" />
      ) : newMoon ? null : (
        <path d={litPath} fill="url(#moonlit)" />
      )}
      {/* subtle limb */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgb(var(--alm-gild) / 0.5)"
        strokeWidth="0.75"
      />
    </svg>
  );
}
