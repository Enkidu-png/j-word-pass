"use client";

import { assetPo } from "@/lib/assety";
import { uzyjKlatki } from "./uzyjKlatki";

// Waski GIF powtarzany na cala szerokosc. Wysokosc z propa jako styl inline -
// jedyny dozwolony inline w projekcie, bo wartosc pochodzi z manifestu (plan/04 C).
export default function Pas({
  id,
  pozycja: gdzie,
  wysokosc,
}: {
  id: string;
  pozycja: "gora" | "dol";
  wysokosc: number;
}) {
  const poz = assetPo(id);
  const zrodlo = uzyjKlatki(poz);

  return (
    <div
      data-pas={id}
      role="presentation"
      className={`pas pas--${gdzie}`}
      style={{ height: `${wysokosc}px`, backgroundImage: `url("${zrodlo}")` }}
    />
  );
}
