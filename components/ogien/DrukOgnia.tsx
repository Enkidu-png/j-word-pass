"use client";

import { useEffect, useRef, useState } from "react";
import ListWButelce from "@/components/ogien/ListWButelce";
import Ozdoba from "@/components/scena/Ozdoba";
import { czytajStan, zapiszTeraz } from "@/lib/stan";

// Druk OGN-3/TAJ plus walidacja stemplami (plan/08 A punkty 5-7, plan/08 B).
//
// Walidacja jest STEMPLEM, nie czerwona obwodka (anty-spec plan/08 F punkt 2):
// bledne pole dostaje pod soba komunikat Komisji, a caly druk drga w poziomie.
// Drganie to wylacznie `translateX` - obrot i skos sa zakazane (Z6).

// Ceremonia spalenia (plan/08 C). Progi liczone od kliku, nie sklejane
// z opoznien - inaczej kazdy timer nakladalby swoj blad na nastepny.
const KROKI = { ogien: 900, popiol: 2400, butelka: 3200 };
const KROKI_SKROCONE = { ogien: 300, popiol: 300, butelka: 600 };
const POPIOL = Array.from({ length: 20 }, (_, i) => i);
const OGNIE_CEREMONII = Array.from({ length: 8 }, (_, i) => i);

type Faza = "druk" | "skladanie" | "ogien" | "popiol" | "butelka";

const WZOR_ADRESU = /.+@.+\..+/;
const BUT_MIN = 10;
const BUT_MAX = 70;
const UCHO_MIN = 5;
const UCHO_MAX = 500;
const UCHO_PODZIW = 150;

const STEMPLE = {
  email: "ALEKSANDRO, TO NIE JEST ADRES",
  but: `ROZMIAR POZA SKALĄ KOMISJI (${BUT_MIN}-${BUT_MAX})`,
  ucho: `ŚREDNICA POZA SKALĄ KOMISJI (${UCHO_MIN}-${UCHO_MAX})`,
};

type Pole = keyof typeof STEMPLE;

// Puste pole liczbowe tez jest poza skala - Komisja nie przyjmuje druku z luka.
const pozaSkala = (wartosc: string, min: number, max: number) => {
  const liczba = Number(wartosc);
  return wartosc.trim() === "" || Number.isNaN(liczba) || liczba < min || liczba > max;
};

