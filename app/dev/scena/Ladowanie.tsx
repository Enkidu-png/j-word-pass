"use client";

import { useState } from "react";
import EkranLadowania from "@/components/scena/EkranLadowania";

// Wyzwalacz do playgroundu: bez niego ekranu ladowania nie da sie zmierzyc
// od montazu, a AC F1-04 wymaga pomiaru performance.now() na zywej stronie.
// Playground zapisuje znaczniki czasu montazu i zdjecia ekranu, zeby AC F1-04
// dalo sie zmierzyc BEZ narzutu roundtripow Playwrighta (pierwszy pomiar przez
// page.evaluate dawal 790 ms tam, gdzie realnie bylo 400 - mierzyl siebie).
declare global {
  interface Window {
    ladowanieOd?: number;
    ladowanieDo?: number;
  }
}

export default function Ladowanie() {
  const [wariant, ustawWariant] = useState<"start" | "narada" | null>(null);
  const [gotowe, ustawGotowe] = useState(false);

  return (
    <div className="playground-ladowanie">
      <button type="button" data-pokaz="start" onClick={() => { window.ladowanieDo = undefined; window.ladowanieOd = performance.now(); ustawWariant("start"); }}>
        POKAZ WARIANT START
      </button>
      <button
        type="button"
        data-pokaz="narada"
        onClick={() => {
          ustawGotowe(false);
          window.ladowanieDo = undefined;
          window.ladowanieOd = performance.now();
          ustawWariant("narada");
          window.setTimeout(() => ustawGotowe(true), 500);
        }}
      >
        POKAZ WARIANT NARADA
      </button>
      {wariant ? (
        <EkranLadowania
          wariant={wariant}
          gotowe={gotowe}
          dymek={wariant === "narada" ? "ALEKSANDRO, KOMISJA OBRADUJE." : undefined}
          naKoniec={() => { window.ladowanieDo = performance.now(); ustawWariant(null); }}
        />
      ) : null}
    </div>
  );
}
