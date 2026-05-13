export function AgencyDiagram() {
  return (
    <div className="relative w-full select-none">
      {/* FIG. 002 label */}
      <span
        className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.22em] text-text-dim uppercase"
        aria-hidden
      >
        FIG. 002
      </span>

      <svg
        viewBox="0 0 440 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="w-full h-auto"
      >
        {/* ─── Node: Agência ─── */}
        <rect x="20" y="110" width="100" height="80" rx="12"
          fill="#E4DFD4" stroke="rgba(25,25,24,0.12)" strokeWidth="1"
        />
        <text x="70" y="147" textAnchor="middle"
          fill="rgba(25,25,24,0.4)" fontSize="9" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em">
          VOCÊ
        </text>
        <text x="70" y="164" textAnchor="middle"
          fill="rgba(25,25,24,0.75)" fontSize="12" fontFamily="system-ui, sans-serif" fontWeight="600">
          Agência
        </text>

        {/* Arrow 1 */}
        <line x1="122" y1="150" x2="158" y2="150"
          stroke="rgba(25,25,24,0.2)" strokeWidth="1.5" strokeDasharray="3 3"/>
        <polygon points="158,146 164,150 158,154"
          fill="rgba(25,25,24,0.25)" />
        <text x="143" y="143" textAnchor="middle"
          fill="rgba(25,25,24,0.35)" fontSize="8" fontFamily="'JetBrains Mono', monospace">
          brief
        </text>

        {/* ─── Node: Notkode (center, highlighted) ─── */}
        <rect x="166" y="95" width="108" height="110" rx="14"
          fill="#3B82F6" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5"
        />
        {/* Subtle inner ring */}
        <rect x="172" y="101" width="96" height="98" rx="11"
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"
          strokeDasharray="3 4"
        />
        <text x="220" y="141" textAnchor="middle"
          fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em">
          TECH PARTNER
        </text>
        <text x="220" y="162" textAnchor="middle"
          fill="white" fontSize="14" fontFamily="system-ui, sans-serif" fontWeight="700">
          Notkode
        </text>
        <text x="220" y="179" textAnchor="middle"
          fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="'JetBrains Mono', monospace">
          white-label
        </text>

        {/* Arrow 2 */}
        <line x1="276" y1="150" x2="312" y2="150"
          stroke="rgba(25,25,24,0.2)" strokeWidth="1.5" strokeDasharray="3 3"/>
        <polygon points="312,146 318,150 312,154"
          fill="rgba(25,25,24,0.25)" />
        <text x="296" y="143" textAnchor="middle"
          fill="rgba(25,25,24,0.35)" fontSize="8" fontFamily="'JetBrains Mono', monospace">
          entrega
        </text>

        {/* ─── Node: Cliente ─── */}
        <rect x="320" y="110" width="100" height="80" rx="12"
          fill="#E4DFD4" stroke="rgba(25,25,24,0.12)" strokeWidth="1"
        />
        <text x="370" y="147" textAnchor="middle"
          fill="rgba(25,25,24,0.4)" fontSize="9" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em">
          SEU CLIENTE
        </text>
        <text x="370" y="164" textAnchor="middle"
          fill="rgba(25,25,24,0.75)" fontSize="12" fontFamily="system-ui, sans-serif" fontWeight="600">
          Produto
        </text>

        {/* ─── Bottom labels ─── */}
        <text x="70" y="210" textAnchor="middle"
          fill="rgba(25,25,24,0.3)" fontSize="8" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.06em">
          sua marca
        </text>
        <text x="220" y="225" textAnchor="middle"
          fill="rgba(59,130,246,0.6)" fontSize="8" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.06em">
          100% white-label · NDA
        </text>
        <text x="370" y="210" textAnchor="middle"
          fill="rgba(25,25,24,0.3)" fontSize="8" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.06em">
          satisfeito
        </text>

        {/* Online indicator */}
        <circle cx="220" cy="258" r="3.5" fill="#22C55E" />
        <text x="228" y="263" fill="rgba(25,25,24,0.35)" fontSize="8"
          fontFamily="'JetBrains Mono', monospace" letterSpacing="0.06em">
          parceria ativa
        </text>
      </svg>
    </div>
  );
}
