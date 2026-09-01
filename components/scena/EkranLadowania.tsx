"use client";

import { useEffect, useRef, useState } from "react";
import Ozdoba from "./Ozdoba";
import PasGoniec from "./PasGoniec";

// Pelnoekranowa nakladka. Jedyne miejsce w projekcie z dozwolonym obrotem (Z6b);
// caly obrot siedzi w app/style/ladowanie.css, tu nie ma ani jednego transformu.
//
// KONTRAKT CZASU, dwa warianty i NIE wolno ich mylic (plan/04 F):
//   start  - min 1200 ms, warunek: fonty i obrazki gotowe, TWARDY limit 2600 ms
//   narada - min 3500 ms, warunek: przyszla odpowiedz modelu, TWARDY limit 16000 ms
const KONTRAKT = {
  start: { minimum: 1200, maksimum: 2600 },
  narada: { minimum: 3500, maksimum: 16000 },
} as const;

// Szesc scian, kazda inna ozdoba (plan/04 F). Zadne z tych id nie jest nowe -
// wszystkie policzone juz w rdzeniu biblioteki (plan/03 B3).
const SCIANY = [
  ["przod", "statek"],
  ["prawa", "planeta"],
  ["tyl", "ogien"],
  ["lewa", "stwor-dyskietka"],
  ["gora", "stwor-kula-ziemska"],
  ["dol", "stwor-gwiazdka"],
] as const;

const POZYCJI_PASKA = 10;

export default function EkranLadowania({
  wariant = "start",
  gotowe = true,
  dymek,
  naKoniec,
}: {
  wariant?: "start" | "narada";
  gotowe?: boolean;
  dymek?: string;
  naKoniec: () => void;
}) {
  const { minimum, maksimum } = KONTRAKT[wariant];
  const [postep, ustawPostep] = useState(0);
  const zamkniete = useRef(false);
  const naKoniecRef = useRef(naKoniec);
  naKoniecRef.current = naKoniec;

  // Jedno miejsce zamykania, zeby Escape, warunek i twardy limit nie zdjely
  // ekranu trzy razy i nie przeniosly fokusu trzy razy.
  const zamknij = useRef(() => {
    if (zamkniete.current) return;
    zamkniete.current = true;
    naKoniecRef.current();
    // Fokus laduje na naglowku strony docelowej (plan/04 F, Z10).
    requestAnimationFrame(() => document.querySelector<HTMLElement>("h1")?.focus());
  }).current;

  const zredukowany =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const min = zredukowany ? 400 : minimum;
  const maks = zredukowany ? 400 : maksimum;

  useEffect(() => {
    const start = performance.now();
    const twardy = window.setTimeout(zamknij, maks);
    const krok = window.setInterval(
      () => ustawPostep((p) => Math.min(p + 1, POZYCJI_PASKA)),
      Math.max(min / POZYCJI_PASKA, 40),
    );
    let poMinimum = false;
    let warunek = false;
    const sprobuj = () => {
      if (poMinimum && warunek) zamknij();
    };
    const minutnik = window.setTimeout(() => {
      poMinimum = true;
      sprobuj();
    }, Math.max(min - (performance.now() - start), 0));

    if (wariant === "narada") {
      warunek = gotowe;
      sprobuj();
    } else {
      const obrazkiGotowe = () =>
        [...document.images].every((i) => i.complete || i.loading === "lazy");
      document.fonts.ready.then(() => {
        warunek = obrazkiGotowe();
        if (!warunek) window.setTimeout(() => { warunek = true; sprobuj(); }, 100);
        sprobuj();
      });
    }

    const klawisz = (e: KeyboardEvent) => {
      if (e.key === "Escape") zamknij();
    };
    window.addEventListener("keydown", klawisz);
    return () => {
      window.clearTimeout(twardy);
      window.clearTimeout(minutnik);
      window.clearInterval(krok);
      window.removeEventListener("keydown", klawisz);
    };
  }, [wariant, gotowe, min, maks, zamknij]);

  return (
    <div data-ladowanie={wariant} className="ladowanie" role="status" aria-live="polite">
      <div className="ladowanie-scena">
        <div className="ladowanie-szescian">
          {SCIANY.map(([sciana, ozdoba]) => (
            <div key={sciana} className={`ladowanie-sciana ladowanie-sciana--${sciana}`}>
              <Ozdoba id={ozdoba} pierwszyEkran />
            </div>
          ))}
        </div>
      </div>

      {dymek ? <p className="ladowanie__dymek">{dymek}</p> : null}

      <p data-pasek className="ladowanie__pasek">
        {"#".repeat(postep).padEnd(POZYCJI_PASKA, ".")}
      </p>

      <div className="ladowanie__goniec">
        <PasGoniec tekst="KOMISJA PRZYGOTOWUJE AKTA DLA ALEKSANDRY" />
      </div>
    </div>
  );
}
