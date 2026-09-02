"use client";

import { useEffect, useRef, useState } from "react";
import pytania from "@/data/quiz.json";
import Ozdoba from "@/components/scena/Ozdoba";
import { dopasujOtwarte } from "@/lib/quiz";
import { czytajStan, zapiszStan } from "@/lib/stan";

// ARKUSZ QUIZU (plan/07 A, D). Jedno pytanie na ekranie, rzad 15 kwadratow jako
// postep (plan/07 E2: zero cienkiej linii). Zero informacji o poprawnosci przed
// oddaniem arkusza (plan/07 E1) - komponent nie renderuje pola `poprawna`
// ani zadnej klasy, ktora by ja sugerowala.

// Ozdoba pytania: tabela plan/07 B. Piętnascie ROZNYCH id z manifestu, to jest
// caly wyroznik bliznaczych kart (S7). Reakcje na hover wariantow siedza w
// app/style/quiz.css, wybierane przez `data-karta` - CSS wystarczy, bo `:has`
// dosiega ozdobe stojaca PRZED wariantem w drzewie.
const OZDOBY: Record<number, string> = {
  1: "stwor-osmiornica",
  2: "planeta",
  3: "stwor-ptak",
  4: "stwor-mlotek",
  5: "stwor-slimak",
  6: "stwor-zegar",
  7: "stwor-kropla",
  8: "ogien",
  9: "stwor-kosc",
  10: "stwor-mysz",
  11: "stwor-dyskietka",
  12: "stwor-nuta",
  13: "stwor-kula-ziemska",
  14: "stwor-krysztal",
  15: "stwor-gwiazdka",
};

const LITERY = ["A", "B", "C", "D"] as const;

export default function Arkusz() {
  const [nr, ustawNr] = useState(1);
  const [odpowiedzi, ustawOdpowiedzi] = useState<Record<number, string>>({});
  const karta = useRef<HTMLDivElement>(null);
  const pierwszy = useRef(true);

  // Zaznaczenia wjezdzaja z sessionStorage dopiero po montazu: odczyt w pierwszym
  // renderze rozjechalby sie z HTML-em z serwera (ta sama pulapka co w F3-02).
  useEffect(() => {
    const zapisane = czytajStan()?.quiz?.odpowiedzi;
    if (zapisane) ustawOdpowiedzi(zapisane);
  }, []);

  // Po skoku na inne pytanie fokus idzie na karte. Bez tego fokus zostawal na
  // odmontowanym wariancie, ladowal na <body> i KOLEJNA strzalka juz nie
  // docieralaby do sekcji, czyli nawigacja klawiatura dzialalaby raz.
  useEffect(() => {
    if (pierwszy.current) {
      pierwszy.current = false;
      return;
    }
    karta.current?.focus();
  }, [nr]);

  const zapisz = (id: number, wartosc: string) => {
    const nowe = { ...odpowiedzi, [id]: wartosc };
    ustawOdpowiedzi(nowe);
    zapiszStan({ quiz: { odpowiedzi: nowe } });
  };

  const skocz = (docelowy: number) =>
    ustawNr(Math.min(pytania.length, Math.max(1, docelowy)));

  // Strzalki lewo/prawo przewracaja pytania (plan/07 D). Gora/dol NIE sa tu
  // ruszane - to natywna zmiana wariantu w grupie radio. W polu tekstowym
  // pytania 14 strzalki zostaja przy kursorze, inaczej nie dalo by sie
  // poprawic literowki w srodku wyrazu.
  const naKlawisz = (z: React.KeyboardEvent) => {
    if (z.key !== "ArrowLeft" && z.key !== "ArrowRight") return;
    const cel = z.target as HTMLElement;
    if (cel instanceof HTMLInputElement && cel.type === "text") return;
    z.preventDefault();
    skocz(nr + (z.key === "ArrowRight" ? 1 : -1));
  };

  const pytanie = pytania[nr - 1];
  const wybrany = odpowiedzi[pytanie.id] ?? "";

  return (
    <section className="arkusz" onKeyDown={naKlawisz}>
      <p className="arkusz__licznik" data-licznik-pytan>
        PYTANIE {String(nr).padStart(2, "0")} / {pytania.length}
        <Ozdoba id="nowe" klasa="arkusz__nowe" />
      </p>

      <div className="karta" data-karta={pytanie.id} tabIndex={-1} ref={karta}>
        {/* `data-blysk` to jedyna reakcja quizu na TRESC odpowiedzi przed oddaniem
            arkusza. Zamowiona wprost w tabeli plan/07 B (pytanie 14) i celowo
            bezimienna: nie mowi „dobrze", tylko blyska krysztalem. */}
        <div
          className="karta__ozdoba"
          data-blysk={
            pytanie.typ === "otwarte" && dopasujOtwarte(wybrany, pytanie.kluczOtwarte)
              ? "tak"
              : "nie"
          }
        >
          <Ozdoba id={OZDOBY[pytanie.id]} klasa="karta__gif" />
          {/* druga kopia ozdoby pytania 12, pokazywana na hover wariantu A */}
          {pytanie.id === 12 ? (
            <Ozdoba id={OZDOBY[12]} klasa="karta__gif karta__gif--kopia" />
          ) : null}
        </div>
        <div className="karta__tresc">
          <p className="karta__kategoria">{pytanie.kategoria}</p>
          <p className="karta__pytanie">{pytanie.pytanie}</p>

          {pytanie.typ === "otwarte" ? (
            <label className="karta__otwarte">
              <span className="karta__etykieta">ALEKSANDRO, WPISZ ODPOWIEDŹ</span>
              <input
                type="text"
                className="karta__pole"
                data-pole="otwarte"
                value={wybrany}
                onChange={(z) => zapisz(pytanie.id, z.target.value)}
              />
            </label>
          ) : (
            <div className="karta__warianty" role="radiogroup" aria-label={pytanie.pytanie}>
              {LITERY.map((litera) => (
                <label
                  className="wariant"
                  key={litera}
                  data-wariant={litera}
                  data-wybrany={wybrany === litera ? "tak" : "nie"}
                >
                  <input
                    type="radio"
                    className="wariant__radio"
                    name={`pytanie-${pytanie.id}`}
                    value={litera}
                    checked={wybrany === litera}
                    onChange={() => zapisz(pytanie.id, litera)}
                  />
                  <span className="wariant__litera">{litera}</span>
                  <span className="wariant__tekst">
                    {pytanie.warianty?.[litera] ?? ""}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="arkusz__nawigacja">
        <button
          type="button"
          className="arkusz__krok"
          data-krok="poprzednie"
          disabled={nr === 1}
          onClick={() => skocz(nr - 1)}
        >
          POPRZEDNIE
        </button>
        <button
          type="button"
          className="arkusz__krok"
          data-krok="nastepne"
          disabled={nr === pytania.length}
          onClick={() => skocz(nr + 1)}
        >
          NASTĘPNE
        </button>
      </div>

      <ol className="kwadraty" aria-label="POSTĘP ARKUSZA">
        {pytania.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="kwadrat"
              data-kwadrat={p.id}
              data-odpowiedziane={(odpowiedzi[p.id] ?? "").trim() ? "tak" : "nie"}
              data-biezacy={p.id === nr ? "tak" : "nie"}
              aria-current={p.id === nr ? "true" : undefined}
              aria-label={`PYTANIE ${p.id}`}
              onClick={() => skocz(p.id)}
            >
              {p.id}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
