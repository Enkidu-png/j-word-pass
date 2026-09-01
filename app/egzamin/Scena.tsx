"use client";

import { useState } from "react";
import LicznikMechaniczny from "@/components/LicznikMechaniczny";

// Scena egzaminu (plan/05 A1): sala dryfujaca w kosmosie. Slon strzela przy
// kazdym najechaniu, zebry robia beczke. Wszystko SVG rysowane recznie -
// polityka kopiowania (02 F) przewiduje clip-arty CC0, ale gotowe elefanty
// z openclipart to wielopathowe rysunki, ktore i tak trzeba by przemapowac
// na plaskie wypelnienia i obrys 3px; recznie wychodzi krocej.

const NABOJE_START = 5000;
const ZEBR = 12;
const OFICERKA = 4; // ta z akademii wojskowej: czapka, dyplom, ruch pod prad

export default function Scena() {
  const [naboje, ustawNaboje] = useState(NABOJE_START);
  // klucz salwy: zmiana remontuje pociski i odrzut, wiec ceremonia startuje od nowa
  const [salwa, ustawSalwe] = useState(0);
  const [beczki, ustawBeczki] = useState<number[]>([]);

  function strzal() {
    // po wyczerpaniu magazynka slon robi przerwe techniczna i przeladowuje
    ustawNaboje((n) => (n === 0 ? NABOJE_START : n - 1));
    ustawSalwe((s) => s + 1);
  }

  return (
    <section className="scena kafel-tla kafel--kosmos" data-scena="" aria-label="Scena pojedynku">
      <div className="scena__licznik formularz-F7">
        <span className="scena__etykieta">NABOJE SŁONIA</span>
        {naboje === 0 ? (
          <strong className="scena__przerwa gif-less gif-less--blink">PRZERWA TECHNICZNA</strong>
        ) : (
          <LicznikMechaniczny wartosc={naboje} szerokosc={4} />
        )}
      </div>

      <div className="scena__slon" data-slon="" onMouseEnter={strzal}>
        {/* odrzut i salwa to ceremonia (Z8), majtanie zostaje na wewnetrznym SVG */}
        <span key={salwa} className={salwa > 0 ? "slon__odrzut ceremonia" : ""}>
          <svg className="slon gif-less gif-less--majtanie" viewBox="0 0 150 110" role="img"
               aria-label="Słoń z karabinem maszynowym na trąbie">
            <ellipse className="slon__cialo" cx="55" cy="50" rx="34" ry="26" />
            <rect className="slon__cialo" x="30" y="68" width="13" height="26" rx="3" />
            <rect className="slon__cialo" x="50" y="70" width="13" height="24" rx="3" />
            <rect className="slon__cialo" x="68" y="68" width="13" height="26" rx="3" />
            <path className="slon__kreska" d="M21 44q-12 6-7 18" />
            <circle className="slon__cialo" cx="96" cy="45" r="21" />
            <ellipse className="slon__ucho" cx="84" cy="38" rx="13" ry="16" />
            <circle className="slon__oko" cx="103" cy="37" r="3" />
            <path className="slon__traba" d="M104 60q12 12 4 26" />
            <path className="slon__kreska" d="M99 63l11 6" />
            <rect className="slon__karabin" x="103" y="82" width="40" height="9" rx="2" />
            <rect className="slon__karabin" x="108" y="91" width="10" height="10" />
            <rect className="slon__lufa" x="140" y="84" width="8" height="5" />
          </svg>
          {salwa > 0 &&
            [0, 1, 2].map((i) => (
              <span key={i} className="slon__pocisk ceremonia" style={{ top: `${72 + i * 6}px` }} />
            ))}
        </span>
      </div>

      <ul className="scena__stado">
        {Array.from({ length: ZEBR }, (_, i) => (
          <li
            key={i}
            className="scena__zebra"
            // rozrzut transformami zamiast pozycji z palca: kazda zebra inaczej
            style={{
              left: `${8 + ((i * 37) % 76)}%`,
              top: `${6 + ((i * 53) % 68)}%`,
              transform: `scale(${0.7 + ((i * 7) % 5) / 10})`,
            }}
          >
            {/* zewnetrzny element = dekoracja (skok), wewnetrzny = ceremonia (beczka) */}
            <span
              className="scena__skok gif-less gif-less--skok"
              style={{
                animationDelay: `${(i * 137) % 900}ms`,
                animationDirection: i === OFICERKA ? "reverse" : "normal",
              }}
            >
              <span
                className={beczki.includes(i) ? "zebra__beczka ceremonia" : ""}
                data-zebra={i}
                onMouseEnter={() => ustawBeczki((b) => (b.includes(i) ? b : [...b, i]))}
                onAnimationEnd={() => ustawBeczki((b) => b.filter((n) => n !== i))}
              >
                <Zebra oficerska={i === OFICERKA} delayMs={(i * 91) % 700} />
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Zebra({ oficerska, delayMs }: { oficerska: boolean; delayMs: number }) {
  return (
    <svg className="zebra" viewBox="0 0 96 64" role="img"
         aria-label={oficerska ? "Zebra w czapce oficerskiej z dyplomem" : "Zebra z jetpackiem"}>
      <rect className="zebra__jetpack" x="4" y="22" width="12" height="20" rx="3" />
      <path className="zebra__plomien gif-less gif-less--blink" style={{ animationDelay: `${delayMs}ms` }}
            d="M10 42l6 12-12 0z" />
      <rect className="zebra__cialo" x="16" y="20" width="46" height="24" rx="9" />
      <rect className="zebra__pas" x="25" y="21" width="7" height="22" />
      <rect className="zebra__pas" x="38" y="21" width="7" height="22" />
      <rect className="zebra__pas" x="50" y="21" width="7" height="20" />
      <rect className="zebra__cialo" x="54" y="14" width="12" height="16" />
      <rect className="zebra__cialo" x="58" y="4" width="17" height="16" rx="5" />
      <path className="zebra__grzywa" d="M54 16l6-8 4 6 5-7" />
      <circle className="zebra__oko" cx="69" cy="12" r="2.5" />
      <rect className="zebra__cialo" x="21" y="42" width="8" height="15" rx="2" />
      <rect className="zebra__cialo" x="33" y="42" width="8" height="15" rx="2" />
      <rect className="zebra__cialo" x="45" y="42" width="8" height="15" rx="2" />
      {oficerska && (
        <>
          <rect className="zebra__czapka" x="55" y="-1" width="23" height="7" rx="2" />
          <rect className="zebra__czapka" x="59" y="-7" width="14" height="6" rx="2" />
          <rect className="zebra__dyplom" x="14" y="44" width="20" height="8" rx="4" />
        </>
      )}
    </svg>
  );
}