export default function DrukOgnia() {
  const [email, ustawEmail] = useState("");
  const [but, ustawBut] = useState("");
  const [ucho, ustawUcho] = useState("");
  const [pokora, ustawPokore] = useState(false);
  const [bledy, ustawBledy] = useState<Pole[]>([]);
  const [drga, ustawDrganie] = useState(false);
  const [faza, ustawFaze] = useState<Faza>("druk");
  const [ulotna, ustawUlotna] = useState(false);
  const [punkty, ustawPunkty] = useState({ egzamin: 0, quiz: 0 });
  const poleEmail = useRef<HTMLInputElement>(null);
  const timery = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Powrot na /proba-ognia po wyslaniu: od razu butelka, ZERO ponownego POST
  // (plan/08 D). Odczyt sessionStorage dopiero po montazu, inaczej rozjazd
  // hydracji z HTML-em z serwera, ktory tego stanu nie zna.
  useEffect(() => {
    const stan = czytajStan();
    ustawPunkty({ egzamin: stan?.egzamin?.punkty ?? 0, quiz: stan?.quiz?.punkty ?? 0 });
    if (stan?.ogien?.wyslano === true) {
      ustawEmail(stan.ogien.email ?? "");
      ustawFaze("butelka");
    }
  }, []);

  // Escape w krokach 1-3 skaczy do butelki (plan/08 C).
  useEffect(() => {
    if (faza === "druk" || faza === "butelka") return;
    const naKlawisz = (z: KeyboardEvent) => {
      if (z.key !== "Escape") return;
      timery.current.forEach(clearTimeout);
      timery.current = [];
      ustawFaze("butelka");
    };
    window.addEventListener("keydown", naKlawisz);
    return () => window.removeEventListener("keydown", naKlawisz);
  }, [faza]);

  useEffect(() => () => timery.current.forEach(clearTimeout), []);

  const podziw =
    !pozaSkala(ucho, UCHO_MIN, UCHO_MAX) && Number(ucho) >= UCHO_PODZIW;

  const zloz = () => {
    const nowe: Pole[] = [];
    if (!WZOR_ADRESU.test(email)) nowe.push("email");
    if (pozaSkala(but, BUT_MIN, BUT_MAX)) nowe.push("but");
    if (pozaSkala(ucho, UCHO_MIN, UCHO_MAX)) nowe.push("ucho");
    ustawBledy(nowe);

    if (nowe.length > 0) {
      ustawDrganie(true);
      // Fokus wraca do pola, ktore Komisja odrzucila (plan/08 B).
      if (nowe.includes("email")) poleEmail.current?.focus();
      else document.querySelector<HTMLInputElement>(`[data-pole='${nowe[0]}']`)?.focus();
      return;
    }

    zapiszTeraz({
      ogien: { email, rozmiarButa: Number(but), srednicaUchaMm: Number(ucho) },
    });

    // Teatr rusza NATYCHMIAST i nie czeka na siec: Blob moze paść, a druk ma
    // spłonąć tak samo (plan/08 C krok 1 - POST leci rownolegle).
    const stan = czytajStan();
    const punktyEgzamin = stan?.egzamin?.punkty ?? 0;
    const punktyQuiz = stan?.quiz?.punkty ?? 0;
    ustawPunkty({ egzamin: punktyEgzamin, quiz: punktyQuiz });
    ustawFaze("skladanie");

    const skrot =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const kroki = skrot ? KROKI_SKROCONE : KROKI;
    timery.current = [
      setTimeout(() => ustawFaze("ogien"), kroki.ogien),
      setTimeout(() => ustawFaze("popiol"), kroki.popiol),
      setTimeout(() => ustawFaze("butelka"), kroki.butelka),
    ];

    wyslij({ email, rozmiarButa: Number(but), srednicaUchaMm: Number(ucho), punktyEgzamin, punktyQuiz });
  };

  // Jedno ponowienie i tyle. Druga porazka konczy sie stemplem o pamieci
  // ulotnej, a flaga `wyslano` NIE zapada - inaczej powrot na adres pokazalby
  // butelke po zgloszeniu, ktorego nikt nie zapisal.
  const wyslij = async (dane: Record<string, string | number>) => {
    for (let proba = 0; proba < 2; proba++) {
      try {
        const odp = await fetch("/api/zgloszenie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dane),
        });
        if (odp.ok) {
          zapiszTeraz({ ogien: { wyslano: true } });
          // PassOMetr czyta stan przy zmianie sciezki, a tu sciezka zostaje ta sama
          window.dispatchEvent(new Event("jwp:stan"));
          return;
        }
      } catch {
        // padniete lacze liczy sie jak 502 - obie drogi konczy stempel
      }
    }
    ustawUlotna(true);
  };

  if (faza !== "druk") {
    return (
      <div className="ceremonia" data-ceremonia data-faza={faza}>
        {faza === "ogien" ? (
          <div className="ceremonia__ognie" aria-hidden="true">
            {OGNIE_CEREMONII.map((i) => (
              <Ozdoba key={i} id="ogien" klasa="ceremonia__plomien" opoznienie={`${i * 60}ms`} />
            ))}
          </div>
        ) : null}

        {faza === "skladanie" || faza === "ogien" ? (
          <div className="ceremonia__druk druk" data-plonacy-druk>
            <p className="druk__naglowek">OGN-3/TAJ - WNIOSEK KOŃCOWY - ALEKSANDRA</p>
            <p className="ceremonia__adres">{email}</p>
          </div>
        ) : null}

        {faza === "popiol" ? (
          <div className="ceremonia__popiol" data-popiol aria-hidden="true">
            {POPIOL.map((i) => (
              <span
                key={i}
                className="popiol__ziarno"
                style={{ left: `${4 + i * 4.6}%`, animationDelay: `${i * 35}ms` }}
              />
            ))}
          </div>
        ) : null}

        <p className="ceremonia__opis" aria-live="polite">
          {faza === "butelka"
            ? "ALEKSANDRO, ZOSTAŁA BUTELKA."
            : "ALEKSANDRO, TWÓJ DRUK PŁONIE."}
        </p>

        {faza === "butelka" ? (
          <>
            {ulotna ? (
              <p className="stempel" data-ulotna role="alert">
                KOMISJA ZAPISAŁA W PAMIĘCI ULOTNEJ
              </p>
            ) : null}
            <ListWButelce
              email={email}
              punktyEgzamin={punkty.egzamin}
              punktyQuiz={punkty.quiz}
            />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className={`druk druk--ogien${drga ? " druk--drga" : ""}`}
      data-druk-ogien
      // Walidacja natywna wyłączona SWIADOMIE: przegladarka blokuje submit przy
      // type="email" i min/max, wiec onSubmit nigdy nie dochodzi, a kandydatka
      // dostaje szary dymek zamiast stempla Komisji (plan/08 B, anty-spec F2).
      noValidate
      onAnimationEnd={() => ustawDrganie(false)}
      onSubmit={(z) => {
        z.preventDefault();
        zloz();
      }}
    >
      <p className="druk__naglowek">OGN-3/TAJ - WNIOSEK KOŃCOWY - ALEKSANDRA</p>

      <label className="druk__etykieta" htmlFor="ogien-email">
        TWÓJ ADRES E-MAIL, ALEKSANDRO
      </label>
      <input
        className="druk__pole"
        id="ogien-email"
        name="email"
        data-pole="email"
        type="email"
        ref={poleEmail}
        value={email}
        onChange={(z) => ustawEmail(z.target.value)}
      />
      {bledy.includes("email") ? (
        <p className="stempel" data-stempel="email" role="alert">
          {STEMPLE.email}
        </p>
      ) : null}

      <div className="druk__wiersz">
        <div className="druk__kolumna">
          <label className="druk__etykieta" htmlFor="ogien-but">
            TWÓJ ROZMIAR BUTA
          </label>
          <input
            className="druk__pole"
            id="ogien-but"
            name="rozmiarButa"
            data-pole="but"
            type="number"
            min={BUT_MIN}
            max={BUT_MAX}
            value={but}
            onChange={(z) => ustawBut(z.target.value)}
          />
        </div>
        <Ozdoba id="stwor-but" klasa="druk__stwor" />
      </div>
      {bledy.includes("but") ? (
        <p className="stempel" data-stempel="but" role="alert">
          {STEMPLE.but}
        </p>
      ) : null}

      <div className="druk__wiersz">
        <div className="druk__kolumna">
          <label className="druk__etykieta" htmlFor="ogien-ucho">
            ŚREDNICA TWOJEGO UCHA W MILIMETRACH
          </label>
          <input
            className="druk__pole"
            id="ogien-ucho"
            name="srednicaUchaMm"
            data-pole="ucho"
            type="number"
            min={UCHO_MIN}
            max={UCHO_MAX}
            value={ucho}
            onChange={(z) => ustawUcho(z.target.value)}
          />
        </div>
        <Ozdoba id="stwor-ucho" klasa="druk__stwor" />
      </div>
      {bledy.includes("ucho") ? (
        <p className="stempel" data-stempel="ucho" role="alert">
          {STEMPLE.ucho}
        </p>
      ) : null}
      {podziw ? (
        <p className="stempel stempel--podziw" data-podziw aria-live="polite">
          KOMISJA WYRAŻA PODZIW
        </p>
      ) : null}

      <p className="klauzula">
        ALEKSANDRO, KOMISJA UPRZEDZA CIĘ, ŻE TEN DRUK SPŁONIE. PODPISUJĄC GO
        ZGADZASZ SIĘ NA OGIEŃ, NA DYM I NA TO, ŻE POPIÓŁ ZOSTANIE Z TOBĄ NA
        ZAWSZE. KOMISJA NIE ZWRACA DRUKÓW ANI NADZIEI.
      </p>
      <label className="klauzula__zgoda" htmlFor="ogien-pokora">
        <input
          id="ogien-pokora"
          name="pokora"
          data-pokora
          type="checkbox"
          checked={pokora}
          onChange={(z) => ustawPokore(z.target.checked)}
        />
        <span>Potwierdzam, że rozumiem powagę sytuacji.</span>
      </label>

      <button
        className="druk__cta"
        type="submit"
        data-cta="skladam"
        disabled={!pokora}
        aria-disabled={!pokora}
      >
        SKŁADAM WNIOSEK
      </button>
    </form>
  );
}
