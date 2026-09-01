"use client";

import Link from "next/link";
import { etapUkonczony, type Etap } from "@/lib/stan";
import { usePathname } from "next/navigation";
import { uzyjStanu } from "./uzyjStanu";

// Straz kolejnosci etapow (plan/05 A2). BEZ przekierowania: adres zostaje ten
// sam, a kandydatka dostaje druk odmowny zamiast tresci etapu. Przekierowanie
// zjadloby URL i uniemozliwilo powrot przyciskiem wstecz.

const BRAMKI: Record<string, { wymaga: Etap; numer: string }> = {
  "/quiz": { wymaga: "egzamin", numer: "1" },
  "/proba-ognia": { wymaga: "quiz", numer: "2" },
};

const ADRESY: Record<Etap, string> = {
  egzamin: "/egzamin",
  quiz: "/quiz",
  ogien: "/proba-ognia",
};

export default function StrazEtapu({ children }: { children: React.ReactNode }) {
  const sciezka = usePathname();
  const { stan, zamontowany } = uzyjStanu();
  const bramka = BRAMKI[sciezka ?? ""];

  if (!bramka) return <>{children}</>;
  // Werdykt zyje w sessionStorage, wiec do montazu nie wiemy, czy wpuscic.
  // Nie renderujemy tresci etapu "na probe" - to pokazaloby quiz komus, kto go
  // nie odblokowal, przez jedna klatke.
  if (!zamontowany) return null;
  if (etapUkonczony(stan, bramka.wymaga)) return <>{children}</>;

  return (
    <div className="straz" role="alert">
      <p className="straz__tresc">ALEKSANDRO, KOMISJA ZABRANIA. NAJPIERW ETAP {bramka.numer}.</p>
      <Link className="straz__powrot" href={ADRESY[bramka.wymaga]}>
        WRÓĆ DO ETAPU {bramka.numer}
      </Link>
    </div>
  );
}
