"use client";

import { useEffect, useRef, useState } from "react";

// 8 kwadratow goniacych kursor. Krok co 3 klatki rAF, skokowo (nie lerp) -
// ten sam charakter co dekoracje gif-less: malo klatek, zero wygladzania.

const ILE = 8;
const KROK_KLATEK = 3;

// Wylaczone gdy: uzytkownik prosi o mniej ruchu (Z10) albo urzadzenie dotykowe
// (kometa bez kursora nie ma sensu i tylko zjada baterie).
const ZAPYTANIE = "(prefers-reduced-motion: reduce), (pointer: coarse)";

export default function KometaKursora() {
  const [aktywna, setAktywna] = useState(false);
  const kwadraty = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mm = window.matchMedia(ZAPYTANIE);
    const przelicz = () => setAktywna(!mm.matches);
    przelicz();
    mm.addEventListener("change", przelicz);
    return () => mm.removeEventListener("change", przelicz);
  }, []);

  useEffect(() => {
    if (!aktywna) return;

    const ogon = Array.from({ length: ILE }, () => ({ x: -99, y: -99 }));
    let mysz = { x: -99, y: -99 };
    let klatka = 0;
    let id = 0;

    const petla = () => {
      id = requestAnimationFrame(petla);
      if (++klatka % KROK_KLATEK) return;
      for (let i = ILE - 1; i > 0; i--) ogon[i] = ogon[i - 1];
      ogon[0] = mysz;
      for (let i = 0; i < ILE; i++) {
        const el = kwadraty.current[i];
        if (el) el.style.transform = `translate3d(${ogon[i].x}px, ${ogon[i].y}px, 0)`;
      }
    };

    const start = () => {
      if (!id && !document.hidden) id = requestAnimationFrame(petla);
    };
    const stop = () => {
      if (id) cancelAnimationFrame(id);
      id = 0;
    };

    const ruch = (e: PointerEvent) => {
      mysz = { x: e.clientX, y: e.clientY };
    };
    // Karta w tle nie dostaje klatek: zero rAF, zero pracy (budzet z 03 C).
    const widocznosc = () => (document.hidden ? stop() : start());

    window.addEventListener("pointermove", ruch, { passive: true });
    document.addEventListener("visibilitychange", widocznosc);
    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", ruch);
      document.removeEventListener("visibilitychange", widocznosc);
    };
  }, [aktywna]);

  if (!aktywna) return null;

  return (
    <div className="kometa-kursora" aria-hidden="true" data-kometa="">
      {Array.from({ length: ILE }, (_, i) => (
        <div
          key={i}
          className="kometa-kursora__kwadrat"
          data-barwa={i % 3}
          ref={(el) => {
            kwadraty.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
