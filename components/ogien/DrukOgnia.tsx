"use client";

import { useRef, useState } from "react";
import Ozdoba from "@/components/scena/Ozdoba";
import { zapiszTeraz } from "@/lib/stan";

// Druk OGN-3/TAJ plus walidacja stemplami (plan/08 A punkty 5-7, plan/08 B).
//
// Walidacja jest STEMPLEM, nie czerwona obwodka (anty-spec plan/08 F punkt 2):
// bledne pole dostaje pod soba komunikat Komisji, a caly druk drga w poziomie.
// Drganie to wylacznie `translateX` - obrot i skos sa zakazane (Z6).

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
  const [zlozony, ustawZlozony] = useState(false);
  const poleEmail = useRef<HTMLInputElement>(null);

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
      ogien: {
        email,
        rozmiarButa: Number(but),
        srednicaUchaMm: Number(ucho),
      },
    });
    // ponytail: F5-01 konczy sie na przyjeciu druku. Ceremonia spalenia i list
    // w butelce (plan/08 C, D) podpinaja sie tu w F5-02.
    ustawZlozony(true);
  };

  return (
    <form
      className={`druk druk--ogien${drga ? " druk--drga" : ""}`}
      data-druk-ogien
      // Walidacja natywna wyłączona SWIADOMIE: przegladarka blokuje submit przy
      // type="email" i min/max, wiec onSubmit nigdy nie dochodzi, a kandydatka
      // dostaje szary dymek zamiast stempla Komisji (plan/08 B, anty-spec F2).
      noValidate
      data-zlozony={zlozony ? "tak" : "nie"}
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
            ROZMIAR BUTA
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
            ŚREDNICA UCHA W MILIMETRACH
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
        <span>ALEKSANDRO, POTWIERDZAM, ŻE ROZUMIEM POWAGĘ SYTUACJI</span>
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
