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
    ustaw(czytajStan());
    ustawZamontowany(true);
  }, [sciezka]);

  return { stan, zamontowany };
}
