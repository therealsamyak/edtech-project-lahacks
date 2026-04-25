export function RisoMark({ size = 56 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 56 56" width={size} height={size} className="absolute inset-0">
        <circle cx="28" cy="28" r="26" fill="var(--tomato)" stroke="var(--ink)" strokeWidth="2" />
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="var(--mustard)"
          stroke="var(--ink)"
          strokeWidth="2"
          style={{ mixBlendMode: "multiply" }}
        />
        <text
          x="28"
          y="35"
          textAnchor="middle"
          fontFamily="Fraunces, serif"
          fontSize="22"
          fontWeight="900"
          fontStyle="italic"
          fill="var(--ink)"
        >
          C
        </text>
      </svg>
      <svg
        viewBox="0 0 56 56"
        width={size}
        height={size}
        className="absolute inset-0 animate-spin-slow"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <path id="circle" d="M28,28 m-24,0 a24,24 0 1,1 48,0 a24,24 0 1,1 -48,0" />
        </defs>
        <text fill="var(--ink)" fontFamily="DM Mono, monospace" fontSize="5.6" letterSpacing="2">
          <textPath href="#circle">· COMPLIANCE · BUREAU · MMXXVI · OFFICIAL ·</textPath>
        </text>
      </svg>
    </div>
  )
}
