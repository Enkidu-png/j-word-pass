"use client";

import { useEffect, useRef, useState } from "react";
import LicznikMechaniczny from "@/components/LicznikMechaniczny";
import Pieczatka from "@/components/Pieczatka";
import { odprawCeremonie } from "@/lib/animacje";

const WARIANTY = [
  { klasa: "gif-less--blink", nazwa: "blink", opis: "znika i wraca, steps(2), 700 ms" },
  { klasa: "gif-less--majtanie", nazwa: "majtanie", opis: "kolysze sie ±12deg, steps(4), 900 ms" },
  { klasa: "gif-less--skok", nazwa: "skok", opis: "podskok o 6 px, steps(3), 500 ms" },
  { klasa: "gif-less--obrot", nazwa: "obrot", opis: "pelny obrot, steps(8), 1400 ms" },
  { klasa: "gif-less--jazda", nazwa: "jazda", opis: "przesuw kafla, steps(8), 1200 ms" },
  { klasa: "gif-less--chrom", nazwa: "chrom", opis: "blysk po gradiencie, steps(6), 1300 ms" },
  { klasa: "gif-less--tancz", nazwa: "tancz", opis: "odbicie scaleX, steps(2), 600 ms" },
];

const KAFLE = [
  { klasa: "kafel--kosmos", nazwa: "kosmos" },
  { klasa: "kafel--zebra", nazwa: "zebra" },
  { klasa: "kafel--urzad", nazwa: "urzad" },
  { klasa: "kafel--ogien", nazwa: "ogien" },
  { klasa: "kafel--morze", nazwa: "morze" },
];

// Desynchronizacja: kazda dekoracja ma wlasny start liczony z indeksu (03 sekcja B).
const opoznienie = (i: number) => `${(i * 137) % 900}ms`;

// Ceremonia demo: 3 kroki z twardym harmonogramem (03 sekcja E).
const KROKI_DEMO = ["KOMISJA ZASIADA", "KOMISJA WAZY DOWODY", "KOMISJA OGLASZA"];

function CeremoniaDemo() {
  const [krok, ustawKrok] = useState(-1);
  const [trwa, ustawTrwa] = useState(false);
  const przerwanie = useRef<AbortController | null>(null);
  const koniec = useRef<HTMLParagraphElement | null>(null);

  const pomin = () => przerwanie.current?.abort();

  const odpraw = async () => {
    przerwanie.current?.abort();
    const sterowanie = new AbortController();
    przerwanie.current = sterowanie;
    ustawKrok(-1);
    ustawTrwa(true);
    await odprawCeremonie(
      KROKI_DEMO.map((_, i) => ({ czasMs: 600, akcja: () => ustawKrok(i) })),
      sterowanie.signal,
    );
    ustawTrwa(false);
    // Z9: ceremonia konczy sie fokusem na sensownym elemencie
    koniec.current?.focus();
  };

  // Z8: kazda ceremonia da sie pominac Esc albo przyciskiem
  useEffect(() => {
    const klawisz = (e: KeyboardEvent) => {
      if (e.key === "Escape") pomin();
    };
    window.addEventListener("keydown", klawisz);
    return () => window.removeEventListener("keydown", klawisz);
  }, []);

  return (
    <div data-ceremonia="" style={{ border: "var(--ramka)", padding: "12px" }}>
      <button type="button" onClick={odpraw} data-odpraw="">
        ODPRAWIAM CEREMONIE
      </button>{" "}
      <button type="button" onClick={pomin} disabled={!trwa} data-pomin="">
        POMIJAM CEREMONIE
      </button>
      <ol>
        {KROKI_DEMO.map((tekst, i) => (
          <li key={tekst} data-krok={i} data-osiagniety={i <= krok ? "tak" : "nie"}>
            {i <= krok ? tekst : "..."}
          </li>
        ))}
      </ol>
      <p tabIndex={-1} ref={koniec} data-stan-koncowy={krok === KROKI_DEMO.length - 1 ? "tak" : "nie"}>
        STAN KONCOWY /// {krok === KROKI_DEMO.length - 1 ? "OSIAGNIETY" : "BRAK"}
      </p>
    </div>
  );
}

