"use client";

import { useEffect, useRef, useState } from "react";
import NapisObrazek from "./NapisObrazek";
import Ozdoba from "./Ozdoba";

// Trzy warstwy, wszystkie stoja prosto (plan/04 E, Z6). Liczba plomieni zalezy
// od SZEROKOSCI napisu na ekranie, a tej nie da sie znac przy renderze na serwerze,
// wiec mierzymy ja ResizeObserverem i przeliczamy przy kazdej zmianie rozmiaru.
const ROZSTAW = 60;
const OPOZNIENIE = 90;

export default function PlonacyNapis({ tekst }: { tekst: string }) {
  const ramka = useRef<HTMLDivElement>(null);
  const [plomieni, ustawPlomieni] = useState(0);

  useEffect(() => {
    const el = ramka.current;
    if (!el) return;
    const przelicz = () => ustawPlomieni(Math.ceil(el.getBoundingClientRect().width / ROZSTAW));
    przelicz();
    const ro = new ResizeObserver(przelicz);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ramka} data-plonacy={tekst} className="plonacy">
      <div data-plonacy-warstwa="poswiata" className="plonacy__poswiata" />
      <div className="plonacy__napis">
        <NapisObrazek tekst={tekst} wariant="chrom" />
      </div>
      <div data-plonacy-warstwa="ogien" className="plonacy__ogien">
        {Array.from({ length: plomieni }, (_, i) => (
          <span
            key={i}
            className="plonacy__plomien"
            style={{ left: `${i * ROZSTAW}px`, animationDelay: `${i * OPOZNIENIE}ms` }}
          >
            <Ozdoba id="ogien" />
          </span>
        ))}
      </div>
    </div>
  );
}
