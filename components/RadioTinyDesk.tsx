"use client";

import { useEffect, useRef, useState } from "react";
import Pas from "@/components/scena/Pas";

// RADIO KOMISJI (plan/09). Odtwarzacz YouTube jest WIDOCZNY i ma minimum
// 200x200 px - ukrycie go lamaloby dokladnie ten regulamin, ktorym uzasadniamy
// osadzenie zamiast pliku audio w repo (plan/09 A).
//
// Skrypt `iframe_api` to jedyny dozwolony skrypt zewnetrzny w projekcie
// (wyjatek od Z14). Laduje sie DOPIERO po gescie Aleksandry, wiec przed
// kliknieciem `WLACZ` nie leci ani jedno zadanie do YouTube.

// F9-05: trzy materialy zamiast jednego, kolejnosc wiazaca (plan/11 F9-05).
const KANALY = [
  { id: "oCcks-fwq2c", nazwa: "POST MALONE, TINY DESK CONCERT, NPR MUSIC" },
  { id: "RLmx3KMNuRM", nazwa: "TOP GUN NIESIOŁOWICE, CZASEM ŁOWIĘ RYBY" },
  { id: "wj2jITPprLw", nazwa: "TAK PUSZYSTY JAK ALMETTE, EBR CYPISZ" },
];
const HOST = "https://www.youtube-nocookie.com";
const API = "https://www.youtube.com/iframe_api";
const tytulRamki = (nr: number) => `Odtwarzacz radia Komisji: ${KANALY[nr].nazwa}`;
const CZAS_NA_GOTOWOSC = 5000;
const KLUCZ_AUDIO = "jwp.audio";
const KLUCZ_GLOSNOSCI = "jwp.glosnosc";
const KLUCZ_KANALU = "jwp.kanal";

type Odtwarzacz = {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (n: number) => void;
  getPlayerState: () => number;
  getIframe: () => HTMLIFrameElement;
  // `load` startuje od razu, `cue` tylko podstawia - radio na pauzie ma zostac
  // na pauzie takze po zmianie materialu (Z15).
  loadVideoById: (id: string) => void;
  cueVideoById: (id: string) => void;
  getVideoData: () => { video_id: string };
};

type YT = {
  Player: new (
    el: HTMLElement,
    opcje: Record<string, unknown>,
  ) => Odtwarzacz;
};

declare global {
  interface Window {
    YT?: YT;
    onYouTubeIframeAPIReady?: () => void;
    // Uchwyt diagnostyczny: bez niego nie da sie sprawdzic `getPlayerState()`
    // z testu, bo odtwarzacz zyje w domknieciu komponentu (wzorzec `jwpAwaria`).
    jwpRadio?: Odtwarzacz;
  }
}

function czytajLiczbe(klucz: string, domyslna: number): number {
  try {
    const w = Number(window.localStorage.getItem(klucz));
    return Number.isFinite(w) && w >= 0 && w <= 100 ? w : domyslna;
  } catch {
    return domyslna;
  }
}

function zapisz(klucz: string, wartosc: string): void {
  try {
    window.localStorage.setItem(klucz, wartosc);
  } catch {
    // tryb prywatny: radio dziala, tylko nie pamieta ustawien
  }
}

