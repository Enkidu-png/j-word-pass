"use client";

import { useEffect, useState } from "react";
import { czytajStan, zapiszStan } from "@/lib/stan";

// ponytail: tymczasowe pole dowodowe F2-04 (przezycie reloadu). Zastapi je
// arkusz formularz-F7 w F3-02.
export default function PoleRobocze() {
  const [odpowiedz, setOdpowiedz] = useState("");

  useEffect(() => {
    setOdpowiedz(czytajStan()?.egzamin?.odpowiedz ?? "");
  }, []);

  return (
    <input
      data-pole-robocze
      aria-label="Odpowiedź kandydata (robocza)"
      value={odpowiedz}
      onChange={(e) => {
        setOdpowiedz(e.target.value);
        zapiszStan({ egzamin: { odpowiedz: e.target.value } });
      }}
    />
  );
}
