"use client";

import type { PointerEvent as ZdarzenieWskaznika, KeyboardEvent as ZdarzenieKlawisza } from "react";
import Pieczatka from "@/components/Pieczatka";

// Fiszka z zalozeniem zadania (plan/05 A3). Zalozenia NIE moga byc blokiem <p>
// (anty-spec 05 D1) - kandydat je fizycznie przenosi na arkusz.

export type Zalozenie = { id: string; tekst: string };

export default function KartaDowodowa({
  zalozenie,
  indeks,
  wSlocie,
  podniesiona,
  wraca,
  onPointerDown,
  onClick,
  onKeyDown,
  onAnimationEnd,
}: {
  zalozenie: Zalozenie;
  indeks: number;
  wSlocie: boolean;
  podniesiona: boolean;
  wraca: boolean;
  onPointerDown?: (e: ZdarzenieWskaznika<HTMLDivElement>) => void;
  onClick?: () => void;
  onKeyDown?: (e: ZdarzenieKlawisza<HTMLDivElement>) => void;
  onAnimationEnd?: () => void;
}) {
  const klasy = [
    "karta-dowodowa",
    wSlocie ? "karta-dowodowa--zalaczona" : "",
    podniesiona ? "karta-dowodowa--podniesiona" : "",
    wraca ? "karta-dowodowa--powrot ceremonia" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={klasy}
      data-karta={zalozenie.id}
      data-zalaczona={wSlocie ? "tak" : "nie"}
      role="button"
      tabIndex={0}
      aria-pressed={podniesiona}
      style={{
        // w slocie karta lezy lekko krzywo (05 A3), poza slotem ma wlasny przechyl
        "--przechyl": `${wSlocie ? ((indeks % 3) - 1) * 2 : ((indeks * 5) % 7) - 3}deg`,
      } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onAnimationEnd={onAnimationEnd}
    >
      <span className="karta-dowodowa__tekst">{zalozenie.tekst}</span>
      {wSlocie && (
        <span className="karta-dowodowa__stempel">
          <Pieczatka tekst="ZAŁ." ton="urzad" obrocDeg={-8} />
        </span>
      )}
    </div>
  );
}
