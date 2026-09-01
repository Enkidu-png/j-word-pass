"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LicznikMechaniczny from "@/components/LicznikMechaniczny";
import Pieczatka from "@/components/Pieczatka";
import Kwestionariusz, { type DaneDruku } from "./Kwestionariusz";
import Ognisko from "./Ognisko";
import { chceRedukcjiRuchu, odprawCeremonie, type KrokCeremonii } from "@/lib/animacje";
import { czytajStan, wyczyscStan, zapiszTeraz } from "@/lib/stan";

// Ceremonia `proba-ognia` -> `list-w-butelce` (plan/07 B). Harmonogram z tabeli
// co do milisekundy: 0-500 skladanie druku, 500-1500 spalanie, 1500-2600 morfoza
// dymu w butelke (4 klatki), 2600-3400 roleta morza i chlup. Suma 3400 ms, czyli
// grubo pod sufitem Z9, a Esc i tak przeskakuje od razu do stanu koncowego.

type Faza = "druk" | "skladanie" | "spalanie" | "dym" | "morze" | "butelka" | "pergamin";

const SKLADANIE_MS = 500;
const SPALANIE_MS = 1000;
const KLATKA_DYMU_MS = 275;   // 4 klatki morfozy = 1100 ms kroku 3
const MORZE_MS = 800;
const PERGAMIN_MS = 700;      // rozwiniecie zwoju (krok 6)

const CEREMONIA_TRWA: Faza[] = ["skladanie", "spalanie", "dym", "morze"];

