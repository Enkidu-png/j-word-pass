"use client";

import { useState } from "react";

// Ognisko z plan/07 A: stos polan + 3 warstwy plomieni (steps(4), rozne delaye)
// + 6 iskier 3x3 w petli. Dwie klasy ruchu nie mieszaja sie (Z8): petla plomieni
// i iskier to `dekoracja`, wychylenie za kursorem i strzal iskra po fokusie pola
// to reakcje na uzytkownika (bez petli).
//
// `iskra` to licznik: rodzic podbija go przy fokusie pola, a zmiana `key`
// remontuje strzal i odpala animacje od nowa (ten sam wzorzec co Pieczatka).

const IZKRY = [0, 1, 2, 3, 4, 5];

export default function Ognisko({ iskra }: { iskra: number }) {
  // 0 = plomien klania sie w lewo, 1 = stoi, 2 = w prawo (1 z 3 klatek, plan/07 C)
  const [kierunek, ustawKierunek] = useState(1);

  return (
    <div
      className="ognisko"
      data-ognisko=""
      aria-hidden="true"
      onPointerMove={(e) => {
        const p = e.currentTarget.getBoundingClientRect();
        const u = (e.clientX - p.left) / p.width;
        ustawKierunek(u < 0.38 ? 0 : u > 0.62 ? 2 : 1);
      }}
      onPointerLeave={() => ustawKierunek(1)}
    >
      <svg viewBox="0 0 200 170" className="ognisko__svg">
        {/* polana: trzy belki na krzyz, plaskie wypelnienie i twardy obrys */}
        <g className="ognisko__polana">
          <rect x="30" y="132" width="140" height="16" rx="3" transform="rotate(-7 100 140)" />
          <rect x="30" y="132" width="140" height="16" rx="3" transform="rotate(7 100 140)" />
          <rect x="52" y="146" width="96" height="14" rx="3" />
        </g>

        <g className="ognisko__wychyl" data-kierunek={kierunek}>
          <path
            className="ognisko__plomien ognisko__plomien--zewnetrzny gif-less"
            d="M100 18 C126 58 148 78 148 104 C148 128 126 142 100 142 C74 142 52 128 52 104 C52 78 74 58 100 18 Z"
          />
          <path
            className="ognisko__plomien ognisko__plomien--srodkowy gif-less"
            d="M100 48 C118 76 132 90 132 108 C132 126 118 136 100 136 C82 136 68 126 68 108 C68 90 82 76 100 48 Z"
          />
          <path
            className="ognisko__plomien ognisko__plomien--rdzen gif-less"
            d="M100 78 C110 96 118 102 118 114 C118 126 110 132 100 132 C90 132 82 126 82 114 C82 102 90 96 100 78 Z"
          />
        </g>

        {/* iskry dekoracyjne: 6 kwadracikow 3x3 w petli, kazdy z wlasnym delayem */}
        <g className="ognisko__iskry">
          {IZKRY.map((i) => (
            <rect key={i} className="ognisko__iskra gif-less" data-iskra={i} width="3" height="3" x={62 + i * 15} y="112" />
          ))}
        </g>

        {/* strzal iskra na fokus pola (plan/07 C) - jednorazowy, nie petla */}
        {iskra > 0 && (
          <rect key={iskra} className="ognisko__strzal ceremonia" width="5" height="5" x="98" y="96" />
        )}
      </svg>
    </div>
  );
}
