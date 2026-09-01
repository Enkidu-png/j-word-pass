"use client";

import { useEffect, useRef, useState } from "react";
import pytania from "@/data/quiz.json";
import { czytajStan, zapiszStan } from "@/lib/stan";
import { dopasujOtwarte } from "@/lib/quiz";
import { SIGNATURE } from "./signature";

// Segregator akt (plan/06 A): 15 teczek w stosie, zakladki po prawej, jedna
// teczka otwarta naraz. Wybor wariantu to natywne radio - wyglada jak odreczny
// krzyzyk, ale klawiatura i czytnik ekranu dostaja zwykly formularz.
//
// Anty-spec 06 F2: TU NIE MA ZADNEJ OCENY. Klucz odpowiedzi nie trafia do DOM,
// zaznaczenie niczego nie zapala. Jedyny wyjatek dopuszczony przez spec to
// pytanie 14 (znacznik dla signature `skala-twardosci`, zart, nie ocena).

const WARIANTY = ["A", "B", "C", "D"] as const;
const OSTATNIA = pytania.length;

type Odpowiedzi = Record<number, string>;

function numer(n: number): string {
  return String(n).padStart(2, "0");
}

export default function Segregator() {
  const [otwarta, ustawOtwarta] = useState(1);
  const [odpowiedzi, ustawOdpowiedzi] = useState<Odpowiedzi>({});
  const naglowek = useRef<HTMLHeadingElement>(null);
  const fokusNaTeczke = useRef(false);

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

    ustawOdpowiedzi({ ...(czytajStan()?.quiz?.odpowiedzi ?? {}), ...zDom });
  }, []);

  // Z9: po zmianie teczki fokus ląduje na jej naglowku, ale tylko gdy zmiane
  // wywolala klawiatura albo przycisk nawigacji - nie kradniemy fokusu na starcie.
  useEffect(() => {
    if (!fokusNaTeczke.current) return;
    fokusNaTeczke.current = false;
    naglowek.current?.focus();
  }, [otwarta]);

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

  const p = pytania[otwarta - 1];
  const wpis = odpowiedzi[p.id] ?? "";
  const Sig = SIGNATURE[p.signature];

  return (
    <div className="segregator" data-segregator="" onKeyDown={naKlawisz}>
      <ol className="segregator__zakladki" data-zakladki="">
        {pytania.map((q) => (
          <li key={q.id}>
            <button
              type="button"
              className="zakladka"
              data-zakladka={q.id}
              data-otwarta={q.id === otwarta ? "tak" : "nie"}
              data-wypelniono={odpowiedzi[q.id] ? "tak" : "nie"}
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

      {/* key = numer teczki: remontaz odpala 2-klatkowe rozlozenie od nowa */}
      <section key={p.id} className="teczka formularz-F7" data-teczka={p.id}>
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
              onChange={(e) => zapisz(p.id, e.target.value)}
            />
          </p>
        ) : (
          <ul className="teczka__warianty" data-warianty="">
            {WARIANTY.map((w) => (
              <li key={w}>
                <label className="wariant" data-wariant-etykieta={w}>
                  <input
                    className="tylko-dla-czytnika"
                    type="radio"
                    name={`pytanie-${p.id}`}
                    value={w}
                    data-wariant={w}
                    checked={wpis === w}
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
                </label>
              </li>
            ))}
          </ul>
        )}

        {/* Signature pytania (plan/06 D). Pytania bez wpisu w rejestrze maja pusty
            slot do czasu swojego issue. Dla pytania 14 znacznik trafienia jest tutaj:
            signature `skala-twardosci` ma na nim blysnac (jedyny dopuszczony sygnal
            poprawnosci, 06 F2). */}
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
          <button
            type="button"
            data-nastepna=""
            disabled={otwarta === OSTATNIA}
            onClick={() => otworz(otwarta + 1)}
          >
            NASTĘPNA TECZKA
          </button>
        </p>
      </section>
    </div>
  );
}
