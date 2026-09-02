"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import komisja from "@/data/komisja.json";
import Ozdoba from "@/components/scena/Ozdoba";
import PasGoniec from "@/components/scena/PasGoniec";
import { wyczyscStan } from "@/lib/stan";

// Krok 4 ceremonii i list w butelce (plan/08 C krok 4, plan/08 D).
//
// Pergamin NIE jest przekrzywiony (anty-spec plan/08 F punkt 3) - rozwija sie
// samym `max-height`, zero konfetti, zero fajerwerkow.

export default function ListWButelce({
  email,
  punktyEgzamin,
  punktyQuiz,
}: {
  email: string;
  punktyEgzamin: number;
  punktyQuiz: number;
}) {
  const [otwarty, ustawOtwarty] = useState(false);
  const router = useRouter();

  return (
    <div className="butelka-blok">
      <span
        className="butelka"
        data-butelka
        role="button"
        tabIndex={0}
        aria-label="Otwórz list w butelce, Aleksandro"
        aria-expanded={otwarty}
        onClick={() => ustawOtwarty(true)}
        onKeyDown={(z) => {
          // role="button" na <span> nie dostaje aktywacji klawiatura za darmo
          if (z.key === "Enter" || z.key === " ") {
            z.preventDefault();
            ustawOtwarty(true);
          }
        }}
      >
        <Ozdoba id="stwor-butelka" klasa="butelka__gif" pierwszyEkran />
      </span>
      <PasGoniec tekst="KLIKNIJ BUTELKĘ, ALEKSANDRO" czas={9000} />

      {otwarty ? (
        <section className="druk pergamin" data-pergamin>
          <p className="druk__naglowek">
            PISMO KOŃCOWE - TAJNE - DO RĄK WŁASNYCH ALEKSANDRY
          </p>
          <p className="pergamin__adres" data-pergamin-email>
            ADRES ZWROTNY: {email}
          </p>
          <ul className="pergamin__wynik">
            <li>ETAP 1, EGZAMIN: {punktyEgzamin}/20</li>
            <li>ETAP 2, QUIZ: {punktyQuiz}/15</li>
            <li data-suma>RAZEM: {punktyEgzamin + punktyQuiz}/35</li>
          </ul>
          <p className="pergamin__zamkniecie">{komisja.pismoKoncowe}</p>
          <button
            className="druk__cta"
            type="button"
            data-cta="od-nowa"
            onClick={() => {
              wyczyscStan();
              router.push("/");
            }}
          >
            OD NOWA
          </button>
        </section>
      ) : null}
    </div>
  );
}
