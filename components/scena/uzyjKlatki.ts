"use client";

import { useEffect, useState } from "react";
import type { Pozycja } from "@/lib/assety";

// Z11: GIF-a nie zatrzyma CSS, wiec przy `prefers-reduced-motion: reduce`
// podmieniamy zrodlo na pierwsza klatke (plan/04 G). Start zawsze z pliku
// animowanego, zeby SSR i wariant bez JS dzialaly normalnie.
export function uzyjKlatki(pozycja: Pozycja): string {
  const [zrodlo, ustawZrodlo] = useState(pozycja.plik);

  useEffect(() => {
    const statyczna = pozycja["klatka-statyczna"];
    if (!statyczna) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const zastosuj = () => ustawZrodlo(mql.matches ? statyczna : pozycja.plik);
    zastosuj();
    mql.addEventListener("change", zastosuj);
    return () => mql.removeEventListener("change", zastosuj);
  }, [pozycja]);

  return zrodlo;
}
