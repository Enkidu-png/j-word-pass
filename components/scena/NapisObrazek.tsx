"use client";

import { useId } from "react";

// Naglowek jako SVG, bo takiego pliku nie ma w archiwum (plan/03 B4) - jedyny
// dozwolony wyjatek od Z7. Zero rotacji i skosu, napis stoi prosto (Z6).
//
// ODSTEPSTWO OD plan/04 D punkt 1, swiadome: plan podaje viewBox
// "0 0 <10*len> 120" przy font-size 96. Te dwie liczby sie wykluczaja - jedenascie
// znakow "PRÓBA OGNIA" zajmuje przy tym kroju okolo 700 jednostek, a viewBox
// mialby 110, wiec zewnetrzny <svg> (domyslnie overflow: hidden) obcialby napis
// do dwoch liter. Bierzemy szerokosc proporcjonalna do stopnia pisma i dokladamy
// `textLength` z `lengthAdjust`, ktore wpasowuje glify w te szerokosc niezaleznie
// od metryk fontu. Dzieki temu obciecie jest niemozliwe z definicji, nie z pomiaru.
const NA_ZNAK = 62;
const MARGINES = 40;
const WYSOKOSC = 130;
// Linia pisma nizej niz w planie: przy y=96 i stopniu 96 kreska nad `Ó` w `PRÓBA
// OGNIA` wychodzila NAD viewBox i byla scinana. Zlapal to test bbox z F1-02.
const LINIA_PISMA = 104;

export default function NapisObrazek({
  tekst,
  wariant = "chrom",
  klasa,
}: {
  tekst: string;
  wariant?: "chrom" | "neon";
  klasa?: string;
}) {
  const id = useId();
  const gradient = `chrom-${id}`;
  const szerokosc = NA_ZNAK * tekst.length + MARGINES;

  return (
    <svg
      data-napis={wariant}
      role="img"
      aria-label={tekst}
      viewBox={`0 0 ${szerokosc} ${WYSOKOSC}`}
      preserveAspectRatio="xMidYMid meet"
      className={klasa ? `napis napis--${wariant} ${klasa}` : `napis napis--${wariant}`}
    >
      <title>{tekst}</title>
      {wariant === "chrom" && (
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chrom-1)" />
            <stop offset="35%" stopColor="var(--chrom-2)" />
            <stop offset="50%" stopColor="var(--chrom-3)" />
            <stop offset="51%" stopColor="var(--chrom-4)" />
            <stop offset="70%" stopColor="var(--chrom-5)" />
            <stop offset="100%" stopColor="var(--chrom-6)" />
          </linearGradient>
        </defs>
      )}
      <text
        className="napis__tekst"
        x="50%"
        y={LINIA_PISMA}
        textAnchor="middle"
        dominantBaseline="alphabetic"
        textLength={NA_ZNAK * tekst.length}
        lengthAdjust="spacingAndGlyphs"
        fill={wariant === "chrom" ? `url(#${gradient})` : "var(--jad)"}
        stroke={wariant === "chrom" ? "var(--tusz)" : "var(--magenta)"}
      >
        {tekst}
      </text>
    </svg>
  );
}