export default function Playground() {
  const [wartosc, ustawWartosc] = useState(0);
  const [wbicia, ustawWbicia] = useState(0);

  return (
    <main style={{ padding: "24px" }}>
      <h1 tabIndex={-1} className="gif-less gif-less--chrom" style={{ fontFamily: "var(--font-krzyk)" }}>
        PLAC PROB KOMISJI
      </h1>
      <p>DEKORACJE /// 7 WARIANTOW /// 5 KAFLI</p>

      <h2>WARIANTY gif-less</h2>
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "24px", listStyle: "none", padding: 0 }}>
        {WARIANTY.map((w, i) => (
          <li
            key={w.klasa}
            data-wariant={w.nazwa}
            style={{ width: "220px", border: "var(--ramka)", padding: "12px" }}
          >
            <div
              style={{
                height: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className={`gif-less ${w.klasa}`}
                style={{
                  animationDelay: opoznienie(i),
                  fontFamily: "var(--font-krzyk)",
                  backgroundImage:
                    w.klasa === "gif-less--jazda"
                      ? "repeating-linear-gradient(90deg, var(--chrom-a) 0 24px, var(--chrom-c) 24px 48px)"
                      : undefined,
                  display: "inline-block",
                  padding: "4px 10px",
                }}
              >
                KOMISJA
              </span>
            </div>
            <p style={{ fontSize: "var(--rozmiar-drobny)", margin: 0 }}>
              {w.nazwa} /// {w.opis}
            </p>
          </li>
        ))}
      </ul>

      <h2>KAFLE TLA</h2>
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "24px", listStyle: "none", padding: 0 }}>
        {KAFLE.map((k, i) => (
          <li key={k.klasa} data-kafel={k.nazwa}>
            <div
              className={`kafel-tla ${k.klasa}${k.klasa === "kafel--morze" ? " gif-less gif-less--jazda" : ""}`}
              style={{
                width: "220px",
                height: "120px",
                border: "var(--ramka)",
                animationDelay: opoznienie(i),
              }}
            />
            <p style={{ fontSize: "var(--rozmiar-drobny)", margin: 0 }}>{k.nazwa}</p>
          </li>
        ))}
      </ul>

      <h2>SCIANA DEKORACJI (budzet: 20 sztuk + kafel)</h2>
      <div
        className="kafel-tla kafel--kosmos"
        data-sciana=""
        style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "12px" }}
      >
        {Array.from({ length: 20 }, (_, i) => (
          <span
            key={i}
            className={`gif-less ${WARIANTY[i % WARIANTY.length].klasa}`}
            style={{
              animationDelay: opoznienie(i),
              display: "inline-block",
              width: "24px",
              height: "24px",
              background: "var(--chrom-b)",
            }}
          />
        ))}
      </div>

      <h2>CEREMONIA DEMO (3 KROKI, ESC POMIJA)</h2>
      <CeremoniaDemo />

      <h2>LICZNIK MECHANICZNY</h2>
      <div data-licznik-demo="" style={{ border: "var(--ramka)", padding: "12px" }}>
        <LicznikMechaniczny wartosc={wartosc} szerokosc={4} />
        <p>
          <button type="button" onClick={() => ustawWartosc((w) => w + 1)} data-plus1="">
            +1
          </button>{" "}
          <button type="button" onClick={() => ustawWartosc((w) => w + 10)} data-plus10="">
            +10
          </button>{" "}
          <button type="button" onClick={() => ustawWartosc(42)} data-na42="">
            NA 42
          </button>{" "}
          <button type="button" onClick={() => ustawWartosc(0)} data-reset="">
            ZERUJ
          </button>
        </p>
      </div>

      <h2>PIECZATKA</h2>
      <div data-pieczatka-demo="" style={{ border: "var(--ramka)", padding: "12px" }}>
        <button type="button" onClick={() => ustawWbicia((n) => n + 1)} data-wbij="">
          WBIJAM PIECZATKE
        </button>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {/* zmiana `key` remontuje komponent, czyli wbija stempel od nowa */}
          <Pieczatka key={`urzad-${wbicia}`} tekst="ZALACZONO" ton="urzad" obrocDeg={-8} />
          <Pieczatka key={`alarm-${wbicia}`} tekst="ODRZUCONO" ton="alarm" obrocDeg={6} />
          <Pieczatka key={`jad-${wbicia}`} tekst="ZALICZONO" ton="jad" />
        </div>
      </div>
    </main>
  );
}
