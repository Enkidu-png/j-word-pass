"use client";

import Ozdoba from "./Ozdoba";

export type Rog = "lewy-gora" | "prawy-gora" | "lewy-dol" | "prawy-dol";

// Wzorzec ROGI (plan/04 B): ta sama pozycja w dwoch przeciwleglych rogach,
// prawa odbita. scaleX(-1) to jedyny transform dozwolony przez Z6 punkt a.
export default function StworRogowy({
  id,
  rog,
  lustro = false,
}: {
  id: string;
  rog: Rog;
  lustro?: boolean;
}) {
  return (
    <span
      data-stwor={rog}
      className={`stwor-rogowy stwor-rogowy--${rog}${lustro ? " stwor-rogowy--lustro" : ""}`}
    >
      <Ozdoba id={id} />
    </span>
  );
}
