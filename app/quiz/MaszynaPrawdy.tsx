"use client";

import LicznikMechaniczny from "@/components/LicznikMechaniczny";
import Pieczatka from "@/components/Pieczatka";
import type { Werdykt15 } from "@/lib/quiz";

// Maszyna prawdy (plan/06 B): obudowa z lejem, korba i wyjsciem na pieczatki.
// Sama nic nie liczy - dostaje gotowy werdykt biezacej teczki i licznik trafien.

const STEMPEL: Record<Werdykt15, { tekst: string; ton: "jad" | "alarm" }> = {
  prawda: { tekst: "PRAWDA", ton: "jad" },
  falsz: { tekst: "FAŁSZ", ton: "alarm" },
  pustka: { tekst: "PUSTKA", ton: "alarm" },
};

export default function MaszynaPrawdy({
  teczka,
  ostatni,
  trafienia,
  dymi,
}: {
  teczka: number; // numer teczki wpadajacej wlasnie do leja
  ostatni: Werdykt15 | null;
  trafienia: number;
  dymi: boolean; // krok 3: maszyna dymi i korba robi obrot honorowy
}) {
  const stempel = ostatni ? STEMPEL[ostatni] : null;
  return (
    <section
      className="maszyna formularz-F7"
      data-maszyna=""
      data-dymi={dymi ? "tak" : "nie"}
      data-ostatni={ostatni ?? ""}
      aria-live="polite"
    >
      <h2 className="maszyna__naglowek">MASZYNA PRAWDY /// PRACUJE</h2>
      <div className="maszyna__obudowa">
        <svg viewBox="0 0 120 90" className="maszyna__rysunek" role="img" aria-label="Maszyna prawdy">
          <path className="maszyna__lej" d="M20 6 H100 L74 34 H46 Z" />
          <rect className="maszyna__pudlo" x="24" y="34" width="72" height="44" />
          <circle className="maszyna__korba-os" cx="96" cy="56" r="4" />
          <path className={`maszyna__korba${dymi ? " ceremonia" : ""}`} d="M96 56 L96 42 L106 42" />
          <rect className="maszyna__wyjscie" x="34" y="78" width="52" height="8" />
        </svg>
        {dymi ? (
          <span className="maszyna__dym" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="maszyna__klab gif-less" style={{ animationDelay: `${i * 137}ms` }} />
            ))}
          </span>
        ) : (
          <span className="maszyna__teczka gif-less" data-teczka-w-locie={teczka} aria-hidden="true" />
        )}
      </div>

      <p className="maszyna__licznik">
        <span>TRAFIEŃ:</span> <LicznikMechaniczny wartosc={trafienia} szerokosc={2} />
      </p>

      {/* Pieczec wypada co 400 ms, wiec przez wiekszosc czasu widac ja w locie.
          Podpis pod nia trzyma werdykt czytelny takze w klatce posredniej. */}
      <p className="maszyna__stempel" data-stempel={ostatni ?? ""}>
        {stempel ? (
          <>
            <Pieczatka key={`${teczka}-${ostatni}`} tekst={stempel.tekst} ton={stempel.ton} obrocDeg={-8} />
            <span className="maszyna__podpis" data-podpis={ostatni ?? ""}>
              AKTA {String(teczka - 1).padStart(2, "0")} /// {stempel.tekst}
            </span>
          </>
        ) : null}
      </p>
    </section>
  );
}
