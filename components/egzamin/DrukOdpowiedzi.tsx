"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import egzamin from "@/data/egzamin.json";
import komisja from "@/data/komisja.json";
import EkranLadowania from "@/components/scena/EkranLadowania";
import NapisObrazek from "@/components/scena/NapisObrazek";
import { czytajStan, zapiszStan, zapiszTeraz } from "@/lib/stan";

// Druk odpowiedzi i ceremonia oceny (plan/06 B punkty 8-9, plan/06 C).
//
// Wartosc pola startuje pusta i wjezdza z sessionStorage dopiero po montazu.
// Odczyt storage w pierwszym renderze rozjechalby sie z HTML-em z serwera,
// ktory tego stanu nie zna (blad hydracji z v1, plan/06 D).

const LIMIT = 8000;
const PROG_ALARMU = 7500;
const CO_DYMEK_MS = 700;
const KROK_4_MS = 400;
// Twardy limit wariantu `narada` z plan/04 F. Po nim ekran gasnie sam i to
// znaczy, ze model nie zdazyl - w odroznieniu od Escape, ktore gasi go wczesniej.
const LIMIT_NARADY_MS = 16000;
const PUSTKA =
  "ALEKSANDRO, PUSTKA TEŻ JEST ODPOWIEDZIĄ, ALE NIE NA TEN EGZAMIN.";

type Werdykt = { punkty: number; komentarz: string };

const losowy = <T,>(z: T[]): T => z[Math.floor(Math.random() * z.length)];

// Werdykt awaryjny: komentarz losowany z data/komisja.json, punkty z dolnego
// progu arkusza. Komisja jest laskawa (plan/02 E1), wiec awaria jej maszyny
// liczacej nie moze zatrzasnac Aleksandrze etapu 2.
function werdyktAwaryjny(): Werdykt {
  const kwestia = losowy(komisja.werdyktAwaryjny);
  return {
    punkty: egzamin.punktyMin,
    komentarz: `${kwestia.kto}: ${kwestia.tekst}`,
  };
}

