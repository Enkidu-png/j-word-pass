"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import EkranLadowania from "@/components/scena/EkranLadowania";
import PrzyciskUciekinier from "./PrzyciskUciekinier";

// Druk wstepny bramy (plan/05 B1 punkt 8). Imie jest wpisane na sztywno
// i readOnly - to zart dla jednej osoby, a nie formularz rejestracji.
//
// Ceremonia wejscia (plan/05 B3) siedzi tutaj, bo prowadza do niej DWA przyciski:
// glowny i skapitulowany uciekinier (plan/05 B2: „klik prowadzi na /egzamin tak
// samo jak przycisk glowny"). Fokus na `h1` strony docelowej przenosi
// FokusNaNaglowku z shellu, juz po zmianie sciezki.
export default function DrukWstepny() {
  const router = useRouter();
  const [ceremonia, ustawCeremonie] = useState(false);

  return (
    <form
      className="druk-wstepny"
      onSubmit={(zdarzenie) => {
        zdarzenie.preventDefault();
        ustawCeremonie(true);
      }}
    >
      <label className="druk-wstepny__etykieta" htmlFor="imie-kandydatki">
        IMIĘ KANDYDATKI
      </label>
      <input
        className="druk-wstepny__pole"
        id="imie-kandydatki"
        name="imie"
        data-pole="imie"
        value="ALEKSANDRA"
        readOnly
      />
      <button className="druk-wstepny__cta" type="submit" data-cta="przystepuje">
        PRZYSTĘPUJĘ DO ETAPU 1
      </button>
      <PrzyciskUciekinier naWejscie={() => ustawCeremonie(true)} />
      {ceremonia ? (
        <EkranLadowania wariant="start" naKoniec={() => router.push("/egzamin")} />
      ) : null}
    </form>
  );
}
