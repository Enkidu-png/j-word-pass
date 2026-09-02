"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Przycisk-uciekinier (plan/05 B2). Skacze DOKLADNIE trzy razy, przy czwartym
// najechaniu kapituluje. Zero obrotu (Z6) - skok to zmiana left/top w obrebie
// tablicy ogloszen, nie transform.

const LIMIT_SKOKOW = 3;
const TEKST_UCIEKA = "WOLĘ NIE";
const TEKST_KAPITULACJI = "DOBRZE, ALEKSANDRO, NIECH BĘDZIE";

type Punkt = { left: number; top: number };

export default function PrzyciskUciekinier({ naWejscie }: { naWejscie: () => void }) {
  const przyciskRef = useRef<HTMLButtonElement>(null);
  // Kursor MUSI opuscic przycisk, zeby kolejne najechanie sie liczylo. Bez tego
  // przycisk, ktory doskoczy z powrotem pod kursor, zjada dwa skoki naraz.
  const gotowy = useRef(true);
  const [skoki, ustawSkoki] = useState(0);
  const [kapitulacja, ustawKapitulacje] = useState(false);
  const [gdzie, ustawGdzie] = useState<Punkt | null>(null);

  // Granice ruchu: SIATKA OZDOB tablicy, a nie cala tablica. Plan mowi „losowa
  // pozycja w obrebie tablicy ogloszen", a siatka w niej lezy, wiec warunek jest
  // spelniony - a przy okazji uciekinier nie moze wylosowac pozycji NA przycisku
  // `PRZYSTĘPUJĘ DO ETAPU 1` i go zaslonic. Zaslanianie przycisku byl realny blad
  // v1 (F7-05), a losowy skok to najgorszy mozliwy sposob, zeby go powtorzyc.
  // Wspolrzedne sa wzgledem `.tablica`, bo to ona jest `position: relative`.
  const granice = () => {
    const przycisk = przyciskRef.current;
    const kontener = przycisk?.closest<HTMLElement>(".tablica");
    const siatka = kontener?.querySelector<HTMLElement>(".tablica__siatka");
    if (!przycisk || !siatka) return null;
    return {
      minL: siatka.offsetLeft,
      minG: siatka.offsetTop,
      maksL: Math.max(siatka.offsetLeft, siatka.offsetLeft + siatka.offsetWidth - przycisk.offsetWidth),
      maksG: Math.max(siatka.offsetTop, siatka.offsetTop + siatka.offsetHeight - przycisk.offsetHeight),
    };
  };

  // Kapitulacja podmienia tekst na dluzszy, wiec przycisk rosnie JUZ po tym,
  // jak wylosowalismy pozycje. Bez tego doklejenia wychodzilby poza tablice.
  useLayoutEffect(() => {
    if (!gdzie) return;
    const g = granice();
    if (!g) return;
    const left = Math.min(Math.max(gdzie.left, g.minL), g.maksL);
    const top = Math.min(Math.max(gdzie.top, g.minG), g.maksG);
    if (left !== gdzie.left || top !== gdzie.top) ustawGdzie({ left, top });
  }, [gdzie, kapitulacja]);

  const skacz = () => {
    if (!gotowy.current) return;
    gotowy.current = false;
    // Dotyk nie ma najechania - przy `pointer: coarse` przycisk stoi w miejscu.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (skoki >= LIMIT_SKOKOW) {
      ustawKapitulacje(true);
      return;
    }
    const g = granice();
    if (!g) return;
    ustawGdzie({
      left: g.minL + Math.random() * (g.maksL - g.minL),
      top: g.minG + Math.random() * (g.maksG - g.minG),
    });
    ustawSkoki((n) => n + 1);
  };

  return (
    <button
      ref={przyciskRef}
      type="button"
      data-cta="wole-nie"
      data-skoki={skoki}
      // Rezerwacja miejsca na dluzszy tekst kapitulacji. Bez niej przycisk
      // ROSNIE w chwili podmiany napisu, a wtedy albo wychodzi poza tablice,
      // albo docisniecie go z powrotem przesuwa go przy czwartym najechaniu -
      // czyli lamie „przy czwartym zostaje". Miara idzie w ::after przez attr(),
      // a nie w drugim <span>, zeby nie wleciala do textContent przycisku.
      data-miara={TEKST_KAPITULACJI}
      className={gdzie ? "uciekinier uciekinier--skoczyl" : "uciekinier"}
      style={gdzie ? { left: `${gdzie.left}px`, top: `${gdzie.top}px` } : undefined}
      onMouseEnter={skacz}
      onMouseLeave={() => {
        gotowy.current = true;
      }}
      onClick={naWejscie}
    >
      <span className="uciekinier__napis">{kapitulacja ? TEKST_KAPITULACJI : TEKST_UCIEKA}</span>
    </button>
  );
}
