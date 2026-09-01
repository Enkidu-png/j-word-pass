"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import pytania from "@/data/quiz.json";
import komisja from "@/data/komisja.json";
import Pieczatka from "@/components/Pieczatka";
import { odprawCeremonie, type KrokCeremonii } from "@/lib/animacje";
import { czytajStan, zapiszStan, zapiszTeraz } from "@/lib/stan";
import { dopasujOtwarte, policzQuiz, type Werdykt15 } from "@/lib/quiz";
import { SIGNATURE } from "./signature";
import MaszynaPrawdy from "./MaszynaPrawdy";

// Segregator akt (plan/06 A): 15 teczek w stosie, zakladki po prawej, jedna
// teczka otwarta naraz. Wybor wariantu to natywne radio - wyglada jak odreczny
// krzyzyk, ale klawiatura i czytnik ekranu dostaja zwykly formularz.
//
// Anty-spec 06 F2: przy zaznaczaniu NIE MA ZADNEJ OCENY. Klucz odpowiedzi trafia
// do DOM dopiero w trybie rewizji, po werdykcie maszyny prawdy. Jedyny wyjatek
// wczesniej to pytanie 14 (znacznik dla signature `skala-twardosci`, zart).

const WARIANTY = ["A", "B", "C", "D"] as const;
const OSTATNIA = pytania.length;
const START_MS = 600; // krok 1: maszyna sie rozklada
const KROK_MS = 400; // krok 2: jedna teczka na 400 ms
const FINAL_MS = 600; // krok 3: dym, korba, wynik
const LOT_MS = 600; // przejscie do ognia: lot samolocika przed zaplonem
const OGIEN_MS = 800; // zaplon i rozlewanie sie ognia po ekranie

type Odpowiedzi = Record<number, string>;
type Przejscie = "lot" | "plonie" | "ogien";

function numer(n: number): string {
  return String(n).padStart(2, "0");
}

function kwestiaWerdyktu(punkty: number) {
  const pula = punkty === 0 ? komisja.werdyktZero : punkty >= 8 ? komisja.werdyktWysoki : komisja.werdyktNiski;
  return pula[Math.floor(Math.random() * pula.length)];
}

