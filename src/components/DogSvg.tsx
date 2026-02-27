// src/components/DogSvg.tsx
import type { Selections, Product } from '@/lib/data'
import { PRODUCTS } from '@/lib/data'

interface DogSvgProps {
  selections: Selections
  className?: string
}

function getVisible(selections: Selections, category: keyof Selections): string | null {
  const id = selections[category]
  if (!id) return null
  const product = PRODUCTS.find(p => p.id === id)
  return product?.svgLayer ?? null
}

function getFurColor(selections: Selections): string {
  const id = selections.coat
  if (!id) return '#D4A028'
  const product = PRODUCTS.find((p): p is Product & { furColor: string } =>
    p.id === id && p.furColor !== undefined
  )
  return product?.furColor ?? '#D4A028'
}

export default function DogSvg({ selections, className }: DogSvgProps) {
  const furColor = getFurColor(selections)

  const show = (layerId: string, category: keyof Selections) =>
    getVisible(selections, category) === layerId

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 320"
      className={className}
      style={{ '--fur-color': furColor } as React.CSSProperties}
    >
      <defs>
        <style>{`
          .fur { fill: var(--fur-color, #D4A028); }
          .spots { fill: #3b2a1a; opacity: 0.65; }
          .outline { stroke: #1a1a1a; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
        `}</style>
      </defs>

      {/* BASE: Body (always visible) */}
      <g id="body-base">
        <ellipse cx="150" cy="200" rx="75" ry="65" className="fur outline"/>
        <circle cx="150" cy="115" r="55" className="fur outline"/>
        <ellipse cx="150" cy="135" rx="25" ry="18" fill="#c8914a" className="outline"/>
        <ellipse cx="150" cy="125" rx="10" ry="7" fill="#1a1a1a"/>
        <path d="M138 138 Q150 148 162 138" fill="none" className="outline"/>
      </g>

      {/* COAT: Spotty overlay */}
      {show('coat-spotty', 'coat') && (
        <g id="coat-spotty">
          <ellipse cx="120" cy="210" rx="14" ry="10" className="spots"/>
          <ellipse cx="170" cy="215" rx="18" ry="12" className="spots"/>
          <ellipse cx="150" cy="240" rx="10" ry="7" className="spots"/>
          <ellipse cx="195" cy="185" rx="12" ry="9" className="spots"/>
          <ellipse cx="125" cy="110" rx="9" ry="7" className="spots"/>
          <ellipse cx="175" cy="105" rx="11" ry="8" className="spots"/>
        </g>
      )}

      {/* EARS */}
      {show('ears-floppy', 'ears') && (
        <g id="ears-floppy">
          <ellipse cx="100" cy="100" rx="20" ry="35" className="fur outline" transform="rotate(-15 100 100)"/>
          <ellipse cx="200" cy="100" rx="20" ry="35" className="fur outline" transform="rotate(15 200 100)"/>
        </g>
      )}
      {show('ears-radar', 'ears') && (
        <g id="ears-radar">
          <polygon points="95,75 80,30 110,75" className="fur outline"/>
          <polygon points="205,75 190,30 220,75" className="fur outline"/>
        </g>
      )}
      {show('ears-satellite', 'ears') && (
        <g id="ears-satellite">
          <ellipse cx="95" cy="60" rx="22" ry="28" fill="none" stroke="#1a1a1a" strokeWidth="3"/>
          <line x1="95" y1="75" x2="105" y2="90" stroke="#1a1a1a" strokeWidth="3"/>
          <ellipse cx="205" cy="60" rx="22" ry="28" fill="none" stroke="#1a1a1a" strokeWidth="3"/>
          <line x1="205" y1="75" x2="195" y2="90" stroke="#1a1a1a" strokeWidth="3"/>
        </g>
      )}

      {/* EYES */}
      {show('eyes-puppy', 'eyes') && (
        <g id="eyes-puppy">
          <circle cx="130" cy="108" r="12" fill="white" className="outline"/>
          <circle cx="170" cy="108" r="12" fill="white" className="outline"/>
          <circle cx="130" cy="110" r="8" fill="#3d1c02"/>
          <circle cx="170" cy="110" r="8" fill="#3d1c02"/>
          <circle cx="133" cy="107" r="3" fill="white"/>
          <circle cx="173" cy="107" r="3" fill="white"/>
        </g>
      )}
      {show('eyes-human', 'eyes') && (
        <g id="eyes-human">
          <ellipse cx="130" cy="108" rx="14" ry="10" fill="white" className="outline"/>
          <ellipse cx="170" cy="108" rx="14" ry="10" fill="white" className="outline"/>
          <circle cx="130" cy="108" r="6" fill="#3d6b8c"/>
          <circle cx="170" cy="108" r="6" fill="#3d6b8c"/>
          <circle cx="130" cy="108" r="3" fill="#1a1a1a"/>
          <circle cx="170" cy="108" r="3" fill="#1a1a1a"/>
          <path d="M120,96 Q130,90 140,96" fill="none" stroke="#1a1a1a" strokeWidth="2.5"/>
          <path d="M160,96 Q170,90 180,96" fill="none" stroke="#1a1a1a" strokeWidth="2.5"/>
        </g>
      )}
      {show('eyes-anime', 'eyes') && (
        <g id="eyes-anime">
          <ellipse cx="130" cy="108" rx="15" ry="18" fill="white" className="outline"/>
          <ellipse cx="170" cy="108" rx="15" ry="18" fill="white" className="outline"/>
          <ellipse cx="130" cy="110" rx="10" ry="13" fill="#6a0dad"/>
          <ellipse cx="170" cy="110" rx="10" ry="13" fill="#6a0dad"/>
          <ellipse cx="130" cy="109" rx="5" ry="7" fill="#1a1a1a"/>
          <ellipse cx="170" cy="109" rx="5" ry="7" fill="#1a1a1a"/>
          <circle cx="124" cy="103" r="4" fill="white"/>
          <circle cx="164" cy="103" r="4" fill="white"/>
          <text x="88" y="90" fontSize="14">✨</text>
          <text x="188" y="90" fontSize="14">✨</text>
        </g>
      )}

      {/* TOOFS */}
      {show('toofs-buck', 'toofs') && (
        <g id="toofs-buck">
          <rect x="143" y="140" width="9" height="12" rx="2" fill="white" className="outline"/>
          <rect x="153" y="140" width="9" height="12" rx="2" fill="white" className="outline"/>
        </g>
      )}
      {show('toofs-vampire', 'toofs') && (
        <g id="toofs-vampire">
          <polygon points="133,140 138,155 143,140" fill="white" className="outline"/>
          <polygon points="157,140 162,155 167,140" fill="white" className="outline"/>
          <rect x="143" y="140" width="14" height="9" rx="1" fill="white" className="outline"/>
        </g>
      )}

      {/* TAIL */}
      {show('tail-bushy', 'tail') && (
        <g id="tail-bushy">
          <ellipse cx="235" cy="175" rx="28" ry="45" className="fur outline" transform="rotate(30 235 175)"/>
          <ellipse cx="248" cy="155" rx="18" ry="30" fill="#e8b84b" className="outline" transform="rotate(25 248 155)"/>
        </g>
      )}
      {show('tail-stub', 'tail') && (
        <g id="tail-stub">
          <ellipse cx="225" cy="195" rx="12" ry="16" className="fur outline" transform="rotate(20 225 195)"/>
        </g>
      )}
      {show('tail-wag', 'tail') && (
        <g id="tail-wag">
          <path d="M220,190 Q250,160 270,140 Q285,125 275,110" fill="none" className="outline" strokeWidth="14" strokeLinecap="round"/>
          <path d="M220,190 Q250,160 270,140 Q285,125 275,110" fill="none" stroke="#e8b84b" strokeWidth="8" strokeLinecap="round"/>
        </g>
      )}

      {/* LEGS */}
      {show('legs-outstretched', 'legs') && (
        <g id="legs-outstretched">
          <rect x="105" y="240" width="25" height="55" rx="12" className="fur outline"/>
          <rect x="168" y="240" width="25" height="55" rx="12" className="fur outline"/>
          <rect x="60" y="230" width="22" height="50" rx="10" className="fur outline" transform="rotate(-20 60 230)"/>
          <rect x="210" y="230" width="22" height="50" rx="10" className="fur outline" transform="rotate(20 210 230)"/>
        </g>
      )}
      {show('legs-zoomies', 'legs') && (
        <g id="legs-zoomies">
          <rect x="75" y="230" width="22" height="50" rx="10" className="fur outline" transform="rotate(-40 75 230)"/>
          <rect x="120" y="248" width="22" height="50" rx="10" className="fur outline" transform="rotate(-25 120 248)"/>
          <rect x="155" y="248" width="22" height="50" rx="10" className="fur outline" transform="rotate(25 155 248)"/>
          <rect x="200" y="230" width="22" height="50" rx="10" className="fur outline" transform="rotate(40 200 230)"/>
          <line x1="50" y1="190" x2="20" y2="190" stroke="#aaa" strokeWidth="3" strokeDasharray="5,3"/>
          <line x1="50" y1="205" x2="15" y2="205" stroke="#aaa" strokeWidth="3" strokeDasharray="5,3"/>
          <line x1="50" y1="220" x2="20" y2="220" stroke="#aaa" strokeWidth="3" strokeDasharray="5,3"/>
        </g>
      )}
      {show('legs-derp', 'legs') && (
        <g id="legs-derp">
          <ellipse cx="118" cy="268" rx="18" ry="12" className="fur outline"/>
          <ellipse cx="182" cy="268" rx="18" ry="12" className="fur outline"/>
        </g>
      )}
    </svg>
  )
}
