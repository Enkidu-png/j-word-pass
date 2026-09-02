"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import pytania from "@/data/quiz.json";
import NapisObrazek from "@/components/scena/NapisObrazek";
import Ozdoba from "@/components/scena/Ozdoba";
import { dopasujOtwarte, policzQuiz, type Werdykt15 } from "@/lib/quiz";
import { czytajStan, zapiszStan, zapiszTeraz } from "@/lib/stan";

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

// Maszyna prawdy (plan/07 C): jeden werdykt co 500 ms, wiec 15 pytan miesci sie
// w 7500 ms, a z krokiem 4 w 7900 ms - pod kontraktowym limitem 9000 ms.
const CO_WERDYKT_MS = 500;
const KROK_4_MS = 400;
// Z11: przy zredukowanym ruchu cala ceremonia ma trwac 2000 ms (plan/07 D).
const CEREMONIA_ZREDUKOWANA_MS = 2000;

export default function Arkusz() {
  const [nr, ustawNr] = useState(1);
  const [odpowiedzi, ustawOdpowiedzi] = useState<Record<number, string>>({});
  const [faza, ustawFaze] = useState<"pisanie" | "potwierdzenie" | "ceremonia">("pisanie");
  const [odsloniete, ustawOdsloniete] = useState(0);
  const [krok4, ustawKrok4] = useState(false);
  const [rewizja, ustawRewizja] = useState(false);
  const werdykty = useRef<Record<number, Werdykt15>>({});
  const karta = useRef<HTMLDivElement>(null);
  const pierwszy = useRef(true);

  // Zaznaczenia wjezdzaja z sessionStorage dopiero po montazu: odczyt w pierwszym
  // renderze rozjechalby sie z HTML-em z serwera (ta sama pulapka co w F3-02).
  useEffect(() => {
    const zapisane = czytajStan()?.quiz;
    if (zapisane?.odpowiedzi) ustawOdpowiedzi(zapisane.odpowiedzi);
    // Powrot na /quiz po oddanym arkuszu: wynik odtworzony z sessionStorage,
    // bez powtarzania ceremonii (ta sama zasada co przy werdykcie egzaminu).
    if (zapisane?.punkty != null) {
      werdykty.current = policzQuiz(pytania, zapisane.odpowiedzi ?? {}).werdykty;
      ustawFaze("ceremonia");
      ustawOdsloniete(pytania.length);
      ustawKrok4(true);
    }
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

  // Werdykty wychodza po kolei, jeden co 500 ms (plan/07 C krok 2). Zapis punktow
  // i krok 4 wisza na ostatnim odslonietym, nie na osobnym timerze - dzieki temu
  // Escape (ktory odslania wszystko naraz) konczy ceremonie ta sama droga.
  useEffect(() => {
    if (faza !== "ceremonia" || odsloniete >= pytania.length) return;
    const zredukowany = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const co = zredukowany ? CEREMONIA_ZREDUKOWANA_MS / pytania.length : CO_WERDYKT_MS;
    const id = setTimeout(() => ustawOdsloniete((o) => o + 1), co);
    return () => clearTimeout(id);
  }, [faza, odsloniete]);

  useEffect(() => {
    if (faza !== "ceremonia" || odsloniete < pytania.length || krok4) return;
    const punkty = Object.values(werdykty.current).filter((w) => w === "prawda").length;
    zapiszTeraz({ quiz: { odpowiedzi, punkty } });
    // PassOMetr czyta stan przy zmianie sciezki, a tu sciezka sie nie zmienia.
    window.dispatchEvent(new Event("jwp:stan"));
    const id = setTimeout(() => ustawKrok4(true), KROK_4_MS);
    return () => clearTimeout(id);
  }, [faza, odsloniete, krok4, odpowiedzi]);

  // Escape: wszystkie werdykty naraz (plan/07 C). Slucha na oknie, bo fokus
  // w trakcie ceremonii moze siedziec gdziekolwiek.
  useEffect(() => {
    if (faza !== "ceremonia") return;
    const naEscape = (z: KeyboardEvent) => {
      if (z.key === "Escape") ustawOdsloniete(pytania.length);
    };
    window.addEventListener("keydown", naEscape);
    return () => window.removeEventListener("keydown", naEscape);
  }, [faza]);

  const oddaj = () => {
    werdykty.current = policzQuiz(pytania, odpowiedzi).werdykty;
    ustawFaze("ceremonia");
  };

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
  // Nasluch siedzi na oknie, nie na sekcji. Na sekcji dzialal tylko wtedy, kiedy
  // fokus przypadkiem wladowal sie do srodka: po wejsciu na /quiz activeElement
  // to <body>, wiec pierwsza strzalka nigdzie nie docierala (w dev maskowal to
  // podwojny efekt StrictMode, ktory fokusowal karte). Ta sama droga co naEscape.
  useEffect(() => {
    if (faza !== "pisanie") return;
    const naKlawisz = (z: KeyboardEvent) => {
      if (z.key !== "ArrowLeft" && z.key !== "ArrowRight") return;
      const cel = z.target as HTMLElement;
      if (cel instanceof HTMLInputElement && cel.type === "text") return;
      z.preventDefault();
      skocz(nr + (z.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", naKlawisz);
    return () => window.removeEventListener("keydown", naKlawisz);
  }, [faza, nr]);

  const pytanie = pytania[nr - 1];
  const wybrany = odpowiedzi[pytanie.id] ?? "";
  const bezOdpowiedzi = pytania.filter((p) => !(odpowiedzi[p.id] ?? "").trim()).length;
  const punkty = Object.entries(werdykty.current).filter(
    ([id, w]) => w === "prawda" && Number(id) <= odsloniete,
  ).length;
  const poCeremonii = faza === "ceremonia" && odsloniete >= pytania.length;
  // Werdykt pytania odslania sie dopiero, gdy maszyna do niego dojdzie.
  const werdyktOdsloniety = (id: number) =>
    faza === "ceremonia" && id <= odsloniete ? werdykty.current[id] : undefined;
  // Tryb rewizji (plan/07 C): dopiero po ceremonii i tylko na zadanie.
  const rewizjaWariantu = (litera: string) => {
    if (!rewizja) return undefined;
    if (pytanie.poprawna === litera) return "poprawna";
    return wybrany === litera ? "bledna" : undefined;
  };

  return (
    <section className="arkusz">
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
            <label
              className="karta__otwarte"
              data-rewizja={
                rewizja
                  ? dopasujOtwarte(wybrany, pytanie.kluczOtwarte)
                    ? "poprawna"
                    : "bledna"
                  : undefined
              }
            >
              <span className="karta__etykieta">ALEKSANDRO, WPISZ ODPOWIEDŹ</span>
              <input
                type="text"
                className="karta__pole"
                data-pole="otwarte"
                value={wybrany}
                readOnly={faza !== "pisanie"}
                onChange={(z) => zapisz(pytanie.id, z.target.value)}
              />
              {rewizja ? (
                <span className="karta__klucz" data-klucz>
                  ALEKSANDRO, KOMISJA UZNAJE: {(pytanie.kluczOtwarte ?? []).join(", ")}
                </span>
              ) : null}
            </label>
          ) : (
            <div className="karta__warianty" role="radiogroup" aria-label={pytanie.pytanie}>
              {LITERY.map((litera) => (
                <label
                  className="wariant"
                  key={litera}
                  data-wariant={litera}
                  data-wybrany={wybrany === litera ? "tak" : "nie"}
                  data-rewizja={rewizjaWariantu(litera)}
                >
                  <input
                    type="radio"
                    className="wariant__radio"
                    name={`pytanie-${pytanie.id}`}
                    value={litera}
                    checked={wybrany === litera}
                    disabled={faza !== "pisanie"}
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
              data-werdykt={werdyktOdsloniety(p.id)}
              aria-current={p.id === nr ? "true" : undefined}
              aria-label={`PYTANIE ${p.id}`}
              onClick={() => skocz(p.id)}
            >
              {p.id}
            </button>
          </li>
        ))}
      </ol>

      {nr === pytania.length && faza === "pisanie" ? (
        <button
          type="button"
          className="arkusz__oddaj"
          data-cta="oddaj-arkusz"
          onClick={() => (bezOdpowiedzi > 0 ? ustawFaze("potwierdzenie") : oddaj())}
        >
          ODDAJ ARKUSZ KOMISJI
        </button>
      ) : null}

      {faza === "potwierdzenie" ? (
        <div className="maszyna maszyna--pytanie" data-potwierdzenie role="alert">
          <p className="maszyna__tresc">
            ALEKSANDRO, PYTAŃ BEZ ODPOWIEDZI: {bezOdpowiedzi}. LICZĄ SIĘ JAKO BŁĘDNE.
          </p>
          <button type="button" className="arkusz__krok" data-cta="potwierdzam" onClick={oddaj}>
            POTWIERDZAM
          </button>
          <button
            type="button"
            className="arkusz__krok"
            data-cta="wracam"
            onClick={() => ustawFaze("pisanie")}
          >
            WRACAM
          </button>
        </div>
      ) : null}

      {faza === "ceremonia" ? (
        <div className="maszyna" data-maszyna aria-live="polite">
          <p className="maszyna__punkty" data-punkty>
            PUNKTY: {punkty} / {pytania.length}
          </p>
          {poCeremonii ? (
            <div className="maszyna__wynik">
              <Ozdoba id="ogien" klasa="maszyna__ogien" />
              <NapisObrazek
                tekst={`${punkty}/${pytania.length}`}
                wariant="chrom"
                klasa="maszyna__napis"
              />
              <Ozdoba id="ogien" klasa="maszyna__ogien" />
            </div>
          ) : null}
          {poCeremonii && krok4 ? (
            <div className="maszyna__kroki">
              <button
                type="button"
                className="arkusz__krok"
                data-cta="obejrzyj-arkusz"
                onClick={() => ustawRewizja((r) => !r)}
              >
                {rewizja ? "SCHOWAJ ARKUSZ" : "OBEJRZYJ ARKUSZ"}
              </button>
              <Link className="arkusz__krok" href="/proba-ognia" data-cta="do-etapu-3">
                PRZEJDŹ DO PRÓBY OGNIA
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