export default function Segregator() {
  const router = useRouter();
  const [otwarta, ustawOtwarta] = useState(1);
  const [odpowiedzi, ustawOdpowiedzi] = useState<Odpowiedzi>({});
  const [faza, ustawFaze] = useState<"akta" | "maszyna" | "wynik">("akta");
  const [werdykty, ustawWerdykty] = useState<Record<number, Werdykt15>>({});
  const [punkty, ustawPunkty] = useState<number | null>(null);
  const [wLeju, ustawWLeju] = useState(1);
  const [dymi, ustawDymi] = useState(false);
  const [pytaOBraki, ustawPytaOBraki] = useState(false);
  const [przejscie, ustawPrzejscie] = useState<Przejscie | null>(null);
  const naglowek = useRef<HTMLHeadingElement>(null);
  const doOgnia = useRef<HTMLButtonElement>(null);
  const fokusNaTeczke = useRef(false);
  const przerwij = useRef<AbortController | null>(null);
  const kwestia = useRef<{ kto: string; tekst: string } | null>(null);

  useEffect(() => {
    // To, co kandydat zdazyl zaznaczyc albo wpisac PRZED hydracja, jest wazniejsze
    // niz zapis z sessionStorage - inaczej React nadpisalby swiezy wybor (lekcja
    // z F3-04: `useEffect` czytajacy zapis potrafi skasowac robote uzytkownika).
    const zDom: Odpowiedzi = {};
    for (const el of Array.from(document.querySelectorAll<HTMLInputElement>("[data-wariant]"))) {
      if (el.checked) zDom[Number(el.name.replace("pytanie-", ""))] = el.value;
    }
    const luka = document.querySelector<HTMLInputElement>("[data-luka]");
    if (luka?.value) zDom[Number(luka.dataset.pytanie)] = luka.value;

    const zapis = czytajStan()?.quiz;
    const zapisane = { ...(zapis?.odpowiedzi ?? {}), ...zDom };
    ustawOdpowiedzi(zapisane);

    // 06 E: powrot na etap juz zaliczony wchodzi od razu w tryb rewizji
    if (zapis?.punkty != null) {
      ustawWerdykty(policzQuiz(pytania, zapisane).werdykty);
      ustawPunkty(zapis.punkty);
      kwestia.current = kwestiaWerdyktu(zapis.punkty);
      ustawFaze("wynik");
    }
  }, []);

  // Z9: po zmianie teczki fokus ląduje na jej naglowku, ale tylko gdy zmiane
  // wywolala klawiatura albo przycisk nawigacji - nie kradniemy fokusu na starcie.
  useEffect(() => {
    if (!fokusNaTeczke.current) return;
    fokusNaTeczke.current = false;
    naglowek.current?.focus();
  }, [otwarta]);

  // Z9: ceremonia konczy sie fokusem na sensownym elemencie
  useEffect(() => {
    if (faza === "wynik") doOgnia.current?.focus();
  }, [faza]);

  // Z8/Z9: kazda ceremonia da sie pominac Esc - takze przejscie do proby ognia
  useEffect(() => {
    if (faza !== "maszyna" && przejscie === null) return;
    const naEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") przerwij.current?.abort();
    };
    window.addEventListener("keydown", naEsc);
    return () => window.removeEventListener("keydown", naEsc);
  }, [faza, przejscie]);

  function otworz(id: number, zFokusem = true) {
    fokusNaTeczke.current = zFokusem;
    ustawOtwarta(Math.min(OSTATNIA, Math.max(1, id)));
  }

  function zapisz(id: number, wartosc: string) {
    // Z11: kazda zmiana leci do sessionStorage (debounce 400 ms siedzi w lib/stan).
    const nowe = { ...odpowiedzi, [id]: wartosc };
    ustawOdpowiedzi(nowe);
    zapiszStan({ quiz: { odpowiedzi: nowe } });
  }

  // Strzalki obsługujemy TYLKO gdy fokus siedzi w segregatorze (Z15: poza nim
  // strzalka ma dalej przewijac strone, bo tak dziala przegladarka).
  function naKlawisz(e: React.KeyboardEvent<HTMLDivElement>) {
    const cel = e.target as HTMLElement;
    if (cel.tagName === "INPUT" || cel.tagName === "TEXTAREA") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      otworz(otwarta + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      otworz(otwarta - 1);
    }
  }

  const braki = pytania.filter((p) => !(odpowiedzi[p.id] ?? "").trim()).length;

  function oddajAkta() {
    if (braki > 0 && !pytaOBraki) {
      ustawPytaOBraki(true);
      return;
    }
    ustawPytaOBraki(false);
    void maszynaPrawdy();
  }

  async function maszynaPrawdy() {
    const pelne = policzQuiz(pytania, odpowiedzi);
    kwestia.current = kwestiaWerdyktu(pelne.punkty);
    const sterownik = new AbortController();
    przerwij.current = sterownik;
    ustawWerdykty({});
    ustawDymi(false);
    ustawWLeju(1);
    ustawFaze("maszyna");

    const kroki: KrokCeremonii[] = [
      { czasMs: START_MS, akcja: () => ustawWLeju(1) },
      ...pytania.map((p, i) => ({
        czasMs: KROK_MS,
        akcja: () => {
          ustawWerdykty((w) => ({ ...w, [p.id]: pelne.werdykty[p.id] }));
          ustawWLeju(Math.min(OSTATNIA, i + 2));
          if (i === OSTATNIA - 1) ustawDymi(true);
        },
      })),
      {
        czasMs: FINAL_MS,
        akcja: () => {
          // stan koncowy: komplet werdyktow naraz (to samo dostaje Esc)
          ustawWerdykty(pelne.werdykty);
          ustawPunkty(pelne.punkty);
          ustawFaze("wynik");
          // werdykt zapisuje sie NATYCHMIAST - debounce zjadlby go przy szybkim F5
          zapiszTeraz({ quiz: { odpowiedzi, punkty: pelne.punkty } });
        },
      },
    ];
    await odprawCeremonie(kroki, sterownik.signal);
  }

  async function doProbyOgnia() {
    const sterownik = new AbortController();
    przerwij.current = sterownik;
    ustawPrzejscie("lot");
    await odprawCeremonie(
      [
        { czasMs: LOT_MS, akcja: () => ustawPrzejscie("plonie") },
        { czasMs: OGIEN_MS, akcja: () => ustawPrzejscie("ogien") },
        { czasMs: OGIEN_MS, akcja: () => router.push("/proba-ognia") },
      ],
      sterownik.signal,
    );
  }

  const p = pytania[otwarta - 1];
  const wpis = odpowiedzi[p.id] ?? "";
  const Sig = SIGNATURE[p.signature];
  const rewizja = faza === "wynik";

  return (
    <div className="segregator" data-segregator="" data-faza={faza} onKeyDown={naKlawisz}>
      <ol className="segregator__zakladki" data-zakladki="">
        {pytania.map((q) => (
          <li key={q.id}>
            <button
              type="button"
              className="zakladka"
              data-zakladka={q.id}
              data-otwarta={q.id === otwarta ? "tak" : "nie"}
              data-wypelniono={odpowiedzi[q.id] ? "tak" : "nie"}
              data-werdykt={werdykty[q.id] ?? ""}
              aria-current={q.id === otwarta ? "true" : undefined}
              onClick={() => otworz(q.id)}
            >
              <span className="zakladka__numer">{numer(q.id)}</span>
              <span className="zakladka__kategoria">{q.kategoria}</span>
              {odpowiedzi[q.id] ? <span className="zakladka__stempel">WYPEŁNIONO</span> : null}
            </button>
          </li>
        ))}
      </ol>

      {faza === "maszyna" ? (
        <MaszynaPrawdy teczka={wLeju} ostatni={werdykty[wLeju - 1] ?? null} trafienia={Object.values(werdykty).filter((w) => w === "prawda").length} dymi={dymi} />
      ) : (
        /* key = numer teczki: remontaz odpala 2-klatkowe rozlozenie od nowa */
        <section key={p.id} className="teczka formularz-F7" data-teczka={p.id} data-rewizja={rewizja ? "tak" : "nie"}>
          <h2 className="teczka__naglowek" data-naglowek-teczki="" tabIndex={-1} ref={naglowek}>
            AKTA NR {numer(p.id)}/{OSTATNIA} /// {p.kategoria.toUpperCase()}
          </h2>
          <p className="teczka__pytanie">{p.pytanie}</p>

          {p.typ === "otwarte" ? (
            <p className="teczka__luka-wiersz">
              <label htmlFor="luka-14">WPISUJĘ W LUKĘ:</label>{" "}
              <input
                id="luka-14"
                className="teczka__luka"
                type="text"
                autoComplete="off"
                data-luka=""
                data-pytanie={p.id}
                placeholder="...................."
                value={wpis}
                readOnly={rewizja}
                onChange={(e) => zapisz(p.id, e.target.value)}
              />
              {rewizja ? (
                <span className="teczka__klucz" data-klucz="">
                  KOMISJA UZNAJE: {p.kluczOtwarte?.join(" /// ")}
                </span>
              ) : null}
            </p>
          ) : (
            <ul className="teczka__warianty" data-warianty="">
              {WARIANTY.map((w) => (
                <li key={w}>
                  <label
                    className="wariant"
                    data-wariant-etykieta={w}
                    data-rewizja={
                      !rewizja ? undefined : w === p.poprawna ? "poprawna" : wpis === w ? "bledna" : undefined
                    }
                  >
                    <input
                      className="tylko-dla-czytnika"
                      type="radio"
                      name={`pytanie-${p.id}`}
                      value={w}
                      data-wariant={w}
                      checked={wpis === w}
                      disabled={rewizja}
                      onChange={() => zapisz(p.id, w)}
                    />
                    <span className="wariant__pudlo" aria-hidden="true">
                      <svg viewBox="0 0 16 16">
                        <path className="wariant__krzyzyk" d="M3 3 L13 13 M13 3 L3 13" />
                      </svg>
                    </span>
                    <span className="wariant__tresc">
                      {w}. {p.warianty?.[w]}
                    </span>
                    {rewizja && wpis === w && w !== p.poprawna ? (
                      <svg className="wariant__skreslenie" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M2 4 C30 14 70 6 98 16" />
                        <path d="M2 15 C34 7 68 15 98 5" />
                      </svg>
                    ) : null}
                  </label>
                </li>
              ))}
            </ul>
          )}

          {/* Signature pytania (plan/06 D). Dla pytania 14 znacznik trafienia jest
              tutaj: signature `skala-twardosci` ma na nim blysnac (jedyny dopuszczony
              sygnal poprawnosci przed maszyna prawdy, 06 F2). */}
          <div
            className="teczka__signature"
            data-signature={p.signature}
            data-otwarte-trafione={
              p.typ === "otwarte" ? (dopasujOtwarte(wpis, p.kluczOtwarte) ? "tak" : "nie") : undefined
            }
          >
            {Sig ? <Sig /> : null}
          </div>

          <p className="teczka__nawigacja">
            <button type="button" data-poprzednia="" disabled={otwarta === 1} onClick={() => otworz(otwarta - 1)}>
              POPRZEDNIA
            </button>{" "}
            <button type="button" data-nastepna="" disabled={otwarta === OSTATNIA} onClick={() => otworz(otwarta + 1)}>
              NASTĘPNA TECZKA
            </button>
          </p>
        </section>
      )}

      {faza === "akta" ? (
        <p className="segregator__oddanie">
          <button type="button" className="segregator__oddaj" data-oddaj="" onClick={oddajAkta}>
            ODDAJĘ AKTA DO WERYFIKACJI
          </button>
        </p>
      ) : null}

      {pytaOBraki ? (
        <div className="formularz-F7 segregator__potwierdzenie" data-potwierdzenie="" role="alert">
          <p className="segregator__druk">CZY NA PEWNO? {braki} TECZEK ŚWIECI PUSTKĄ</p>
          <button type="button" data-wracam="" onClick={() => ustawPytaOBraki(false)}>
            WRACAM
          </button>{" "}
          <button type="button" data-niech-sie-dzieje="" onClick={oddajAkta}>
            NIECH SIĘ DZIEJE
          </button>
        </div>
      ) : null}

      {faza === "wynik" && punkty !== null ? (
        <section className="wynik formularz-F7" data-wynik={punkty} aria-live="polite">
          <span className="wynik__pieczec">
            <Pieczatka tekst={`${punkty}/15`} ton={punkty >= 8 ? "jad" : "urzad"} obrocDeg={-6} />
          </span>
          <p className="wynik__kwestia" data-kwestia="">
            {kwestia.current ? `${kwestia.current.kto}: ${kwestia.current.tekst}` : null}
          </p>
          <p className="wynik__rewizja">REWIZJA: KLIKNIJ ZAKŁADKĘ, ŻEBY ZOBACZYĆ AKTA Z ODPOWIEDZIĄ KOMISJI.</p>
          <button type="button" data-do-ognia="" ref={doOgnia} onClick={doProbyOgnia}>
            WZYWAM PRÓBĘ OGNIA
          </button>
        </section>
      ) : null}

      {przejscie ? (
        <div className="podanie-do-ognia ceremonia" data-przejscie={przejscie} aria-hidden="true">
          <span className="podanie__samolocik">
            <svg viewBox="0 0 60 30">
              <path d="M2 4 L58 12 L20 18 L14 28 L10 18 Z" />
            </svg>
            {przejscie !== "lot" ? (
              <span className="podanie__plomienie gif-less">
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ animationDelay: `${i * 137}ms` }} />
                ))}
              </span>
            ) : null}
          </span>
        </div>
      ) : null}
    </div>
  );
}