export default function RadioTinyDesk() {
  const [gra, ustawGranie] = useState(false);
  const [gotowy, ustawGotowosc] = useState(false);
  const [awaria, ustawAwarie] = useState(false);
  const [wznowienie, ustawWznowienie] = useState(false);
  // Odtwarzacz montuje sie RAZ i zostaje. Odmontowanie go przy `WYLACZ`
  // kasowaloby iframe razem ze stanem: pauza nie mialaby czego zatrzymac,
  // a ponowne `WLACZ` startowaloby koncert od poczatku.
  const [zamontowany, ustawZamontowany] = useState(false);
  const [glosnosc, ustawGlosnosc] = useState(60);
  const [kanal, ustawKanal] = useState(0);
  // Odtwarzacz powstaje w efekcie po klikniecie WLACZ, wiec domkniecie zlapaloby
  // stan sprzed kliku. Ref zawsze niesie aktualny numer materialu.
  const kanalRef = useRef(0);
  kanalRef.current = kanal;
  const gniazdo = useRef<HTMLDivElement>(null);
  const odtwarzacz = useRef<Odtwarzacz | null>(null);
  const jestGotowy = useRef(false);

  // Wejscie na strone z zapisanym `on` NIE startuje dzwieku samo (Z15,
  // plan/09 C): przegladarki i tak by to zablokowaly, a Komisja nie krzyczy
  // bez pozwolenia. Zamiast tego prosi o klikniecie.
  useEffect(() => {
    ustawGlosnosc(czytajLiczbe(KLUCZ_GLOSNOSCI, 60));
    try {
      const zapisany = KANALY.findIndex((k) => k.id === window.localStorage.getItem(KLUCZ_KANALU));
      if (zapisany >= 0) ustawKanal(zapisany);
      if (window.localStorage.getItem(KLUCZ_AUDIO) === "on") ustawWznowienie(true);
    } catch {
      // jw.
    }
  }, []);

  const zbudujOdtwarzacz = () => {
    if (!gniazdo.current || !window.YT) return;
    odtwarzacz.current = new window.YT.Player(gniazdo.current, {
      // Bez jawnego `host` przy nocookie `onReady` nigdy nie przychodzi
      // i radio zawsze wpada w tryb awaryjny (plan/09 A).
      host: HOST,
      videoId: KANALY[kanalRef.current].id,
      width: 260,
      height: 200,
      playerVars: {
        enablejsapi: 1,
        playsinline: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          jestGotowy.current = true;
          ustawGotowosc(true);
          odtwarzacz.current?.setVolume(glosnosc);
          odtwarzacz.current?.playVideo();
          // YT wstawia wlasny tytul filmu - dostepnosc wymaga naszego (plan/09 D3)
          odtwarzacz.current?.getIframe()?.setAttribute("title", tytulRamki(kanalRef.current));
          window.jwpRadio = odtwarzacz.current ?? undefined;
        },
      },
    });
    // Brak sieci albo blokada YouTube: po pieciu sekundach bez `onReady`
    // ekran mowi wprost, ze radio milczy (plan/09 C).
    setTimeout(() => {
      if (!jestGotowy.current) ustawAwarie(true);
    }, CZAS_NA_GOTOWOSC);
  };

  // Skrypt i odtwarzacz powstaja w efekcie, nie w handlerze kliku: `gniazdo`
  // dostaje wezel dopiero po renderze, ktory ten klik dopiero zamowil.
  useEffect(() => {
    if (!zamontowany || odtwarzacz.current) return;
    if (window.YT?.Player) {
      zbudujOdtwarzacz();
      return;
    }
    window.onYouTubeIframeAPIReady = zbudujOdtwarzacz;
    const skrypt = document.createElement("script");
    skrypt.src = API;
    skrypt.async = true;
    document.body.appendChild(skrypt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zamontowany]);

  const wlacz = () => {
    ustawGranie(true);
    ustawWznowienie(false);
    zapisz(KLUCZ_AUDIO, "on");
    if (odtwarzacz.current) {
      odtwarzacz.current.playVideo();
      return;
    }
    ustawZamontowany(true);
  };

  // Przelaczanie w petli: z trzeciego materialu na pierwszy i odwrotnie.
  // Przed pierwszym WLACZ zmienia sam podpis - odtwarzacza jeszcze nie ma,
  // wiec zadne zadanie do YouTube nie leci (Z15, plan/09 A).
  const przelacz = (kierunek: 1 | -1) => {
    const nowy = (kanal + kierunek + KANALY.length) % KANALY.length;
    ustawKanal(nowy);
    kanalRef.current = nowy;
    zapisz(KLUCZ_KANALU, KANALY[nowy].id);
    const o = odtwarzacz.current;
    if (!o) return;
    if (gra) o.loadVideoById(KANALY[nowy].id);
    else o.cueVideoById(KANALY[nowy].id);
    o.getIframe()?.setAttribute("title", tytulRamki(nowy));
  };

  const wylacz = () => {
    ustawGranie(false);
    zapisz(KLUCZ_AUDIO, "off");
    odtwarzacz.current?.pauseVideo();
  };

  return (
    <div className="radio" data-radio>
      <p className="radio__marka">RADIO KOMISJI</p>

      <div className="radio__ekran" data-radio-ekran>
        {zamontowany ? (
          <div ref={gniazdo} data-radio-gniazdo />
        ) : (
          <p className="radio__napis">
            {awaria
              ? "RADIO MILCZY. KOMISJA PRZEPRASZA, ALEKSANDRO."
              : wznowienie
                ? "KLIKNIJ, ABY WZNOWIĆ"
                : "KLIKNIJ WŁĄCZ, ALEKSANDRO"}
          </p>
        )}
        {zamontowany && awaria ? (
          <p className="radio__napis" data-radio-awaria>
            RADIO MILCZY. KOMISJA PRZEPRASZA, ALEKSANDRO.
          </p>
        ) : null}
      </div>

      <div className="radio__strojenie" data-radio-strojenie>
        <Pas id="pas-cienki" pozycja="gora" wysokosc={14} />
        <span className="radio__kreska" data-gra={gra && gotowy ? "tak" : "nie"} />
      </div>

      <button
        className="radio__przycisk"
        type="button"
        data-radio-cta
        onClick={gra ? wylacz : wlacz}
      >
        {gra ? "WYŁĄCZ" : "WŁĄCZ"}
      </button>

      {/* Strzalki w osobnym rzedzie POD WLACZ: obudowa ma na 390 px 220 px
          szerokosci, wiec trzy przyciski w jednej linii zawijaly sie krzywo
          (widac na zrzucie, nie w assercji). */}
      <div className="radio__strzalki">
        <button
          className="radio__przycisk radio__strzalka"
          type="button"
          data-radio-poprzedni
          aria-label="Poprzedni materiał w radiu Komisji"
          onClick={() => przelacz(-1)}
        >
          POPRZEDNI
        </button>
        <button
          className="radio__przycisk radio__strzalka"
          type="button"
          data-radio-nastepny
          aria-label="Następny materiał w radiu Komisji"
          onClick={() => przelacz(1)}
        >
          NASTĘPNY
        </button>
      </div>

      <label className="radio__suwak" htmlFor="radio-glosnosc">
        <span className="radio__podpis">GŁOŚNOŚĆ</span>
        <input
          id="radio-glosnosc"
          data-radio-glosnosc
          type="range"
          min="0"
          max="100"
          value={glosnosc}
          onChange={(z) => {
            const w = Number(z.target.value);
            ustawGlosnosc(w);
            zapisz(KLUCZ_GLOSNOSCI, String(w));
            odtwarzacz.current?.setVolume(w);
          }}
        />
      </label>

      <p className="radio__podpis" data-radio-nazwa>
        {KANALY[kanal].nazwa}
      </p>
      <a
        className="radio__zrodlo"
        href={`https://youtu.be/${KANALY[kanal].id}`}
        target="_blank"
        rel="noreferrer"
      >
        youtu.be/{KANALY[kanal].id}
      </a>
    </div>
  );
}
