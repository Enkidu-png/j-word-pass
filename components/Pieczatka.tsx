"use client";

import { useId } from "react";

// Pieczec generowana w calosci jako SVG - zero plikow, zero binariow.
// Wbicie odpala sie przy montowaniu: rodzic remontuje komponent (zmiana `key`),
// zeby wbic ponownie. Ruch klasy `ceremonia` (Z8), CSS w bloku CEREMONIE.

export type TonPieczatki = "urzad" | "alarm" | "jad";

export default function Pieczatka({
  tekst,
  ton,
  obrocDeg = 0,
}: {
  tekst: string;
  ton: TonPieczatki;
  obrocDeg?: number;
}) {
  const id = useId();
  const luk = `luk-${id.replace(/:/g, "")}`;

  return (
    // rodzic drgnie o 2 px w chwili uderzenia (03 sekcja G)
    <span className="pieczatka-drgniecie">
      <span
        className="pieczatka ceremonia"
        data-ton={ton}
        style={{ "--obrot": `${obrocDeg}deg` } as React.CSSProperties}
      >
        <svg viewBox="0 0 100 100" role="img" aria-label={tekst}>
          <defs>
            <path id={luk} d="M 20,54 A 30,30 0 1 1 80,54" fill="none" />
          </defs>
          {/* szum krawedzi: przerywany obrys udaje nierowno odbita gume */}
          <circle cx="50" cy="50" r="45" className="pieczatka__obrys" />
          <circle cx="50" cy="50" r="38" className="pieczatka__obrys-wewnetrzny" />
          <text className="pieczatka__tekst">
            <textPath href={`#${luk}`} startOffset="50%" textAnchor="middle">
              {tekst}
            </textPath>
          </text>
        </svg>
      </span>
    </span>
  );
}
