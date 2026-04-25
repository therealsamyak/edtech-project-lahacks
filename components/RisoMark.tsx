"use client"

export function RisoMark({ size = 56 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 56 56" width={size} height={size} className="absolute inset-0">
        <circle
          cx="28"
          cy="28"
          r="26"
          fill="var(--tomato, #e8634a)"
          stroke="var(--ink, #15181c)"
          strokeWidth="2"
        />
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="var(--mustard, #e5a83b)"
          stroke="var(--ink, #15181c)"
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
          fill="var(--ink, #15181c)"
        >
          C
        </text>
      </svg>
      <svg
        viewBox="0 0 56 56"
        width={size}
        height={size}
        className="absolute inset-0"
        style={{
          pointerEvents: "none",
          animation: "riso-spin 20s linear infinite",
        }}
      >
        <defs>
          <path id="riso-circle" d="M28,28 m-24,0 a24,24 0 1,1 48,0 a24,24 0 1,1 -48,0" />
        </defs>
        <text
          fill="var(--ink, #15181c)"
          fontFamily="DM Mono, monospace"
          fontSize="5.6"
          letterSpacing="2"
        >
          <textPath href="#riso-circle">· COMPLIANCE · BUREAU · MMXXVI · OFFICIAL ·</textPath>
        </text>
      </svg>
      <style>{`@keyframes riso-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
