"use client";

import { useEffect, useRef, useState } from "react";
import egzamin from "@/data/egzamin.json";
import { czytajStan, zapiszStan } from "@/lib/stan";
import Arkusz from "./Arkusz";
import KartaDowodowa from "./KartaDowodowa";
import Scena from "./Scena";

// Wlasciciel stanu etapu 1: karty dowodowe wedruja ze sceny (lewa polowa) do
// slotow w arkuszu (prawa polowa), wiec obie polowy musza siedziec pod jednym
// komponentem. Przeciaganie na POINTER EVENTS (decyzja z krytyki planu - HTML5
// DnD jest nietestowalny przez Playwright dragTo).

const SLOTY = 6;
const ZALOZENIA = egzamin.zalozenia;
const PUSTE: (string | null)[] = Array.from({ length: SLOTY }, () => null);

export default function Plansza() {
  const [sloty, ustawSloty] = useState<(string | null)[]>(PUSTE);
  const [podniesiona, ustawPodniesiona] = useState<string | null>(null);
  const [celSlotu, ustawCelSlotu] = useState(0);
  const [wraca, ustawWraca] = useState<string | null>(null);
  const [ciagniona, ustawCiagniona] = useState<string | null>(null);
  // przeciagniecie ma zjesc klik, ktory przegladarka wysyla po pointerup
  const przeciagnieto = useRef(false);

  useEffect(() => {
    const zapisane = czytajStan()?.egzamin?.zalaczone;
    if (!zapisane?.length) return;
    ustawSloty(PUSTE.map((_, i) => zapisane[i] ?? null));
  }, []);

  function zapiszSloty(nowe: (string | null)[]) {
    ustawSloty(nowe);
    zapiszStan({ egzamin: { zalaczone: nowe.filter((id): id is string => id !== null) } });
  }

  function wolneSloty() {
    return sloty.map((id, i) => (id === null ? i : -1)).filter((i) => i >= 0);
  }

  function podnies(id: string) {
    ustawPodniesiona(id);
    ustawCelSlotu(wolneSloty()[0] ?? 0);
  }

  function upusc(id: string, slot: number) {
    if (sloty[slot] !== null) return false;
    const nowe = sloty.map((wpis, i) => (i === slot ? id : wpis === id ? null : wpis));
    zapiszSloty(nowe);
    ustawPodniesiona(null);
    return true;
  }

  function odrzuc(id: string) {
    // upuszczenie poza slotem: karta wraca skokiem (3 klatki)
    ustawPodniesiona(null);
    ustawWraca(id);
  }

  function zacznijCiagnac(id: string, e: React.PointerEvent<HTMLDivElement>) {
    // na dotyku obowiazuje tap-tap (05 C), zeby nie walczyc ze scrollem rolki
    if (e.pointerType === "touch" || sloty.includes(id)) return;
    const el = e.currentTarget;
    const prostokat = el.getBoundingClientRect();
    const chwytX = e.clientX - prostokat.left;
    const chwytY = e.clientY - prostokat.top;
    el.setPointerCapture(e.pointerId);
    przeciagnieto.current = false;
    el.style.width = `${prostokat.width}px`;

    const ruch = (ev: PointerEvent) => {
      // podniesienie dopiero na RUCHU: sam pointerdown to jeszcze zwykly klik
      // (tap-tap), a przedwczesne `podniesiona` zjadaloby pozniejszy onClick
      if (!przeciagnieto.current) {
        przeciagnieto.current = true;
        ustawCiagniona(id);
        ustawPodniesiona(id);
      }
      el.style.position = "fixed";
      el.style.left = `${ev.clientX - chwytX}px`;
      el.style.top = `${ev.clientY - chwytY}px`;
    };
    const koniec = (ev: PointerEvent) => {
      el.removeEventListener("pointermove", ruch);
      el.removeEventListener("pointerup", koniec);
      el.removeEventListener("pointercancel", koniec);
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.width = "";
      ustawCiagniona(null);
      if (!przeciagnieto.current) return; // zwykly klik obsluzy onClick
      const pod = document.elementFromPoint(ev.clientX, ev.clientY);
      const slot = pod?.closest("[data-slot]");
      const numer = slot ? Number(slot.getAttribute("data-slot")) : -1;
      if (numer < 0 || !upusc(id, numer)) odrzuc(id);
    };
    el.addEventListener("pointermove", ruch);
    el.addEventListener("pointerup", koniec);
    el.addEventListener("pointercancel", koniec);
  }

  function klawisz(id: string, e: React.KeyboardEvent<HTMLDivElement>) {
    if (sloty.includes(id)) return;
    const wolne = wolneSloty();
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (podniesiona === id) upusc(id, celSlotu);
      else podnies(id);
      return;
    }
    if (e.key === "Escape" && podniesiona === id) {
      ustawPodniesiona(null);
      return;
    }
    if (podniesiona !== id || wolne.length === 0) return;
    const krok = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (krok === 0) return;
    e.preventDefault();
    const teraz = Math.max(0, wolne.indexOf(celSlotu));
    ustawCelSlotu(wolne[(teraz + krok + wolne.length) % wolne.length]);
  }

  function karta(zalozenie: { id: string; tekst: string }, indeks: number, wSlocie: boolean) {
    return (
      <KartaDowodowa
        key={zalozenie.id}
        zalozenie={zalozenie}
        indeks={indeks}
        wSlocie={wSlocie}
        podniesiona={podniesiona === zalozenie.id}
        wraca={wraca === zalozenie.id}
        onPointerDown={(e) => zacznijCiagnac(zalozenie.id, e)}
        onClick={() => {
          if (przeciagnieto.current || wSlocie) return;
          if (podniesiona === zalozenie.id) ustawPodniesiona(null);
          else podnies(zalozenie.id);
        }}
        onKeyDown={(e) => klawisz(zalozenie.id, e)}
        onAnimationEnd={() => ustawWraca((w) => (w === zalozenie.id ? null : w))}
      />
    );
  }

  const luzne = ZALOZENIA.map((z, i) => [z, i] as const).filter(([z]) => !sloty.includes(z.id));

  return (
    <div className="egzamin__plansza">
      <Scena>
        <ul className="karty" data-karty="">
          {luzne.map(([z, i]) => (
            <li className="karty__miejsce" key={z.id} style={{ "--nr": i } as React.CSSProperties}>
              {karta(z, i, false)}
            </li>
          ))}
        </ul>
      </Scena>
      <Arkusz
        sloty={sloty.map((id) => {
          const i = ZALOZENIA.findIndex((z) => z.id === id);
          return i < 0 ? null : karta(ZALOZENIA[i], i, true);
        })}
        celSlotu={podniesiona ? celSlotu : -1}
        naSlot={(i) => {
          if (podniesiona) upusc(podniesiona, i);
        }}
        ciagniona={ciagniona !== null}
        zalaczone={sloty.filter(Boolean).length}
      />
    </div>
  );
}
