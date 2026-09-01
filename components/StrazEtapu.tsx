"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { czytajStan, etapUkonczony, type Etap } from "@/lib/stan";

// Wejscie z URL na etap, ktorego kandydat jeszcze nie odblokowal, NIE przekierowuje
// (Z15: nie odbieramy kontroli nad przegladarka). Strona renderuje sie normalnie,
// a na wierzchu ląduje druk Komisji z linkiem do wlasciwego etapu.

const WARUNKI: Record<string, { wymaga: Etap; numer: number; sciezka: string }> = {
  "/quiz": { wymaga: "egzamin", numer: 1, sciezka: "/egzamin" },
  "/proba-ognia": { wymaga: "quiz", numer: 2, sciezka: "/quiz" },
};

export default function StrazEtapu() {
  const sciezka = usePathname();
  const warunek = WARUNKI[sciezka];
  const [zablokowany, ustawZablokowany] = useState(false);

  useEffect(() => {
    // SSR nie zna sessionStorage, wiec druk pojawia sie po hydracji
    ustawZablokowany(warunek ? !etapUkonczony(czytajStan(), warunek.wymaga) : false);
  }, [sciezka, warunek]);

  if (!warunek || !zablokowany) return null;

  return (
    <aside className="formularz-F7 straz-etapu" data-straz="" role="alert">
      <p className="straz-etapu__druk">KOMISJA ZABRANIA. NAJPIERW ETAP {warunek.numer}.</p>
      <Link href={warunek.sciezka}>ODDAJĘ SIĘ POD ETAP {warunek.numer}</Link>
    </aside>
  );
}
