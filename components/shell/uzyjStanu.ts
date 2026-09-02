"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { czytajStan } from "@/lib/stan";

// Stan kandydatki siedzi w sessionStorage, wiec serwer go nie zna. Shell czyta
// go po montazu i ponownie przy kazdej zmianie sciezki: layout w App Routerze
// nie odmontowuje sie przy nawigacji, wiec bez tego PassOMetr zostalby z
// wartosciami sprzed zdania etapu.
export function uzyjStanu() {
  const sciezka = usePathname();
  const [stan, ustaw] = useState<ReturnType<typeof czytajStan>>(null);
  const [zamontowany, ustawZamontowany] = useState(false);

  useEffect(() => {
    const odswiez = () => ustaw(czytajStan());
    odswiez();
    ustawZamontowany(true);
    // Werdykt etapu zapisuje sie BEZ zmiany sciezki (ceremonia oceny siedzi na
    // /egzamin), wiec sam efekt na `sciezka` zostawilby PassOMetr z etapem 2
    // ciagle zamknietym. `zdarzenie storage` tu nie pomoze - leci tylko do
    // INNYCH kart. Kto zapisuje kamien milowy, ten krzyczy tym zdarzeniem.
    window.addEventListener("jwp:stan", odswiez);
    return () => window.removeEventListener("jwp:stan", odswiez);
  }, [sciezka]);

  return { stan, zamontowany };
}
