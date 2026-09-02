"use client";

import { useEffect, useRef, useState } from "react";
import komisja from "@/data/komisja.json";
import { assetPo } from "@/lib/assety";
import { KLUCZ_WSTEPU, wstepPasuje } from "@/lib/wstep";
import NapisObrazek from "@/components/scena/NapisObrazek";
import Ozdoba from "@/components/scena/Ozdoba";
import Pas from "@/components/scena/Pas";
import PasGoniec from "@/components/scena/PasGoniec";

// BRAMA WSTEPU (F10-02). Pelnoekranowa nakladka PRZED ekranem ladowania,
// na wszystkich czterech widokach - dlatego siedzi w layoucie, nie na stronie.
//
// Nakladki NIE MA w HTML-u z serwera - serwer nie wie, czy petent ma wazny wpis,
// a nakladka w kazdym wydruku migalaby powracajacym i (co gorsza) siedziala
// w DOM-ie kazdego pomiaru sceny do konca hydracji. Zamiast tego tresc widoku
// jest UKRYTA arkuszem, dopoki <html> nie dostanie `data-wstep`: stawia go
// skrypt z <head> (app/layout.tsx) jeszcze PRZED malowaniem albo ten komponent
// po poprawnej odpowiedzi. Zaden kadr nie pokazuje wiec tresci bez wstepu.
//
// Pytanie i odpowiedz ida z data/komisja.json, w komponencie nie ma ani jednego
// z tych tekstow (kontrakt F10-02).

const OZDOBY = [
  { id: "stwor-klodka", opoznienie: "0ms" },
  { id: "stwor-reka", opoznienie: "140ms" },
  { id: "stwor-klepsydra", opoznienie: "280ms" },
];

// `nieznany` to stan przed montazem: serwer i pierwszy render klienta oddaja
// to samo (nic), wiec nie ma rozjazdu hydracji.
type Stan = "nieznany" | "zamknieta" | "otwarta";

export default function BramaWstepu() {
  const [stan, ustawStan] = useState<Stan>("nieznany");
  const [odrzucony, ustawOdrzucony] = useState(false);
  const pole = useRef<HTMLInputElement>(null);
  const nakladka = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let wazny = "";
    try {
      wazny = window.localStorage.getItem(KLUCZ_WSTEPU) ?? "";
    } catch {
      // tryb prywatny: petent odpowiada raz na wejscie, strona dziala
    }
    if (wazny) {
      przepusc(false);
      return;
    }
    ustawStan("zamknieta");
    // Fokus NIE wychodzi poza nakladke: Tab, Shift+Tab i klikniecie w tresc pod
    // spodem wracaja na pole. Jeden nasluch zamiast recznego cyklu po elementach.
    const trzymaj = (z: FocusEvent) => {
      if (!nakladka.current || nakladka.current.contains(z.target as Node)) return;
      pole.current?.focus();
    };
    document.addEventListener("focusin", trzymaj);

    // Sam `focusin` nie wystarcza: Shift+Tab z pierwszego elementu oddaje fokus
    // pasek przegladarki, `activeElement` schodzi na <body> i ZADNE zdarzenie
    // nie leci. Dlatego Tab na krancach cyklu zawracamy recznie.
    const zawroc = (z: KeyboardEvent) => {
      if (z.key !== "Tab" || !nakladka.current) return;
      const kroki = nakladka.current.querySelectorAll<HTMLElement>("input, button");
      const pierwszy = kroki[0];
      const ostatni = kroki[kroki.length - 1];
      if (!pierwszy || !ostatni) return;
      if (z.shiftKey && document.activeElement === pierwszy) {
        z.preventDefault();
        ostatni.focus();
      } else if (!z.shiftKey && document.activeElement === ostatni) {
        z.preventDefault();
        pierwszy.focus();
      }
    };
    document.addEventListener("keydown", zawroc);

    return () => {
      document.removeEventListener("focusin", trzymaj);
      document.removeEventListener("keydown", zawroc);
    };
  }, []);

  // Fokus laduje w polu dopiero, gdy pole ISTNIEJE - nakladka montuje sie
  // o jeden render pozniej niz zapada decyzja.
  useEffect(() => {
    if (stan === "zamknieta") pole.current?.focus();
  }, [stan]);

  // `data-wstep` na <html> zdejmuje blokade przewijania spod nakladki i chowa
  // ja przed pierwszym malowaniem przy kolejnych wejsciach.
  const przepusc = (zapisz: boolean) => {
    if (zapisz) {
      try {
        window.localStorage.setItem(KLUCZ_WSTEPU, komisja.wstep.odpowiedz);
      } catch {
        // jw. - brak zapisu znaczy tylko tyle, ze przy kolejnym wejsciu spytamy jeszcze raz
      }
    }
    document.documentElement.dataset.wstep = "1";
    ustawStan("otwarta");
    // Ekran ladowania czeka na ten sygnal, zeby nie ruszyc pod nakladka.
    window.dispatchEvent(new Event("jwp:wstep"));
  };

  const zloz = () => {
    if (!wstepPasuje(pole.current?.value ?? "", komisja.wstep.odpowiedz)) {
      ustawOdrzucony(true);
      pole.current?.focus();
      pole.current?.select();
      return;
    }
    przepusc(true);
  };

  if (stan !== "zamknieta") return null;

  const kafel = assetPo("kafel-brama");

  return (
    <div
      ref={nakladka}
      className="wstep"
      data-wstep-nakladka
      role="dialog"
      aria-modal="true"
      aria-label={komisja.wstep.naglowek}
      style={{ backgroundImage: `url("${kafel.plik}")` }}
    >
      <Pas id="pas-budowa" pozycja="gora" wysokosc={45} />

      <div className="wstep__druk druk">
        <h2 className="wstep__naglowek">
          <NapisObrazek tekst={komisja.wstep.naglowek} wariant="chrom" klasa="wstep__napis" />
        </h2>
        <p className="wstep__wstepniak">{komisja.wstep.wstepniak}</p>

        <ul className="wstep__ozdoby">
          {OZDOBY.map((o) => (
            <li key={o.id} className="wstep__pole">
              <Ozdoba id={o.id} klasa="wstep__ozdoba" opoznienie={o.opoznienie} pierwszyEkran />
            </li>
          ))}
        </ul>

        <form
          className="wstep__formularz"
          onSubmit={(z) => {
            z.preventDefault();
            zloz();
          }}
        >
          <label className="wstep__etykieta" htmlFor="wstep-odpowiedz">
            {komisja.wstep.pytanie}
          </label>
          <input
            ref={pole}
            id="wstep-odpowiedz"
            className="wstep__pole-tekst"
            data-pole="wstep"
            name="wstep"
            autoComplete="off"
            onChange={() => ustawOdrzucony(false)}
          />
          {odrzucony ? (
            <p className="wstep__stempel" data-stempel="wstep" role="alert">
              {komisja.wstep.stempel}
            </p>
          ) : null}
          <button className="wstep__cta druk__cta" type="submit" data-cta="wstep">
            {komisja.wstep.cta}
          </button>
        </form>
      </div>

      <div className="wstep__goniec">
        <PasGoniec tekst={komisja.gonce.gora} wariant="odbijany" czas={12000} />
      </div>
      <Pas id="pas-budowa" pozycja="dol" wysokosc={45} />
    </div>
  );
}
