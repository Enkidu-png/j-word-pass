"use client";

import { useState } from "react";

// Pytanie 5: slimak spi w czapce nocnej. Klik budzi go na 2 s (otwiera jedno oko).
export default function SlimakSpi() {
  const [obudzony, ustawObudzony] = useState(false);
  return (
    <button
      type="button"
      className="sig sig--slimak"
      data-obudzony={obudzony ? "tak" : "nie"}
      aria-label={obudzony ? "Ślimak obudzony" : "Ślimak śpi, kliknięcie go budzi"}
      onClick={() => {
        ustawObudzony(true);
        setTimeout(() => ustawObudzony(false), 2000);
      }}
    >
      <svg viewBox="0 0 48 32" className="sig__slimak">
        <path d="M2 28 H30 M6 28 C6 18 14 14 22 18" />
        <circle cx="32" cy="20" r="10" />
        <circle cx="32" cy="20" r="5" />
        <path d="M12 14 L10 6 L18 8 Z" />
        <circle cx="13" cy="16" r="1.6" className="sig__oko" />
      </svg>
      <span className="sig__zzz gif-less">ZzZ</span>
    </button>
  );
}