export default function DrukOdpowiedzi() {
  const [odpowiedz, ustawOdpowiedz] = useState("");
  const [faza, ustawFaze] = useState<"pisanie" | "narada" | "werdykt">(
    "pisanie",
  );
  const [werdykt, ustawWerdykt] = useState<Werdykt | null>(null);
  const [dymek, ustawDymek] = useState(0);
  const [krok4, ustawKrok4] = useState(false);
  const wynik = useRef<Werdykt | null>(null);
  const startNarady = useRef(0);

  useEffect(() => {
    const zapisany = czytajStan()?.egzamin;
    if (zapisany?.odpowiedz) ustawOdpowiedz(zapisany.odpowiedz);
    // Powrot na /egzamin po zdanym etapie: werdykt odtworzony z sessionStorage,
    // zero ponownego pytania modelu (plan/06 C).
    if (zapisany?.punkty != null) {
      const odtworzony = {
        punkty: zapisany.punkty,
        komentarz: zapisany.komentarz ?? "",
      };
      wynik.current = odtworzony;
      ustawWerdykt(odtworzony);
      ustawFaze("werdykt");
      ustawKrok4(true);
    }
  }, []);

  // Dymki Komisji: jeden co 700 ms, minimum piec roznych zdazy sie pokazac
  // w minimalnych 3500 ms narady (plan/06 C krok 2).
  useEffect(() => {
    if (faza !== "narada") return;
    const id = setInterval(() => ustawDymek((d) => d + 1), CO_DYMEK_MS);
    return () => clearInterval(id);
  }, [faza]);

  const zapiszWerdykt = (w: Werdykt) => {
    wynik.current = w;
    ustawWerdykt(w);
    // Zero punktow zostaje TYLKO w pamieci komponentu. Zapisane przeszlyby
    // przez `etapUkonczony` (punkty != null) i otworzylyby quiz, a pusta
    // odpowiedz ma zostawiac bramke zamknieta (plan/02 E1).
    if (w.punkty >= egzamin.punktyMin) {
      zapiszTeraz({
        egzamin: { odpowiedz, punkty: w.punkty, komentarz: w.komentarz },
      });
      setTimeout(() => {
        ustawKrok4(true);
        // PassOMetr czyta stan przy zmianie sciezki, a tu sciezka sie nie zmienia.
        window.dispatchEvent(new Event("jwp:stan"));
      }, KROK_4_MS);
    }
  };

  const oddaj = () => {
    if (odpowiedz.trim() === "") {
      zapiszWerdykt({ punkty: egzamin.punktyPuste, komentarz: PUSTKA });
      ustawFaze("werdykt");
      return;
    }
    zapiszTeraz({ egzamin: { odpowiedz } });
    startNarady.current = performance.now();
    ustawFaze("narada");
    fetch("/api/ocena", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ odpowiedz }),
    })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: Werdykt) => zapiszWerdykt(d))
      // brak klucza, 502, timeout, padniete lacze - kazda z tych drog konczy sie
      // werdyktem awaryjnym, a nie zawieszona ceremonia (plan/06 C)
      .catch(() => zapiszWerdykt(werdyktAwaryjny()));
  };

  const alarm = odpowiedz.length > PROG_ALARMU;
  const zamkniete = faza !== "pisanie";
  const zdane = werdykt != null && werdykt.punkty >= egzamin.punktyMin;

  return (
    <>
      <form
        className="druk druk--odpowiedz"
        onSubmit={(z) => {
          z.preventDefault();
          oddaj();
        }}
      >
        <p className="druk__naglowek">TWOJA ODPOWIEDŹ, ALEKSANDRO</p>
        <label className="druk__etykieta" htmlFor="odpowiedz">
          PISZ W RAMCE. KOMISJA CZYTA WSZYSTKO.
        </label>
        <textarea
          className="druk__pole"
          id="odpowiedz"
          name="odpowiedz"
          data-pole="odpowiedz"
          rows={10}
          maxLength={LIMIT}
          value={odpowiedz}
          readOnly={zamkniete}
          onChange={(z) => {
            ustawOdpowiedz(z.target.value);
            zapiszStan({ egzamin: { odpowiedz: z.target.value } });
          }}
        />
        <p
          className="druk__licznik"
          data-licznik-znakow
          data-alarm={alarm ? "tak" : "nie"}
        >
          ZNAKÓW: {odpowiedz.length} Z {LIMIT}
        </p>
        <button
          className="druk__cta"
          type="submit"
          data-cta="oddaj"
          disabled={zamkniete}
        >
          ODDAJ PRACĘ KOMISJI
        </button>
      </form>
      {faza === "narada" ? (
        <EkranLadowania
          wariant="narada"
          gotowe={werdykt != null}
          dymek={(() => {
            const k = komisja.ocenianie[dymek % komisja.ocenianie.length];
            return `${k.kto}: ${k.tekst}`;
          })()}
          naKoniec={() => {
            // Ekran gasnie z trzech powodow. Werdykt juz jest - pokazujemy go.
            // Wybil twardy limit 16 s - model nie zdazyl, idzie werdykt
            // awaryjny. Escape wczesniej - zostaje komunikat, ze Komisja
            // jeszcze obraduje, a werdykt wskoczy sam, gdy przyjdzie.
            if (
              wynik.current == null &&
              performance.now() - startNarady.current >= LIMIT_NARADY_MS
            ) {
              zapiszWerdykt(werdyktAwaryjny());
            }
            ustawFaze("werdykt");
          }}
        />
      ) : null}
      {/* Werdykt wchodzi dopiero po ceremonii. Renderowany juz w fazie
          `narada` pokazywalby wynik pod nakladka i konczyl etap po 300 ms,
          zamiast po kontraktowych 3500 ms (plan/06 C krok 2). */}
      {faza === "werdykt" ? (
        <section className="druk druk--werdykt" data-werdykt aria-live="polite">
          {werdykt == null ? (
            <p className="werdykt__obraduje" data-obraduje>
              KOMISJA JESZCZE OBRADUJE
            </p>
          ) : (
            <>
              <NapisObrazek
                tekst={zdane ? "ZDANE" : "NIEZDANE"}
                wariant="chrom"
                klasa="werdykt__napis"
              />
              <p className="werdykt__wynik" data-wynik>
                {werdykt.punkty}/{egzamin.punktyMax}
              </p>
              <p className="werdykt__komentarz" data-komentarz>
                {werdykt.komentarz}
              </p>
              {zdane && krok4 ? (
                <Link className="druk__cta" href="/quiz" data-cta="do-etapu-2">
                  PRZEJDŹ DO ETAPU 2
                </Link>
              ) : null}
            </>
          )}
        </section>
      ) : null}
    </>
  );
}
