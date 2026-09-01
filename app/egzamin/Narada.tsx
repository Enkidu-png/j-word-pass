"use client";

import { useEffect, useRef, useState } from "react";
import komisja from "@/data/komisja.json";
import LicznikMechaniczny from "@/components/LicznikMechaniczny";
import Pieczatka from "@/components/Pieczatka";

// Ceremonia narada-komisji i werdykt (plan/05 B). Czekaniem na AI jest teatr,
// nie spinner (anty-spec 05 D3), a wynik jest scena, nie modalem (05 D2).

export type Werdykt = { punkty: number; komentarz: string; awaryjny: boolean };

type Kwestia = { kto: string; tekst: string };

// trzy glowy komisji: imiona sa kanonem z data/komisja.json, nie z palca
const GLOWY = [...new Set(komisja.powitanie.map((k) => k.kto))];
const WARIANTY = ["gif-less--majtanie", "gif-less--skok", "gif-less--tancz"];
const CO_MS_DYMEK = 1800;
const CO_MS_GWIAZDKA = 90;

function pulaWerdyktu(punkty: number): Kwestia[] {
  // ponytail: prog wysoki = 9, bo skala AI to 6-10 (data/egzamin.json).
  if (punkty === 0) return komisja.werdyktZero;
  return punkty >= 9 ? komisja.werdyktWysoki : komisja.werdyktNiski;
}

export default function Narada({
  faza,
  werdykt,
  naQuiz,
}: {
  faza: "narada" | "werdykt";
  werdykt: Werdykt | null;
  naQuiz: () => void;
}) {
  const [dymek, ustawDymek] = useState(0);
  const [gwiazdek, ustawGwiazdek] = useState(0);
  const doQuizu = useRef<HTMLButtonElement>(null);

  // Z9: ceremonia konczy sie fokusem na sensownym elemencie
  useEffect(() => {
    if (faza === "werdykt") doQuizu.current?.focus();
  }, [faza]);

  // dymki losuja sie co 1,8 s i NIGDY nie powtarzaja poprzedniej kwestii
  useEffect(() => {
    if (faza !== "narada") return;
    const id = setInterval(() => {
      ustawDymek((teraz) => {
        const inne = komisja.ocenianie.map((_, i) => i).filter((i) => i !== teraz);
        return inne[Math.floor(Math.random() * inne.length)];
      });
    }, CO_MS_DYMEK);
    return () => clearInterval(id);
  }, [faza]);

  // werbel: gwiazdki zapalaja sie kolejno po 90 ms
  useEffect(() => {
    if (faza !== "werdykt" || !werdykt) return;
    if (gwiazdek >= werdykt.punkty) return;
    const id = setTimeout(() => ustawGwiazdek((n) => n + 1), CO_MS_GWIAZDKA);
    return () => clearTimeout(id);
  }, [faza, werdykt, gwiazdek]);

  const kwestia = komisja.ocenianie[dymek];

  return (
    <section className="narada formularz-F7" data-narada={faza} aria-live="polite">
      <ul className="narada__stol">
        {GLOWY.map((kto, i) => (
          <li className="narada__miejsce" key={kto}>
            <span className={`narada__glowa gif-less ${WARIANTY[i]}`} style={{ animationDelay: `${i * 137}ms` }}>
              <svg viewBox="0 0 60 60" role="img" aria-label={kto}>
                <rect className="narada__czacha" x="8" y="8" width="44" height="44" rx="10" />
                <circle className="narada__oko" cx="22" cy="28" r="4" />
                <circle className="narada__oko" cx="38" cy="28" r="4" />
                <path className="narada__usta" d={i === 1 ? "M20 42h20" : "M20 44q10 -8 20 0"} />
              </svg>
            </span>
            <span className="narada__kto">{kto}</span>
          </li>
        ))}
      </ul>

      {faza === "narada" && (
        <>
          <p className="narada__dymek" data-dymek="">
            {kwestia.tekst}
          </p>
          {/* kartka lata miedzy glowami po trojkacie, 6 klatek */}
          <span className="narada__kartka gif-less gif-less--trojkat" data-kartka="" aria-hidden="true" />
          <span className="tylko-dla-czytnika">Komisja obraduje nad odpowiedzią.</span>
        </>
      )}

      {faza === "werdykt" && werdykt && (
        <div className="narada__werdykt" data-werdykt={werdykt.punkty}>
          <ul className="narada__gwiazdki" data-gwiazdki={gwiazdek} aria-label={`Punkty: ${werdykt.punkty} na 10`}>
            {Array.from({ length: 10 }, (_, i) => (
              <li key={i} className="narada__gwiazdka" data-pelna={i < gwiazdek ? "tak" : "nie"} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 2.5-7.5L3 9h7z" />
                </svg>
              </li>
            ))}
          </ul>
          <span className="narada__punkty">
            <LicznikMechaniczny wartosc={werdykt.punkty} szerokosc={2} />
            <span className="narada__na10">/10</span>
          </span>

          <span className="narada__pieczec">
            <Pieczatka
              tekst={werdykt.punkty === 0 ? "0/10 - PUSTKA" : `${werdykt.punkty}/10 - ZDANO`}
              ton={werdykt.punkty === 0 ? "alarm" : "jad"}
              obrocDeg={-7}
            />
            <strong className="narada__podpis-pieczeci">
              {werdykt.punkty === 0 ? "PUSTKA INTELEKTUALNA - 0 PKT" : "KOMISJA ORZEKA I PODBIJA"}
            </strong>
          </span>

          <div className="narada__druk formularz-F7">
            <p className="narada__komentarz" data-komentarz="">
              {werdykt.komentarz}
            </p>
            <ul className="narada__podpisy">
              {GLOWY.map((kto) => {
                const pula = pulaWerdyktu(werdykt.punkty);
                const kwestiaGlowy = pula.find((k) => k.kto === kto) ?? pula[0];
                return (
                  <li key={kto}>
                    <span className="narada__kto">{kto}</span>
                    <span className="narada__cytat">{kwestiaGlowy.tekst}</span>
                  </li>
                );
              })}
            </ul>
            {werdykt.awaryjny && (
              <p className="narada__awaria gif-less gif-less--blink" data-awaryjny="">
                PROTOKÓŁ AWARYJNY. ŁĄCZE Z KOMISJĄ NADRZĘDNĄ PADŁO.
              </p>
            )}
          </div>

          <button type="button" ref={doQuizu} className="arkusz__cta" data-do-quizu="" onClick={naQuiz}>
            PRZYJMUJĘ WERDYKT, ŻĄDAM QUIZU
          </button>
        </div>
      )}
    </section>
  );
}