export default function Plansza() {
  const router = useRouter();
  const [faza, ustawFaze] = useState<Faza>("druk");
  const [klatkaDymu, ustawKlatkeDymu] = useState(0);
  const [iskra, ustawIskre] = useState(0);
  const [ulotna, ustawUlotna] = useState(false);
  const [punkty, ustawPunkty] = useState(0);
  const [email, ustawEmail] = useState("");
  const przerwij = useRef<AbortController | null>(null);
  const butelka = useRef<HTMLDivElement>(null);
  const naglowekZwoju = useRef<HTMLHeadingElement>(null);

  // Powrot na URL po wysylce: od razu butelka, zero POST i zero teatru (07 C).
  useEffect(() => {
    const stan = czytajStan();
    ustawPunkty((stan?.egzamin?.punkty ?? 0) + (stan?.quiz?.punkty ?? 0));
    ustawEmail(stan?.ogien?.email ?? "");
    if (stan?.ogien?.wyslano) ustawFaze("butelka");
  }, []);

  // Z9: kazda faza konczy sie fokusem na sensownym elemencie
  useEffect(() => {
    if (faza === "butelka") butelka.current?.focus();
    if (faza === "pergamin") naglowekZwoju.current?.focus();
  }, [faza]);

  // Z8/Z9: Esc w krokach 1-4 przeskakuje do stanu koncowego, czyli do butelki
  useEffect(() => {
    if (!CEREMONIA_TRWA.includes(faza)) return;
    const naEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") przerwij.current?.abort();
    };
    window.addEventListener("keydown", naEsc);
    return () => window.removeEventListener("keydown", naEsc);
  }, [faza]);

  // POST leci OBOK teatru (07 B): ceremonia nie czeka na siec, a awaria daje
  // jedno ponowienie i dyskretny stempel o pamieci ulotnej.
  async function wyslij(dane: DaneDruku, punktyEgzamin: number, punktyQuiz: number) {
    for (const podejscie of [0, 1]) {
      try {
        const res = await fetch("/api/zgloszenie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...dane, punktyEgzamin, punktyQuiz }),
        });
        if (res.ok) {
          zapiszTeraz({ ogien: { wyslano: true } });
          return;
        }
        if (res.status < 500) break;
      } catch {
        // siec padla - drugie podejscie albo stempel o pamieci ulotnej
      }
      if (podejscie === 0) await new Promise((g) => setTimeout(g, 400));
    }
    ustawUlotna(true);
  }

  async function naPrzyjecie(dane: DaneDruku) {
    const stan = czytajStan();
    const zEgzaminu = stan?.egzamin?.punkty ?? 0;
    const zQuizu = stan?.quiz?.punkty ?? 0;
    ustawPunkty(zEgzaminu + zQuizu);
    ustawEmail(dane.email);
    zapiszTeraz({
      ogien: { email: dane.email, rozmiarButa: dane.rozmiarButa, srednicaUchaMm: dane.srednicaUchaMm },
    });
    // idempotencja (anty-spec 07 D2): raz wyslane zgloszenie nie leci drugi raz
    if (!stan?.ogien?.wyslano) void wyslij(dane, zEgzaminu, zQuizu);

    const sterownik = new AbortController();
    przerwij.current = sterownik;
    ustawKlatkeDymu(0);
    ustawFaze("skladanie");

    const kroki: KrokCeremonii[] = [
      { czasMs: SKLADANIE_MS, akcja: () => ustawFaze("spalanie") },
      { czasMs: SPALANIE_MS, akcja: () => { ustawFaze("dym"); ustawKlatkeDymu(0); } },
      { czasMs: KLATKA_DYMU_MS, akcja: () => ustawKlatkeDymu(1) },
      { czasMs: KLATKA_DYMU_MS, akcja: () => ustawKlatkeDymu(2) },
      { czasMs: KLATKA_DYMU_MS, akcja: () => ustawKlatkeDymu(3) },
      { czasMs: KLATKA_DYMU_MS, akcja: () => ustawFaze("morze") },
      { czasMs: MORZE_MS, akcja: () => { ustawFaze("butelka"); ustawKlatkeDymu(3); } },
    ];
    await odprawCeremonie(kroki, sterownik.signal);
  }

  async function otworzButelke() {
    if (faza !== "butelka") return;
    const sterownik = new AbortController();
    przerwij.current = sterownik;
    // Krok 6 to jeden ruch (korek + rozwiniecie zwoju), wiec ceremonia ma jeden
    // krok: reduced-motion skraca go do 300 ms, Esc oddaje pergamin natychmiast.
    await odprawCeremonie(
      [{ czasMs: PERGAMIN_MS, akcja: () => ustawFaze("pergamin") }],
      sterownik.signal,
    );
  }

  const rok = new Date().getFullYear();

  return (
    <div className="ogien__plansza" data-faza={faza}>
      {/* tlo sceny: ogien przygaszony, a w kroku 4 zjezdza po nim roleta morza */}
      <div className="ogien__tlo kafel-tla kafel--ogien" aria-hidden="true" />
      {(faza === "morze" || faza === "butelka" || faza === "pergamin") && (
        <div className="ogien__tlo ogien__tlo--morze kafel-tla kafel--morze" aria-hidden="true" />
      )}
      {faza === "spalanie" && <div className="ogien__blysk" aria-hidden="true" />}

      <div className="ogien__scena">
        {faza !== "morze" && faza !== "butelka" && faza !== "pergamin" && (
          <Ognisko iskra={iskra} bucha={faza === "spalanie"} />
        )}

        {faza === "druk" && (
          <Kwestionariusz naPrzyjecie={naPrzyjecie} naIskre={() => ustawIskre((n) => n + 1)} />
        )}

        {(faza === "skladanie" || faza === "spalanie") && (
          <div className="ogien__druk-w-locie" data-skladanie={faza} aria-hidden="true" />
        )}

        {faza === "dym" && (
          <div className="ogien__morfoza" data-klatka={klatkaDymu} aria-hidden="true">
            <svg viewBox="0 0 100 140" className="ogien__morfoza-svg">
              {klatkaDymu === 0 && (
                <g className="ogien__dym-ksztalt">
                  <circle cx="50" cy="96" r="20" />
                  <circle cx="34" cy="76" r="14" />
                  <circle cx="66" cy="72" r="12" />
                </g>
              )}
              {klatkaDymu === 1 && (
                <g className="ogien__dym-ksztalt">
                  <ellipse cx="50" cy="98" rx="22" ry="26" />
                  <ellipse cx="50" cy="62" rx="12" ry="18" />
                </g>
              )}
              {klatkaDymu === 2 && (
                <g className="ogien__dym-ksztalt ogien__dym-ksztalt--zarys">
                  <path d="M40 40 h20 v18 c14 10 16 20 16 34 v34 h-52 v-34 c0-14 2-24 16-34 Z" />
                </g>
              )}
              {klatkaDymu === 3 && <ButelkaSVG />}
            </svg>
          </div>
        )}

        {(faza === "butelka" || faza === "pergamin") && (
          <div className="ogien__morze-scena">
            <div
              className={`ogien__butelka${faza === "butelka" ? " gif-less" : ""}`}
              data-butelka=""
              role="button"
              tabIndex={0}
              ref={butelka}
              aria-label="Butelka z listem Komisji. Otwórz, żeby przeczytać decyzję."
              onClick={otworzButelke}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void otworzButelke();
                }
              }}
            >
              <svg viewBox="0 0 100 140" className="ogien__butelka-svg" aria-hidden="true">
                <ButelkaSVG otwarta={faza === "pergamin"} />
              </svg>
            </div>
            {faza === "butelka" && (
              <p className="ogien__dymek gif-less gif-less--blink" data-dymek="">KLIKNIJ</p>
            )}
            {/* Blob padl: stempel dyskretny i PO ceremonii, nigdy w jej trakcie (07 B) */}
            {ulotna && (
              <p className="formularz-F7 ogien__ulotna" data-ulotna="">KOMISJA ZAPISAŁA W PAMIĘCI ULOTNEJ</p>
            )}
            {/* chlup: 5 kropel, skokowo (07 B krok 4) */}
            {faza === "butelka" && (
              <span className="ogien__chlup" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="ogien__kropla ceremonia" data-kropla={i} />
                ))}
              </span>
            )}
          </div>
        )}

        {faza === "pergamin" && (
          <article className="formularz-F7 ogien__pergamin" data-pergamin="">
            <span className="ogien__pergamin-pieczec">
              <Pieczatka tekst="TAJNE" ton="alarm" obrocDeg={-14} />
            </span>
            <h2 className="ogien__pergamin-naglowek" tabIndex={-1} ref={naglowekZwoju}>
              DECYZJA KOMISJI NR OGN-3/TAJ/{rok}
            </h2>
            <p>
              Kandydatura przyjęta. ZADANIE otrzymasz w ciągu 3 dni roboczych na adres{" "}
              <span data-email-zwoju="">{email}</span>.
            </p>
            <p>Zadanie jest TAJNE. Udostępnianie go innym grozi śmiercią.</p>
            <p>Odwołań nie przewidziano. Gratulacji również.</p>
            <div className="ogien__podpisy" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <svg key={i} viewBox="0 0 90 30" className="ogien__gryzmol">
                  <path d={GRYZMOLY[i]} />
                </svg>
              ))}
            </div>
            <p className="ogien__dorobek">
              <span>DOROBEK ŻYCIA:</span>{" "}
              <span data-dorobek={punkty}>
                <LicznikMechaniczny wartosc={punkty} szerokosc={2} />
              </span>{" "}
              <span>/25</span>
            </p>
            <p className="ogien__data">DATA WYDANIA: {new Date().toLocaleDateString("pl-PL")}</p>
            <button
              className="ogien__od-nowa"
              type="button"
              data-od-nowa
              onClick={() => {
                wyczyscStan();
                router.push("/");
              }}
            >
              OD NOWA (KOMISJA NIE ZALECA)
            </button>
          </article>
        )}
      </div>
    </div>
  );
}

