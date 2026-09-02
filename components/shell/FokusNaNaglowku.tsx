"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Po nawigacji w App Routerze fokus zostaje tam, gdzie byl, wiec czytnik ekranu
// i klawiatura zostaja na starej stronie. Kontrakt z plan/04 F i plan/05 B3:
// po ceremonii wejscia fokus ma wyladowac na `h1` strony docelowej.
// Pierwsze wejscie pomijamy - przejmowanie fokusu przy starcie strony to
// zaskoczenie, a nie ulatwienie.
export default function FokusNaNaglowku() {
  const sciezka = usePathname();
  const pierwszy = useRef(true);

  useEffect(() => {
    if (pierwszy.current) {
      pierwszy.current = false;
      return;
    }
    document.querySelector<HTMLElement>("main.tresc h1")?.focus();
  }, [sciezka]);

  return null;
}
