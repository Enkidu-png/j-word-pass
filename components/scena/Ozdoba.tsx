"use client";

import { assetPo } from "@/lib/assety";
import { uzyjKlatki } from "./uzyjKlatki";

// Jeden GIF z manifestu. Wymiary ida z manifestu w atrybutach width/height,
// nie w CSS (plan/03 C: plik zostaje w oryginalnej rozdzielczosci, inaczej
// strona skacze przy doladowaniu).
export default function Ozdoba({
  id,
  klasa,
  opoznienie,
  niosaTresc = false,
  pierwszyEkran = false,
}: {
  id: string;
  klasa?: string;
  opoznienie?: string;
  niosaTresc?: boolean;
  pierwszyEkran?: boolean;
}) {
  const pozycja = assetPo(id);
  const zrodlo = uzyjKlatki(pozycja);

  return (
    <img
      data-ozdoba={id}
      src={zrodlo}
      width={pozycja.szerokosc}
      height={pozycja.wysokosc}
      // Z10 i F6-01: ozdobnik jest niewidoczny dla czytnika, chyba ze niesie tresc.
      alt={niosaTresc ? pozycja.opis : ""}
      aria-hidden={niosaTresc ? undefined : true}
      loading={pierwszyEkran ? "eager" : "lazy"}
      decoding="async"
      className={klasa ? `ozdoba ${klasa}` : "ozdoba"}
      style={opoznienie ? { animationDelay: opoznienie } : undefined}
    />
  );
}