// Trzy odreczne gryzmoly glow komisji - jedna sciezka kazdy, zero plikow.
const GRYZMOLY = [
  "M4 22 C14 4 18 26 26 14 C32 5 36 24 44 16 C52 8 56 22 66 12 L84 20",
  "M6 18 C12 6 20 24 28 10 C34 0 38 22 46 12 C54 2 62 24 70 14 C76 8 80 18 86 12",
  "M4 14 C16 24 20 4 30 16 C38 26 42 6 52 16 C60 24 66 8 74 18 L86 10",
];

// Butelka z korkiem i zwinietym pergaminem w srodku (07 B krok 5 i 6).
function ButelkaSVG({ otwarta = false }: { otwarta?: boolean }) {
  return (
    <g>
      <path
        className="ogien__butelka-szklo"
        d="M40 40 h20 v18 c14 10 16 20 16 34 v34 h-52 v-34 c0-14 2-24 16-34 Z"
      />
      <rect className="ogien__butelka-zwoj" x="36" y="86" width="28" height="40" rx="4" />
      <path className="ogien__butelka-zwoj-linia" d="M42 96 h16 M42 106 h16 M42 116 h16" />
      <rect
        className={`ogien__butelka-korek${otwarta ? " ceremonia" : ""}`}
        data-korek={otwarta ? "wystrzelil" : "siedzi"}
        x="38"
        y="26"
        width="24"
        height="16"
        rx="3"
      />
    </g>
  );
}
