"use client";

import { useState } from "react";

// Pytanie 9: kosc udowa z metka. Klik = kosc robi wyciskanie sztangi (2 klatki).
export default function KoscUdowa() {
  const [cwiczy, ustawCwiczy] = useState(false);
  return (
    <button
      type="button"
      className="sig sig--kosc"
      data-cwiczy={cwiczy ? "tak" : "nie"}
      aria-label="Kość udowa, kliknięcie każe jej ćwiczyć"
      onClick={() => {
        ustawCwiczy(true);
        setTimeout(() => ustawCwiczy(false), 1600);
      }}
    >
      <svg viewBox="0 0 60 24" className="sig__kosc">
        <path d="M14 12 H46" />
        <path d="M10 6 A5 5 0 1 0 10 12 A5 5 0 1 0 10 18" />
        <path d="M50 6 A5 5 0 1 1 50 12 A5 5 0 1 1 50 18" />
      </svg>
      <span className="sig__metka">WYTRZYMAŁOŚĆ: TAK</span>
    </button>
  );
}
