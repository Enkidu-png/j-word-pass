"use client";

import { useSyncExternalStore } from "react";
import type { Pozycja } from "@/lib/assety";

// Z11: GIF-a nie zatrzyma CSS, wiec przy `prefers-reduced-motion: reduce`
// podajemy pierwsza klatke zamiast pliku animowanego (plan/04 G).
//
// useSyncExternalStore, a nie useState plus useEffect: wersja na efekcie
// startowala ZAWSZE od pliku animowanego i poprawiala sie dopiero po montazu.
// Dla komponentow montowanych pozniej niz hydracja (plomienie plonacego napisu
// dokladane po pomiarze szerokosci) zostawialo to widoczna klatke ruchomego
// GIF-a - zlapal to test F1-01 na 390 px. Tutaj klient dostaje prawidlowa
// wartosc juz przy pierwszym renderze, a serwer zawsze wersje animowana,
// wiec strona bez JS nadal sie rusza.

const ZAPYTANIE = "(prefers-reduced-motion: reduce)";

function subskrybuj(zmiana: () => void) {
  const mql = window.matchMedia(ZAPYTANIE);
  mql.addEventListener("change", zmiana);
  return () => mql.removeEventListener("change", zmiana);
}

const naKliencie = () => window.matchMedia(ZAPYTANIE).matches;
const naSerwerze = () => false;

export function uzyjKlatki(pozycja: Pozycja): string {
  const zredukowany = useSyncExternalStore(subskrybuj, naKliencie, naSerwerze);
  const statyczna = pozycja["klatka-statyczna"];
  return zredukowany && statyczna ? statyczna : pozycja.plik;
}
