"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LicznikMechaniczny from "@/components/LicznikMechaniczny";

const SCIEZKI = ["/", "/egzamin", "/quiz", "/proba-ognia"];
const LICZNIK_BAZOWY = 1545013;

export default function WebringStopki() {
  const router = useRouter();
  // Licznik dolicza dopiero po hydracji: SSR wypisuje wartosc bazowa, wiec
  // nie ma szans na hydration mismatch (Date.now() na serwerze != w kliencie).
  const [odwiedziny, ustawOdwiedziny] = useState(LICZNIK_BAZOWY);
  useEffect(() => {
    ustawOdwiedziny(LICZNIK_BAZOWY + (Math.floor(Date.now() / 86400000) % 997));
  }, []);

  return (
    <footer className="webring-stopki" data-webring="">
      <p>
        CZĘŚĆ OFICJALNEGO WEBRINGU KOMISJI:{" "}
        <Link href="/">[POPRZEDNIA]</Link> <Link href="/egzamin">[NASTĘPNA]</Link>{" "}
        <button
          type="button"
          data-losowa=""
          onClick={() => router.push(SCIEZKI[Math.floor(Math.random() * SCIEZKI.length)])}
        >
          [LOSOWA]
        </button>{" "}
        <Link href="/">[LISTA]</Link>
      </p>
      <p>Ostatnia aktualizacja: 03.01.2000 /// projekt strony: SAMMY Z KOMISJI</p>
      <p className="webring-stopki__dol">
        {/* odznaka wlasnej roboty; swiadome klamstwo - to nie jest HTML 4.0 */}
        <svg className="webring-stopki__odznaka" viewBox="0 0 88 31" role="img" aria-label="VALID HTML 4.0">
          <rect x="0.5" y="0.5" width="87" height="30" className="webring-stopki__odznaka-tlo" />
          <rect x="3.5" y="3.5" width="81" height="24" className="webring-stopki__odznaka-ramka" />
          <text x="44" y="13" textAnchor="middle" className="webring-stopki__odznaka-tekst">
            VALID
          </text>
          <text x="44" y="24" textAnchor="middle" className="webring-stopki__odznaka-tekst">
            HTML 4.0
          </text>
        </svg>
        <span data-licznik-odwiedzin="">
          ODWIEDZIN: <LicznikMechaniczny wartosc={odwiedziny} szerokosc={7} />
        </span>
      </p>
    </footer>
  );
}
