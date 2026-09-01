"use client";

import { useEffect, useRef, useState } from "react";

// Szum urzedowy generowany proceduralnie przez WebAudio: bialy szum przez
// lowpass 400 Hz + losowy beep 880 Hz co 8-15 s. Zero plikow audio w repo.
//
// Z16: dzwiek NIGDY nie startuje sam. Preferencja siedzi w localStorage, ale
// nawet przy `jwp.audio=on` po odswiezeniu potrzebne jest jedno klikniecie -
// tak dziala polityka autoplay przegladarki i tak ma dzialac Komisja.

const KLUCZ_AUDIO = "jwp.audio";
const GLOSNOSC = 0.03;
const ODCIECIE_HZ = 400;
const BEEP_HZ = 880;
const BEEP_MS = 90;

type Aparatura = {
  ctx: AudioContext;
  wzmocnienie: GainNode;
  beep: ReturnType<typeof setTimeout> | null;
};

export default function RadioKomisji() {
  const [gra, ustawGra] = useState(false);
  const [zapamietane, ustawZapamietane] = useState(false);
  const aparat = useRef<Aparatura | null>(null);

  useEffect(() => {
    try {
      ustawZapamietane(window.localStorage.getItem(KLUCZ_AUDIO) === "on");
    } catch {
      // prywatne okno bez localStorage nie moze wywrocic strony
    }
  }, []);

  // sprzatanie przy odmontowaniu
  useEffect(() => () => zatrzymaj(), []);

  function zatrzymaj() {
    const a = aparat.current;
    if (!a) return;
    if (a.beep) clearTimeout(a.beep);
    // cisza natychmiastowa: gain na zero I zawieszony kontekst
    a.wzmocnienie.gain.value = 0;
    void a.ctx.close();
    aparat.current = null;
  }

  function zaplanujBeep(ctx: AudioContext, wyjscie: GainNode) {
    const za = 8000 + Math.random() * 7000; // 8-15 s
    const id = setTimeout(() => {
      if (!aparat.current) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = BEEP_HZ;
      g.gain.value = GLOSNOSC * 2;
      osc.connect(g).connect(wyjscie);
      osc.start();
      osc.stop(ctx.currentTime + BEEP_MS / 1000);
      zaplanujBeep(ctx, wyjscie);
    }, za);
    if (aparat.current) aparat.current.beep = id;
  }

  function wlacz() {
    const ctx = new AudioContext();

    // bialy szum: dwie sekundy losowych probek puszczone w petli
    const dlugosc = ctx.sampleRate * 2;
    const bufor = ctx.createBuffer(1, dlugosc, ctx.sampleRate);
    const probki = bufor.getChannelData(0);
    for (let i = 0; i < dlugosc; i++) probki[i] = Math.random() * 2 - 1;

    const zrodlo = ctx.createBufferSource();
    zrodlo.buffer = bufor;
    zrodlo.loop = true;

    const filtr = ctx.createBiquadFilter();
    filtr.type = "lowpass";
    filtr.frequency.value = ODCIECIE_HZ;

    const wzmocnienie = ctx.createGain();
    wzmocnienie.gain.value = GLOSNOSC;

    zrodlo.connect(filtr).connect(wzmocnienie).connect(ctx.destination);
    zrodlo.start();

    aparat.current = { ctx, wzmocnienie, beep: null };
    zaplanujBeep(ctx, wzmocnienie);
  }

  function przelacz() {
    if (gra) {
      zatrzymaj();
      ustawGra(false);
      ustawZapamietane(false);
      try {
        window.localStorage.setItem(KLUCZ_AUDIO, "off");
      } catch {}
      return;
    }
    wlacz();
    ustawGra(true);
    ustawZapamietane(true);
    try {
      window.localStorage.setItem(KLUCZ_AUDIO, "on");
    } catch {}
  }

  return (
    <div className="radio-komisji" data-radio="" data-gra={gra ? "tak" : "nie"}>
      <svg viewBox="0 0 90 50" role="img" aria-label="Radio Komisji" className="radio-komisji__obudowa">
        <rect x="1" y="1" width="88" height="48" className="radio-komisji__pudlo" />
        {/* kratka glosnika */}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1="8" y1={10 + i * 6} x2="52" y2={10 + i * 6} className="radio-komisji__kratka" />
        ))}
        <circle cx="70" cy="25" r="12" className="radio-komisji__galka" />
        <line x1="70" y1="25" x2={gra ? 78 : 62} y2="17" className="radio-komisji__wskaznik" />
      </svg>
      <button type="button" onClick={przelacz} data-radio-przycisk="">
        {gra ? "WYCISZAM RADIO KOMISJI" : "WŁĄCZAM SZUM URZĘDOWY"}
      </button>
      {zapamietane && !gra ? (
        <p className="radio-komisji__notka" data-radio-notka="">
          KOMISJA PAMIĘTA WYBÓR /// POTRZEBNE JEDNO KLIKNIĘCIE
        </p>
      ) : null}
    </div>
  );
}
