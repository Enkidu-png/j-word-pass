"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Pieczatka from "@/components/Pieczatka";
import { chceRedukcjiRuchu, odprawCeremonie } from "@/lib/animacje";

// ETAP 0: przedsionek urzedu. Ma zrobic wrazenie sciany ruchu i wpuscic dalej.
// Zero hero z podtytulem i dwoma przyciskami w rzedzie (anty-spec 01 D1) -
// tresc siedzi na drukach porozrzucanych po tablicy ogloszen.

const PION = "SYSTEM PRZEPUSTEK";

// Tablica ogloszen: kazdy element ma inna dekoracje i wlasne opoznienie,
// zeby nic nie chodzilo wspolnym zegarem (03 sekcja B).
const OGLOSZENIA = [
  { id: "uwaga", wariant: "gif-less--blink", gora: "4%", lewo: "6%" },
  { id: "wzor", wariant: "gif-less--obrot", gora: "8%", lewo: "72%" },
  { id: "zebra", wariant: "gif-less--tancz", gora: "58%", lewo: "4%" },
  { id: "nadzor", wariant: "gif-less--majtanie", gora: "26%", lewo: "78%" },
  { id: "rozdzielczosc", wariant: "gif-less--skok", gora: "70%", lewo: "70%" },
  { id: "czuwa", wariant: "gif-less--blink", gora: "46%", lewo: "84%" },
  { id: "petla", wariant: "gif-less--majtanie", gora: "80%", lewo: "34%" },
];

const ZEBRA = String.raw`
  /\_/\
 ( o.o )  ||||||
  > ^ <   ||||||
`;

const ROGI = [
  { top: "4%", left: "4%" },
  { top: "4%", left: "72%" },
  { top: "72%", left: "4%" },
  { top: "72%", left: "72%" },
];

export default function Brama() {
  const router = useRouter();
  const [krokCeremonii, ustawKrok] = useState(0);
  const [wchodzi, ustawWchodzi] = useState(false);
  const przerwanie = useRef<AbortController | null>(null);

  const [ucieczki, ustawUcieczki] = useState(0);
  const [rog, ustawRog] = useState<number | null>(null);
  const [dotyk, ustawDotyk] = useState(false);

  useEffect(() => {
    ustawDotyk(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Ceremonia wejscia wg tabeli plan/04 B: pieczatka, szuflada akt, przejscie.
  async function wejdz() {
    if (wchodzi) return;
    ustawWchodzi(true);
    // Z10: przy ograniczonym ruchu ceremonia to JEDEN krok - zaslona pojawia
    // sie od razu z fadem 300 ms, a odprawCeremonie wykonuje tylko przejscie.
    if (chceRedukcjiRuchu()) ustawKrok(2);
    const sterowanie = new AbortController();
    przerwanie.current = sterowanie;
    await odprawCeremonie(
      [
        { czasMs: 0, akcja: () => ustawKrok(1) },
        { czasMs: 400, akcja: () => ustawKrok(2) },
        {
          czasMs: 1200,
          akcja: () => {
            ustawKrok(3);
            router.push("/egzamin");
            przeniesFokus();
          },
        },
      ],
      sterowanie.signal,
    );
  }

  // Z9: fokus ląduje na nagłówku nowego etapu. Nawigacja klienta jest
  // asynchroniczna, więc czekamy na nagłówek etapu, a nie na sztywny timeout.
  function przeniesFokus() {
    const doKiedy = Date.now() + 3000;
    const szukaj = () => {
      const naglowek = document.querySelector<HTMLElement>('h1[tabindex="-1"]');
      if (naglowek) return naglowek.focus();
      if (Date.now() < doKiedy) requestAnimationFrame(szukaj);
    };
    requestAnimationFrame(szukaj);
  }

  useEffect(() => {
    const klawisz = (e: KeyboardEvent) => {
      if (e.key === "Escape") przerwanie.current?.abort();
    };
    window.addEventListener("keydown", klawisz);
    return () => window.removeEventListener("keydown", klawisz);
  }, []);

  // Przycisk-uciekinier: ucieka WYLACZNIE przed myszą. Fokus klawiatury go nie
  // płoszy (a11y), dotyk też nie - tam od razu kapituluje.
  const skapitulowal = ucieczki >= 3 || dotyk;
  function sploszSie() {
    if (skapitulowal) return;
    ustawUcieczki((n) => n + 1);
    ustawRog(Math.floor(Math.random() * ROGI.length));
  }

  return (
    <main className="brama">
      <h1 className="brama__krzyk gif-less gif-less--chrom">J-WORD PASS</h1>
      {/* pionowy napis to obrazek z liter - bez role="img" aria-label na <p> jest zabroniony */}
      <p className="brama__pion" role="img" aria-label={PION}>
        {PION.split("").map((z, i) => (
          <span key={i} aria-hidden="true">
            {z === " " ? " " : z}
          </span>
        ))}
      </p>

      <div className="brama__tablica">
        {OGLOSZENIA.map((o, i) => (
          <div
            key={o.id}
            data-ogloszenie={o.id}
            className={`brama__ogloszenie gif-less ${o.wariant}`}
            style={{ top: o.gora, left: o.lewo, animationDelay: `${(i * 137) % 900}ms` }}
          >
            {o.id === "uwaga" ? <strong>UWAGA! EGZAMIN TRWA</strong> : null}
            {o.id === "wzor" ? <Pieczatka tekst="WZÓR" ton="urzad" dekoracyjna /> : null}
            {o.id === "zebra" ? <pre className="brama__zebra">{ZEBRA}</pre> : null}
            {o.id === "nadzor" ? <span>pod nadzorem od 1998</span> : null}
            {o.id === "rozdzielczosc" ? (
              <span className="brama__odznaka">NAJLEPIEJ OGLĄDAĆ W 800x600</span>
            ) : null}
            {o.id === "czuwa" ? <strong>KOMISJA CZUWA</strong> : null}
            {o.id === "petla" ? <span>AKTA W OBIEGU /// NIE WYNOSIĆ</span> : null}
          </div>
        ))}

        <section className="formularz-F7 brama__wniosek">
          <h2>WNIOSEK O DOPUSZCZENIE DO EGZAMINU</h2>
          <p>
            POUCZENIE: system składa się z trzech etapów. Wyniki są ostateczne. Odwołania
            rozpatruje niszczarka.
          </p>
          <p className="brama__akcje">
            <button type="button" className="brama__cta" data-cta="" onClick={wejdz}>
              SKŁADAM WNIOSEK I WCHODZĘ
            </button>
          </p>
          <button
            type="button"
            className="brama__uciekinier"
            data-uciekinier=""
            data-ucieczki={ucieczki}
            style={rog === null ? undefined : ROGI[rog]}
            onMouseEnter={sploszSie}
            onClick={wejdz}
          >
            {skapitulowal ? "DOBRA, I TAK MUSISZ" : "WOLĘ NIE"}
          </button>
        </section>
      </div>

      {krokCeremonii >= 1 ? (
        <div className="brama__stempel" data-stempel="">
          <Pieczatka tekst="PRZYJĘTO" ton="urzad" obrocDeg={-10} />
        </div>
      ) : null}
      {krokCeremonii >= 2 ? (
        <div className="ceremonia brama__szuflada" data-szuflada="" aria-hidden="true" />
      ) : null}
    </main>
  );
}
