"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Ozdoba from "@/components/scena/Ozdoba";
import { etapUkonczony, type Etap } from "@/lib/stan";
import { uzyjStanu } from "./uzyjStanu";

// Pasek postepu przez trzy etapy (plan/05 A1). Jedyna nawigacja projektu razem
// ze stopka - zadnego sticky headera i zadnego hamburgera (anty-spec globalna 2).

const ETAPY: { etap: Etap; numer: string; nazwa: string; adres: string; zMaks: number }[] = [
  { etap: "egzamin", numer: "ETAP 1", nazwa: "EGZAMIN", adres: "/egzamin", zMaks: 10 },
  { etap: "quiz", numer: "ETAP 2", nazwa: "QUIZ", adres: "/quiz", zMaks: 15 },
  { etap: "ogien", numer: "ETAP 3", nazwa: "PRÓBA OGNIA", adres: "/proba-ognia", zMaks: 0 },
];

const AWARIA_CO_MS = 45000;
const AWARIA_TRWA_MS = 700;
const TEKST_AWARII = "BŁĄD ODCZYTU AKT";

export default function PassOMetr() {
  const { stan, zamontowany } = uzyjStanu();
  const [awaria, ustawAwarie] = useState<number | null>(null);

  useEffect(() => {
    // Losowa mutacja DOM co 45 s wchodzilaby w kazdy dluzszy scenariusz i dawala
    // faile nie do odtworzenia, wiec pod automatem awaria jest wylaczona
    // (plan/05 A1). Do ogladania recznego zostaje window.jwpAwaria().
    const recznie = (nr = Math.floor(Math.random() * ETAPY.length)) => {
      ustawAwarie(nr);
      setTimeout(() => ustawAwarie(null), AWARIA_TRWA_MS);
    };
    (window as unknown as { jwpAwaria?: (nr?: number) => void }).jwpAwaria = recznie;
    if (navigator.webdriver) return;
    const id = setInterval(() => recznie(), AWARIA_CO_MS);
    return () => clearInterval(id);
  }, []);

  // Przed montazem nie wiemy nic o sessionStorage; renderujemy stan wyjsciowy
  // (etap 1 otwarty), zeby serwer i klient zgadzaly sie w pierwszej klatce.
  const zdane = ETAPY.map((e) => (zamontowany ? etapUkonczony(stan, e.etap) : false));

  return (
    <nav className="pass-o-metr" aria-label="Postęp przez etapy" data-awaria={awaria ?? undefined}>
      <ol className="pass-o-metr__lista">
        {ETAPY.map((e, i) => {
          const otwarty = i === 0 || zdane[i - 1];
          const stanPola = zdane[i] ? "zdany" : otwarty ? "otwarty" : "zamkniety";
          const punkty =
            e.etap === "egzamin" ? stan?.egzamin?.punkty : e.etap === "quiz" ? stan?.quiz?.punkty : null;
          const podpis =
            awaria === i
              ? TEKST_AWARII
              : stanPola === "zdany" && e.zMaks > 0 && punkty != null
                ? `${punkty}/${e.zMaks}`
                : stanPola === "zdany"
                  ? "ZALICZONE"
                  : stanPola === "otwarty"
                    ? "OTWARTY"
                    : "ZAMKNIĘTY";
          const ozdoba =
            stanPola === "zdany" ? "stwor-gwiazdka" : stanPola === "otwarty" ? "nowe" : "stwor-klodka";

          const wnetrze = (
            <>
              <b className="pass-o-metr__numer">{e.numer}</b>
              <span className="pass-o-metr__nazwa">{e.nazwa}</span>
              <span className="pass-o-metr__stan">{podpis}</span>
              <Ozdoba id={ozdoba} klasa="pass-o-metr__ozdoba" pierwszyEkran />
            </>
          );

          return (
            <li key={e.etap} className={`pass-o-metr__pole pass-o-metr__pole--${stanPola}`} data-etap={e.etap}>
              {stanPola === "zamkniety" ? (
                <span className="pass-o-metr__tresc" aria-disabled="true">
                  {wnetrze}
                </span>
              ) : (
                <Link className="pass-o-metr__tresc" href={e.adres}>
                  {wnetrze}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
