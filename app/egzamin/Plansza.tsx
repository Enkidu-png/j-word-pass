"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import komisja from "@/data/komisja.json";
import egzamin from "@/data/egzamin.json";
import { chceRedukcjiRuchu } from "@/lib/animacje";
import { czytajStan, zapiszStan } from "@/lib/stan";
import Arkusz from "./Arkusz";
import KartaDowodowa from "./KartaDowodowa";
import Narada, { type Werdykt } from "./Narada";
import Scena from "./Scena";

// Wlasciciel stanu etapu 1: karty dowodowe wedruja ze sceny (lewa polowa) do
// slotow w arkuszu (prawa polowa), wiec obie polowy musza siedziec pod jednym
// komponentem. Przeciaganie na POINTER EVENTS (decyzja z krytyki planu - HTML5
// DnD jest nietestowalny przez Playwright dragTo).

const SLOTY = 6;
const TEATR_MS = 3500;   // minimum narady, nawet gdy API odpowie od razu (05 B)
const CIERPLIWOSC_MS = 15_000;  // po tylu sekundach werdykt awaryjny
const SKIP_MS = 600;     // Esc: tyle jeszcze czekamy na API, potem awaryjnie
const ZALOZENIA = egzamin.zalozenia;
const PUSTE: (string | null)[] = Array.from({ length: SLOTY }, () => null);

function czekaj(ms: number): Promise<void> {
  return new Promise((spelnij) => setTimeout(spelnij, ms));
}

function werdyktAwaryjny(odpowiedz: string): Werdykt {
  // 05 B: punkty z dlugosci odpowiedzi, komentarz z puli zapasowej
  const pula = komisja.werdyktAwaryjny;
  console.warn("Komisja nieosiagalna - werdykt awaryjny");
  return {
    punkty: 6 + (odpowiedz.length % 5),
    komentarz: pula[Math.floor(Math.random() * pula.length)].tekst,
    awaryjny: true,
  };
}

async function zapytajKomisje(odpowiedz: string, dowody: number): Promise<Werdykt> {
  try {
    const res = await fetch("/api/ocena", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ odpowiedz, zalaczoneDowody: dowody }),
      signal: AbortSignal.timeout(CIERPLIWOSC_MS),
    });
    const dane = await res.json();
    if (!res.ok || typeof dane?.punkty !== "number") return werdyktAwaryjny(odpowiedz);
    return { punkty: dane.punkty, komentarz: dane.komentarz, awaryjny: false };
  } catch {
    return werdyktAwaryjny(odpowiedz);
  }
}

export default function Plansza() {
  const router = useRouter();
  const [faza, ustawFaze] = useState<"arkusz" | "narada" | "werdykt">("arkusz");
  const [werdykt, ustawWerdykt] = useState<Werdykt | null>(null);
  const [roleta, ustawRolete] = useState(false);
  const pominiecie = useRef<(() => void) | null>(null);
  const [sloty, ustawSloty] = useState<(string | null)[]>(PUSTE);
  const [podniesiona, ustawPodniesiona] = useState<string | null>(null);
  const [celSlotu, ustawCelSlotu] = useState(0);
  const [wraca, ustawWraca] = useState<string | null>(null);
  const [ciagniona, ustawCiagniona] = useState<string | null>(null);
  // przeciagniecie ma zjesc klik, ktory przegladarka wysyla po pointerup
  const przeciagnieto = useRef(false);

  useEffect(() => {
    const zapisany = czytajStan()?.egzamin;
    if (zapisany?.zalaczone?.length) {
      ustawSloty(PUSTE.map((_, i) => zapisany.zalaczone[i] ?? null));
    }
    // powrot na strone po ocenie: arkusz zablokowany, werdykt z sessionStorage
    if (zapisany?.punkty != null) {
      ustawWerdykt({ punkty: zapisany.punkty, komentarz: zapisany.komentarz ?? "", awaryjny: false });
      ustawFaze("werdykt");
    }
  }, []);

  // Esc pomija teatr i skacze do werdyktu (Z8/Z9)
  useEffect(() => {
    if (faza !== "narada") return;
    const naKlawisz = (e: KeyboardEvent) => {
      if (e.key === "Escape") pominiecie.current?.();
    };
    window.addEventListener("keydown", naKlawisz);
    return () => window.removeEventListener("keydown", naKlawisz);
  }, [faza]);

  function zakoncz(wynik: Werdykt) {
    ustawWerdykt(wynik);
    ustawFaze("werdykt");
    zapiszStan({ egzamin: { punkty: wynik.punkty, komentarz: wynik.komentarz } });
  }

  async function oceniaj(odpowiedz: string) {
    if (faza !== "arkusz") return;
    ustawFaze("narada");
    // pustka: 0/10 BEZ pytania AI (05 B) - ceremonia skrocona do jednego kroku
    if (odpowiedz.trim() === "") {
      await czekaj(chceRedukcjiRuchu() ? 300 : 900);
      zakoncz({ punkty: egzamin.punktyPuste, komentarz: "PUSTKA INTELEKTUALNA.", awaryjny: false });
      return;
    }
    const wynik = zapytajKomisje(odpowiedz, sloty.filter(Boolean).length);
    let pominieto = false;
    await Promise.race([
      czekaj(chceRedukcjiRuchu() ? 400 : TEATR_MS),
      new Promise<void>((spelnij) => {
        pominiecie.current = () => {
          pominieto = true;
          spelnij();
        };
      }),
    ]);
    pominiecie.current = null;
    // po Esc nie trzymamy kandydata w nieskonczonosc - albo API zdazy, albo awaryjnie
    zakoncz(
      pominieto
        ? await Promise.race([wynik, czekaj(SKIP_MS).then(() => werdyktAwaryjny(odpowiedz))])
        : await wynik,
    );
  }

  function doQuizu() {
    ustawRolete(true);
    // roleta zwija kosmos do gory, 900 ms, potem przejscie (05 B krok 6)
    setTimeout(() => router.push("/quiz"), chceRedukcjiRuchu() ? 300 : 900);
  }

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

  if (faza === "narada") {
    // ponytail: arkusz po prostu schodzi z ekranu. Krok 1 z 05 B (skladanie
    // w samolocik na clip-path) to czysta dekoracja bez AC - do dolozenia w F6,
    // gdyby zostal budzet.
    return (
      <div className="egzamin__narada">
        <Narada faza="narada" werdykt={null} naQuiz={doQuizu} />
      </div>
    );
  }

  return (
    <div className={roleta ? "egzamin__narada--roleta ceremonia" : ""}>
      {faza === "werdykt" && (
        <div className="egzamin__narada">
          <Narada faza="werdykt" werdykt={werdykt} naQuiz={doQuizu} />
        </div>
      )}
      <div className="egzamin__plansza" data-zablokowany={faza === "werdykt" ? "tak" : "nie"}>
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
        naOcene={oceniaj}
        zablokowany={faza === "werdykt"}
      />
      </div>
    </div>
  );
}
