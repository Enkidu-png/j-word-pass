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
  dekoracyjna = false,
}: {
  tekst: string;
  ton: TonPieczatki;
  obrocDeg?: number;
  // Z8: element nie moze byc naraz dekoracja i ceremonia. Pieczec na tablicy
  // ogloszen tylko wisi (i moze dostac gif-less od rodzica), wiec nie wbija sie.
  dekoracyjna?: boolean;
}) {
  const id = useId();
  const luk = `luk-${id.replace(/:/g, "")}`;

  return (
    // rodzic drgnie o 2 px w chwili uderzenia (03 sekcja G)
    <span className={dekoracyjna ? "" : "pieczatka-drgniecie"}>
      <span
        className={`pieczatka${dekoracyjna ? "" : " ceremonia"}`}
        data-ton={ton}
        style={{ "--obrot": `${obrocDeg}deg` } as React.CSSProperties}
      >
        <svg viewBox="0 0 100 100" role="img" aria-label={tekst}>
          <defs>
            {/* luk biegnie od LEWEJ do PRAWEJ gora - odwrotny kierunek stawial
                caly napis do gory nogami (widoczne dopiero na zrzucie) */}
            <path id={luk} d="M 14,44 A 65,65 0 0 0 86,44" fill="none" />
          </defs>
          {/* szum krawedzi: przerywany obrys udaje nierowno odbita gume */}
          <circle cx="50" cy="50" r="45" className="pieczatka__obrys" />
          <circle cx="50" cy="50" r="38" className="pieczatka__obrys-wewnetrzny" />
          <text className="pieczatka__tekst">
            {/* dowolnie dlugi napis ma zmiescic sie na luku, a nie owinac sie
                dookola i zniknac za koncem sciezki */}
            <textPath
              href={`#${luk}`}
              startOffset="50%"
              textAnchor="middle"
              textLength="70"
              lengthAdjust="spacingAndGlyphs"
            >
              {tekst}
            </textPath>
          </text>
        </svg>
      </span>
    </span>
  );
}
