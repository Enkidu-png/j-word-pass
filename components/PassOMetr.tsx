"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { czytajStan, etapUkonczony, type Etap } from "@/lib/stan";

// Globalny wskaznik postepu przez trzy etapy. Nawigacja projektu (anty-spec:
// zero sticky headera, zero hamburgera) - wolno isc tylko tam, gdzie sie juz bylo.

const SEGMENTY: { etap: Etap; nazwa: string; sciezka: string; wymaga: Etap | null }[] = [
  { etap: "egzamin", nazwa: "EGZAMIN", sciezka: "/egzamin", wymaga: null },
  { etap: "quiz", nazwa: "QUIZ", sciezka: "/quiz", wymaga: "egzamin" },
  { etap: "ogien", nazwa: "OGIEŃ", sciezka: "/proba-ognia", wymaga: "quiz" },
];

const CO_ILE_AWARIA_MS = 45_000;
const CZAS_AWARII_MS = 800;
const CZAS_DYMKA_MS = 1200;

export default function PassOMetr() {
  const router = useRouter();
  const sciezka = usePathname();
  const [ukonczone, ustawUkonczone] = useState<Record<Etap, boolean>>({
    egzamin: false,
    quiz: false,
    ogien: false,
  });
  const [awaria, ustawAwarie] = useState(false);
  const [dymek, ustawDymek] = useState<string | null>(null);

  // odczyt przy mount i po powrocie na strone - SSR nie zna sessionStorage
  useEffect(() => {
    const stan = czytajStan();
    ustawUkonczone({
      egzamin: etapUkonczony(stan, "egzamin"),
      quiz: etapUkonczony(stan, "quiz"),
      ogien: etapUkonczony(stan, "ogien"),
    });
  }, [sciezka]);

  // "Awaria" co 45 s: pasek cofa sie i wraca. Czysto wizualna - stan
  // w sessionStorage pozostaje nietkniety.
  useEffect(() => {
    const id = setInterval(() => {
      ustawAwarie(true);
      setTimeout(() => ustawAwarie(false), CZAS_AWARII_MS);
    }, CO_ILE_AWARIA_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!dymek) return;
    const id = setTimeout(() => ustawDymek(null), CZAS_DYMKA_MS);
    return () => clearTimeout(id);
  }, [dymek]);

  return (
    <nav className="pass-o-metr" data-pass-o-metr="" aria-label="Postęp przez etapy">
      <p className="pass-o-metr__naglowek">DRUK P-1 /// PASS-O-METR</p>
      <ol className={`pass-o-metr__segmenty${awaria ? " pass-o-metr__segmenty--awaria" : ""}`}>
        {SEGMENTY.map((s) => {
          const zrobiony = ukonczone[s.etap];
          const dostepny = s.wymaga === null || ukonczone[s.wymaga];
          const biezacy = sciezka === s.sciezka;
          return (
            <li key={s.etap}>
              <button
                type="button"
                data-segment={s.etap}
                data-stan={zrobiony ? "ukonczony" : dostepny ? "dostepny" : "zablokowany"}
                className={`pass-o-metr__segment${biezacy ? " gif-less gif-less--blink" : ""}`}
                title={dostepny ? s.nazwa : "KOMISJA ZABRANIA"}
                onClick={() =>
                  dostepny ? router.push(s.sciezka) : ustawDymek("KOMISJA ZABRANIA")
                }
              >
                {s.nazwa}
              </button>
            </li>
          );
        })}
      </ol>
      {dymek ? (
        <p className="pass-o-metr__dymek" role="status" data-dymek="">
          {dymek}
        </p>
      ) : null}
    </nav>
  );
}
