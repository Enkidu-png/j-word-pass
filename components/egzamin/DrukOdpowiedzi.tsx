"use client";

import { useEffect, useState } from "react";
import { czytajStan, zapiszStan } from "@/lib/stan";

// Druk odpowiedzi egzaminu (plan/06 B punkty 8-9). Ceremonia oceny dochodzi
// w F3-03 - tutaj jest samo pole, licznik i przycisk.
//
// Wartosc startuje pusta i wjezdza z sessionStorage dopiero po montazu.
// Odczyt storage w pierwszym renderze rozjechalby sie z HTML-em z serwera,
// ktory tego stanu nie zna (blad hydracji z v1, plan/06 D).

const LIMIT = 8000;
const PROG_ALARMU = 7500;

export default function DrukOdpowiedzi() {
  const [odpowiedz, ustawOdpowiedz] = useState("");

  useEffect(() => {
    const zapisana = czytajStan()?.egzamin?.odpowiedz;
    if (zapisana) ustawOdpowiedz(zapisana);
  }, []);

  const alarm = odpowiedz.length > PROG_ALARMU;

  return (
    <form className="druk druk--odpowiedz" onSubmit={(z) => z.preventDefault()}>
      <p className="druk__naglowek">TWOJA ODPOWIEDŹ, ALEKSANDRO</p>
      <label className="druk__etykieta" htmlFor="odpowiedz">
        PISZ W RAMCE. KOMISJA CZYTA WSZYSTKO.
      </label>
      <textarea
        className="druk__pole"
        id="odpowiedz"
        name="odpowiedz"
        data-pole="odpowiedz"
        rows={10}
        maxLength={LIMIT}
        value={odpowiedz}
        onChange={(z) => {
          ustawOdpowiedz(z.target.value);
          zapiszStan({ egzamin: { odpowiedz: z.target.value } });
        }}
      />
      <p className="druk__licznik" data-licznik-znakow data-alarm={alarm ? "tak" : "nie"}>
        ZNAKÓW: {odpowiedz.length} Z {LIMIT}
      </p>
      <button className="druk__cta" type="submit" data-cta="oddaj">
        ODDAJ PRACĘ KOMISJI
      </button>
    </form>
  );
}
